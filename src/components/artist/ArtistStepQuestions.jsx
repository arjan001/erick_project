import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const ACTOR_TAGS = [
  'Leading Role', 'Supporting Role', 'Character Actor', 'Voice Acting', 'Motion Capture',
  'Theater', 'Film', 'TV Series', 'Commercials', 'Improvisation',
  'Drama', 'Comedy', 'Action', 'Horror', 'Romance',
  'Method Acting', 'Classical Training', 'Shakespearean', 'Musical Theater', 'Physical Theater',
  'Stage Combat', 'Stunt Work', 'Dialect Coach', 'Accent Work', 'Multiple Languages'
];

const VOICE_ARTIST_TAGS = [
  'Narration', 'Character Voices', 'Audiobook', 'Commercial VO', 'Documentary',
  'Animation', 'Video Game', 'E-Learning', 'IVR Systems', 'Podcast',
  'Multiple Accents', 'Age Range', 'Vocal Effects', 'Singing', 'Impressions',
  'Home Studio', 'Professional Studio', 'Fast Turnaround', 'Script Writing', 'Audio Editing'
];

export default function ArtistStepQuestions({ data, updateData }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState(data.questionnaire_response?.tags || []);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    // For actors and voice artists, show tag selection instead
    if (data.role === 'actor') {
      setAvailableTags(ACTOR_TAGS);
    } else if (data.role === 'voice_artist') {
      setAvailableTags(VOICE_ARTIST_TAGS);
    } else {
      // For other roles, fetch AI questions
      fetchQuestions();
    }
  }, [data.role]);

  const fetchQuestions = async () => {
    if (!data.role) return;
    
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 professional questions for a ${data.role} applying to join a high-end production network. 
        Questions should assess their experience, approach, and technical capabilities. 
        Return as JSON array with format: [{"question": "..."}]`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" }
                }
              }
            }
          }
        }
      });

      const questionsData = result.questions.map((q, i) => ({
        id: i + 1,
        question: q.question,
        answer: data.questionnaire_response?.[`q${i + 1}`] || ''
      }));

      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Fallback questions
      setQuestions([
        { id: 1, question: `What is your experience as a ${data.role}?`, answer: '' },
        { id: 2, question: 'What is your creative approach?', answer: '' },
        { id: 3, question: 'What are your technical capabilities?', answer: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, answer: value } : q
    );
    setQuestions(updatedQuestions);
    
    const responses = {};
    updatedQuestions.forEach(q => {
      responses[`q${q.id}`] = q.answer;
    });
    updateData({ questionnaire_response: responses });
  };

  const toggleTag = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else if (selectedTags.length < 5) {
      newTags = [...selectedTags, tag];
    } else {
      return; // Max 5 tags
    }
    
    setSelectedTags(newTags);
    updateData({ questionnaire_response: { tags: newTags } });
  };

  // Tag selection for actors and voice artists
  if (data.role === 'actor' || data.role === 'voice_artist') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Select Your Specialties</h3>
          <p className="text-gray-400">Choose up to 5 tags that best describe your expertise ({selectedTags.length}/5 selected)</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black ring-2 ring-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } ${selectedTags.length >= 5 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={selectedTags.length >= 5 && !isSelected}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {selectedTags.length > 0 && (
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">Selected Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge key={tag} className="bg-white text-black">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Question-based approach for other roles
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Generating questions...</p>
        </div>
      </div>
    );
  }

  if (!questions) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h3>
        <p className="text-gray-400">Answer these questions to help us understand your expertise</p>
      </div>

      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <label className="text-sm font-medium text-white">
            {q.id}. {q.question}
          </label>
          <textarea
            value={q.answer}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            placeholder="Your answer..."
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
          />
        </div>
      ))}
    </div>
  );
}