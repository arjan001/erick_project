import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const ACTOR_TAGS = [
  'Method Acting', 'Classical Theatre', 'Improvisation', 'Voice Acting', 'Physical Theatre',
  'Comedy', 'Drama', 'Musical Theatre', 'Screen Acting', 'Stage Combat',
  'Character Development', 'Accent Training', 'Period Performance', 'Contemporary',
  'Shakespeare', 'Chekhov', 'Meisner Technique', 'Stanislavski', 'Action Hero',
  'Romantic Lead', 'Villain', 'Comic Relief', 'Ensemble Work', 'Solo Performance',
  'Motion Capture', 'Voice-Over', 'Narrator', 'Stunt Work', 'Dance', 'Singing'
];

export default function ArtistStepQuestions({ data, updateData }) {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState(data.ai_questionnaire_response?.tags || []);

  // For non-actor roles, generate questions
  useEffect(() => {
    if (data.role === 'actor') return;
    
    if (!data.ai_questionnaire_response || Object.keys(data.ai_questionnaire_response).length === 0) {
      generateQuestions();
    }
  }, [data.role]);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations/Core/InvokeLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 specific interview questions for a ${data.role} applying to a premium production company. Questions should help understand their expertise, approach, and technical capabilities. Return as JSON with keys q1, q2, q3.`,
          response_json_schema: {
            type: 'object',
            properties: {
              q1: { type: 'string' },
              q2: { type: 'string' },
              q3: { type: 'string' }
            }
          }
        })
      });
      const result = await response.json();
      
      const questionnaire = {
        q1: result.q1 || '',
        q2: result.q2 || '',
        q3: result.q3 || ''
      };
      updateData({ ai_questionnaire_response: questionnaire });
    } catch (error) {
      console.error('Error generating questions:', error);
      const defaultQuestionnaire = {
        q1: 'Can you describe your experience and approach in your field?',
        q2: 'What tools and techniques do you specialize in?',
        q3: 'How do you collaborate with other creative professionals?'
      };
      updateData({ ai_questionnaire_response: defaultQuestionnaire });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(newTags);
      updateData({ ai_questionnaire_response: { tags: newTags } });
    } else if (selectedTags.length < 5) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      updateData({ ai_questionnaire_response: { tags: newTags } });
    }
  };

  // Actor gets tag selection
  if (data.role === 'actor') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-white">Select Your Specialties</h3>
          <p className="text-gray-400 mb-6">Choose up to 5 tags that best describe your acting expertise ({selectedTags.length}/5 selected)</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ACTOR_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            const isDisabled = !isSelected && selectedTags.length >= 5;
            
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black'
                    : isDisabled
                    ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Selected specialties:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
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

  // Other roles get questions
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const questions = data.ai_questionnaire_response || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white">Tell us about yourself</h3>
        <p className="text-gray-400">Answer these questions to help us understand your expertise</p>
      </div>

      {Object.entries(questions).map(([key, question], index) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-white">
            {index + 1}. {question}
          </label>
          <textarea
            value={questions[key + '_answer'] || ''}
            onChange={(e) => {
              const updatedQuestions = { ...questions, [key + '_answer']: e.target.value };
              updateData({ ai_questionnaire_response: updatedQuestions });
            }}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-600 min-h-[100px]"
            placeholder="Your answer..."
          />
        </div>
      ))}
    </div>
  );
}