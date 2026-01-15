import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function ArtistStepQuestions({ data, updateData }) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data.role) {
      generateQuestions();
    }
  }, [data.role]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 specific professional questions for a ${data.role.replace(/_/g, ' ')} applying to join a premium production network. Questions should assess experience, creative approach, and technical expertise. Return as JSON array with format: [{"id": "q1", "question": "..."}, ...]`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  question: { type: "string" }
                }
              }
            }
          }
        }
      });
      setQuestions(result.questions || []);
    } catch (error) {
      setQuestions([
        { id: 'q1', question: 'Describe your experience and notable projects.' },
        { id: 'q2', question: 'What is your creative approach and style?' },
        { id: 'q3', question: 'What equipment and tools do you work with?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswer = (questionId, answer) => {
    updateData('ai_questionnaire_response', {
      ...data.ai_questionnaire_response,
      [questionId]: answer
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
        <p className="text-gray-400">Generating questions for {data.role.replace(/_/g, ' ')}...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Tell us about yourself</h2>
      <p className="text-gray-400 mb-8">Answer these questions to help us understand your expertise</p>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id}>
            <Label className="text-base mb-3 block">
              {index + 1}. {q.question}
            </Label>
            <Textarea
              value={data.ai_questionnaire_response?.[q.id] || ''}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              placeholder="Your answer..."
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}