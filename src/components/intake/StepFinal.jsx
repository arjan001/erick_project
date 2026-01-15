import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Award } from 'lucide-react';

export default function StepFinal({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Final Details</h2>
      <p className="text-gray-400 mb-8">Tell us about your project and how to reach you</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-base mb-3 block">Your Name *</Label>
          <Input
            id="name"
            value={data.project_owner_name}
            onChange={(e) => updateData('project_owner_name', e.target.value)}
            placeholder="Full name"
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-base mb-3 block">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.project_owner_email}
            onChange={(e) => updateData('project_owner_email', e.target.value)}
            placeholder="your@email.com"
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div>
          <Label htmlFor="company" className="text-base mb-3 block">Company (optional)</Label>
          <Input
            id="company"
            value={data.project_owner_company}
            onChange={(e) => updateData('project_owner_company', e.target.value)}
            placeholder="Company or brand name"
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-base mb-3 block">Additional Notes</Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => updateData('notes', e.target.value)}
            placeholder="Any additional details about your project, creative vision, or requirements..."
            rows={5}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* First Frame Offer */}
        <div className="p-6 bg-gradient-to-br from-amber-900/20 to-zinc-800/50 rounded-xl border border-amber-600/30">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Studio22 First Frame</h3>
              <p className="text-sm text-gray-300 mb-4">
                Get one complimentary production day to experience how we work. Available for verified projects only.
              </p>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="first_frame"
                  checked={data.interested_in_first_frame}
                  onCheckedChange={(checked) => updateData('interested_in_first_frame', checked)}
                  className="border-zinc-600"
                />
                <Label htmlFor="first_frame" className="text-sm cursor-pointer">
                  I'm interested in Studio22 First Frame
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}