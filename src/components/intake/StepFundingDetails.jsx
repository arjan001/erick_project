import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const FUNDING_STAGES = [
  { value: 'development', label: 'Development' },
  { value: 'pre_production', label: 'Pre-Production' },
  { value: 'production_ready', label: 'Production Ready' },
  { value: 'in_production', label: 'In Production' },
  { value: 'post_production', label: 'Post-Production' },
];

const SEEKING_OPTIONS = [
  { value: 'investment', label: 'Investment' },
  { value: 'co_production', label: 'Co-Production Partner' },
  { value: 'executive_producer', label: 'Executive Producer' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
  { value: 'distribution', label: 'Distribution Partner' },
];

export default function StepFundingDetails({ data, updateData }) {
  const toggleSeekingPartner = (value) => {
    const current = data.seeking_partners || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateData('seeking_partners', updated);
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Funding & Partnership Details</h2>
      <p className="text-gray-600 mb-8">Share information about what you're seeking</p>

      <div className="space-y-8">
        {/* Funding Stage */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Current Production Stage</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FUNDING_STAGES.map((stage) => {
              const isSelected = data.funding_stage === stage.value;
              return (
                <button
                  key={stage.value}
                  onClick={() => updateData('funding_stage', stage.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-black bg-black/5'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seeking Partners */}
        <div>
          <Label className="text-base font-semibold mb-3 block">What are you seeking?</Label>
          <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
          <div className="space-y-3">
            {SEEKING_OPTIONS.map((option) => {
              const isChecked = (data.seeking_partners || []).includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleSeekingPartner(option.value)}
                  />
                  <span className="font-medium text-gray-800">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Rights & Collaboration Notes */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Rights & Collaboration Structure <span className="text-gray-500 font-normal">(Optional)</span>
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Share any relevant details about rights, equity, collaboration terms, or partnership expectations
          </p>
          <Textarea
            value={data.rights_collaboration_notes || ''}
            onChange={(e) => updateData('rights_collaboration_notes', e.target.value)}
            placeholder="Example: Seeking 30% co-production investment in exchange for distribution rights in specific territories..."
            className="min-h-[120px]"
          />
        </div>

        {/* Verified Only */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={data.verified_only || false}
              onCheckedChange={(checked) => updateData('verified_only', checked)}
            />
            <div>
              <span className="font-semibold text-black block mb-1">
                Restrict to verified creators only
              </span>
              <span className="text-sm text-gray-600">
                Only verified creators, teams, and investors can view this project
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}