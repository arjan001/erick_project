import React, { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';

export default function TeamStepPortfolio({ data, updateData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [agreements, setAgreements] = useState({
    noLogos: false,
    portfolioUsage: false
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!agreements.noLogos || !agreements.portfolioUsage) {
      alert('Please agree to the portfolio requirements first');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const clipData = {
        uploaded_by_type: 'team',
        uploaded_by_id: 'temp',
        original_video_url: file_url,
        trimmed_video_url: file_url,
        trim_start_time: 0,
        duration: 30,
        no_logos_agreement: agreements.noLogos,
        portfolio_usage_agreement: agreements.portfolioUsage,
        status: 'pending'
      };

      updateData('portfolio_clips', [...(data.portfolio_clips || []), clipData]);
    } catch (error) {
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeClip = (index) => {
    updateData('portfolio_clips', data.portfolio_clips.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Team Portfolio</h2>
      <p className="text-gray-400 mb-8">Upload 1-3 clips showcasing your team's work (max 30 seconds each)</p>

      <div className="space-y-4 mb-8 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
        <h3 className="font-semibold mb-3">Portfolio Requirements</h3>
        
        <div className="flex items-start gap-3">
          <Checkbox
            id="noLogos"
            checked={agreements.noLogos}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, noLogos: checked }))}
            className="mt-1"
          />
          <Label htmlFor="noLogos" className="text-sm cursor-pointer leading-relaxed">
            Clips contain <strong>no logos, watermarks, or overlays</strong>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="portfolioUsage"
            checked={agreements.portfolioUsage}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, portfolioUsage: checked }))}
            className="mt-1"
          />
          <Label htmlFor="portfolioUsage" className="text-sm cursor-pointer leading-relaxed">
            Studio22 can use these clips as visual direction examples
          </Label>
        </div>
      </div>

      {(data.portfolio_clips || []).length > 0 && (
        <div className="space-y-3 mb-6">
          {data.portfolio_clips.map((clip, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Portfolio clip {index + 1}</span>
              </div>
              <button
                onClick={() => removeClip(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(data.portfolio_clips || []).length < 3 && (
        <div>
          <input
            type="file"
            id="team-portfolio-upload"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={!agreements.noLogos || !agreements.portfolioUsage || isUploading}
          />
          <Label htmlFor="team-portfolio-upload">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              agreements.noLogos && agreements.portfolioUsage
                ? 'border-zinc-700 hover:border-amber-600 cursor-pointer'
                : 'border-zinc-800 opacity-50 cursor-not-allowed'
            }`}>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Click to upload video'}
              </p>
              <p className="text-sm text-gray-400">Max 30 seconds, MP4 or MOV</p>
            </div>
          </Label>
        </div>
      )}
    </div>
  );
}