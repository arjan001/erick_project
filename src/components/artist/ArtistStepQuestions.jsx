import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

const ACTOR_TAGS = [
  'Leading Role', 'Supporting Role', 'Character Actor', 'Voice Acting', 'Motion Capture',
  'Theater', 'Film', 'TV Series', 'Commercials', 'Improvisation',
  'Drama', 'Comedy', 'Action', 'Horror', 'Romance',
  'Method Acting', 'Classical Training', 'Shakespearean', 'Musical Theater', 'Physical Theater',
  'Stage Combat', 'Stunt Work', 'Dialect Coach', 'Accent Work', 'Multiple Languages'
]

const VOICE_ARTIST_TAGS = [
  'Narration', 'Character Voices', 'Audiobook', 'Commercial VO', 'Documentary',
  'Animation', 'Video Game', 'E-Learning', 'IVR Systems', 'Podcast',
  'Multiple Accents', 'Age Range', 'Vocal Effects', 'Singing', 'Impressions',
  'Home Studio', 'Professional Studio', 'Fast Turnaround', 'Script Writing', 'Audio Editing'
]

export default function ArtistStepQuestions({ data, updateData }) {
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState(data.questionnaire_response?.tags || [])
  const [availableTags, setAvailableTags] = useState([])

  useEffect(() => {
    if (data.role === 'actor') {
      setAvailableTags(ACTOR_TAGS)
    } else if (data.role === 'voice_artist') {
      setAvailableTags(VOICE_ARTIST_TAGS)
    } else {
      // For other roles, use mock questions
      setQuestions([
        { id: 1, question: 'Describe your experience in this field.', answer: '' },
        { id: 2, question: 'What is your creative approach?', answer: '' },
        { id: 3, question: 'What technical skills do you bring?', answer: '' }
      ])
    }
  }, [data.role])

  const fetchQuestions = async () => {
    // TODO: Replace with Supabase Edge Function or OpenAI for AI question generation
    setLoading(true)
    try {
      setQuestions([
        { id: 1, question: 'Describe your experience in this field.', answer: '' },
        { id: 2, question: 'What is your creative approach?', answer: '' },
        { id: 3, question: 'What technical skills do you bring?', answer: '' }
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, answer } : q
    )
    setQuestions(updatedQuestions)
    updateData('questionnaire_response', {
      tags: selectedTags,
      answers: updatedQuestions.reduce((acc, q) => {
        acc[`q${q.id}`] = q.answer
        return acc
      }, {})
    })
  }

  const handleTagsUpdate = () => {
    updateData('questionnaire_response', {
      tags: selectedTags,
      answers: data.questionnaire_response?.answers || {}
    })
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading questions...</div>
  }

  // Show tag selection for actors and voice artists
  if (availableTags.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Select Your Specialties</h2>
        <p className="text-gray-600 mb-6">Choose the tags that best describe your skills and experience.</p>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${selectedTags.includes(tag) ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-100'
                }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <button
          onClick={handleTagsUpdate}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Selection
        </button>
      </div>
    )
  }

  // Show questions for other roles
  if (questions) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Application Questions</h2>
        <p className="text-gray-600 mb-6">Please answer the following questions to complete your application.</p>

        {questions.map(q => (
          <div key={q.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {q.question}
            </label>
            <textarea
              value={q.answer}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>
    )
  }

  return null
}
