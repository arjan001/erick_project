import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

export default function StepTimeline({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Timeline</h2>
      <p className="text-gray-400 mb-8">When do you need this project?</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="start" className="text-base mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Expected Start Date
          </Label>
          <Input
            id="start"
            type="date"
            value={data.timeline_start}
            onChange={(e) => updateData('timeline_start', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div>
          <Label htmlFor="deadline" className="text-base mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Delivery Deadline
          </Label>
          <Input
            id="deadline"
            type="date"
            value={data.timeline_deadline}
            onChange={(e) => updateData('timeline_deadline', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <p className="text-sm text-gray-400">
            💡 We recommend booking teams at least 4-6 weeks in advance for best availability
          </p>
        </div>
      </div>
    </div>
  );
}