import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTION_POSITIONS } from './positions';

export default function JobPostingModal({ isOpen, onClose, onSubmit, user }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    position: '',
    location: '',
    dates: '',
    project_type: '',
    title: '',
    description: '',
    job_type: 'paid_gig',
    pay_type: 'fixed',
    rate: '',
    frequency: 'flat_fee',
    skills: []
  });
  const [positionSearch, setPositionSearch] = useState('');
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  if (!isOpen) return null;

  const filteredPositions = PRODUCTION_POSITIONS.filter(pos =>
    pos.label.toLowerCase().includes(positionSearch.toLowerCase())
  ).slice(0, 10);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const jobData = {
      title: `${formData.position} needed for a ${formData.project_type} in ${formData.location} starting ${formData.dates}`,
      description: formData.description || 'I want to have ...',
      short_description: formData.description?.substring(0, 100) || '',
      client_name: user?.full_name || 'Client',
      client_email: user?.email || '',
      client_avatar_url: '',
      location: formData.location,
      budget_min: parseFloat(formData.rate) || 0,
      budget_max: parseFloat(formData.rate) || 0,
      budget_type: formData.pay_type,
      roles_needed: [formData.position],
      skills_required: formData.skills,
      project_types: [formData.project_type],
      status: 'open',
      posted_at: new Date().toISOString()
    };
    onSubmit(jobData);
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {step === 1 && 'Step 1 of 3: Create a job post'}
              {step === 2 && 'Step 2 of 3: Provide job details'}
              {step === 3 && 'Step 3/3: Review your job'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-sm">
                <p className="mb-6">I'm looking to hire:</p>
                
                {/* Position field with autocomplete */}
                <div className="mb-4 relative">
                  <div className="text-4xl font-light mb-2">
                    a <span className="text-purple-400">Position</span>
                  </div>
                  <input
                    type="text"
                    value={positionSearch}
                    onChange={(e) => {
                      setPositionSearch(e.target.value);
                      setShowPositionDropdown(true);
                    }}
                    onFocus={() => setShowPositionDropdown(true)}
                    placeholder="Type to search positions..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                  />
                  {showPositionDropdown && filteredPositions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredPositions.map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => {
                            setFormData({ ...formData, position: pos.label });
                            setPositionSearch(pos.label);
                            setShowPositionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location field */}
                <div className="mb-4">
                  <div className="text-4xl font-light mb-2">
                    in <span className="text-purple-400">Location</span>
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Brussels, BE"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                  />
                </div>

                {/* Dates field */}
                <div className="mb-4 relative">
                  <div className="text-4xl font-light mb-2">
                    on <span className="text-purple-400">Dates</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dates}
                      onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      placeholder="02/11"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none cursor-pointer"
                      readOnly
                    />
                    <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {showDatePicker && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold">February 2026</h3>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="font-semibold text-gray-600">{day}</div>
                        ))}
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              setFormData({ ...formData, dates: `02/${day.toString().padStart(2, '0')}` });
                              setShowDatePicker(false);
                            }}
                            className="w-8 h-8 hover:bg-purple-100 rounded-full flex items-center justify-center"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setFormData({ ...formData, dates: 'Dates are flexible' });
                            setShowDatePicker(false);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          Dates are flexible
                        </button>
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project type field */}
                <div className="mb-4">
                  <div className="text-4xl font-light mb-2">
                    for <span className="text-purple-400">Project type</span>
                  </div>
                  <div className="space-y-2">
                    {['Commercial', 'E-Commerce Shoot', 'Music Video', 'Documentary', 'Short Film', 'Feature Film'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, project_type: type })}
                        className={`w-full text-left px-4 py-3 border-2 rounded-lg text-sm transition-colors ${
                          formData.project_type === type
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Describe this job:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none resize-none"
                    rows={4}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.description.length} / 5000
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job title</label>
                <input
                  type="text"
                  value={`${formData.position} needed for a ${formData.project_type} in ${formData.location} starting ${formData.dates}`}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <button className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400">
                  <span className="text-4xl">+</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Job type</label>
                <div className="flex gap-3">
                  {[
                    { value: 'paid_gig', label: 'Paid gig' },
                    { value: 'full_time', label: 'Full-time' },
                    { value: 'part_time', label: 'Part-time' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, job_type: type.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.job_type === type.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Pay type</label>
                <div className="flex gap-3">
                  {[
                    { value: 'fixed', label: 'Fixed' },
                    { value: 'range', label: 'Range' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, pay_type: type.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.pay_type === type.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="Add rate"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                  >
                    <option value="flat_fee">Flat fee</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills (optional)</label>
                <input
                  type="text"
                  placeholder="Add skills..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setFormData({ ...formData, skills: [...formData.skills, e.target.value] });
                      e.target.value = '';
                    }
                  }}
                />
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {skill}
                        <button
                          onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {formData.position} needed for a {formData.project_type} in {formData.location} starting {formData.dates}
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Job description</h4>
                  <p className="text-sm text-gray-800">{formData.description || 'I want to have ...'}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Job type</h4>
                  <p className="text-sm text-gray-800 capitalize">{formData.job_type.replace('_', ' ')}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Pay type</h4>
                  <p className="text-lg font-bold text-black">${formData.rate} USD</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <Button
            onClick={step === 1 ? onClose : handleBack}
            variant="ghost"
            className="text-gray-600"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="border-gray-300"
            >
              Save draft
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!formData.position || !formData.location || !formData.dates || !formData.project_type}
                className="bg-black text-white hover:bg-gray-800"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800"
              >
                Post job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}