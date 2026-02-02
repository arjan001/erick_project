import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';

export default function NewProjectForm({ selectedCategory = 'commercial' }) {
  const navigate = useNavigate();
  const [referenceUrl, setReferenceUrl] = useState('');
  const [description, setDescription] = useState('');
  const projectTypeMap = {
    commercial: 'commercial',
    short: 'short_film',
    feature: 'film',
    music: 'music_video',
    documentary: 'documentary'
  };
  const [projectType, setProjectType] = useState(projectTypeMap[selectedCategory] || 'commercial');
  const [extracting, setExtracting] = useState(false);

  React.useEffect(() => {
    setProjectType(projectTypeMap[selectedCategory] || 'commercial');
  }, [selectedCategory]);

  const handleExtract = async () => {
    if (!referenceUrl) return;
    
    setExtracting(true);
    try {
      const response = await base44.functions.invoke('extractWebsite', { 
        url: referenceUrl,
        projectType: selectedCategory
      });
      if (response.data?.description) {
        setDescription(response.data.description);
      } else if (response.data?.error) {
        console.error('Extract error:', response.data.error);
      }
    } catch (error) {
      console.error('Extract failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = () => {
    if (!description) return;
    
    // Navigate to SubmitProject with the description
    const params = new URLSearchParams();
    params.set('description', description);
    params.set('category', selectedCategory);
    navigate(createPageUrl(`SubmitProject?${params.toString()}`));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-[#1a1a1a]">New Project</h2>
      <p className="text-[#666] text-sm mb-3">One sentence. The system handles the rest.</p>

      {/* Reference Website */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2 text-[#666]">Reference Website (Optional)</label>
        <div className="flex gap-2 mb-1">
          <Input 
            placeholder="www.example.com"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            className="flex-1 bg-white border-gray-300 text-sm"
          />
          <Button 
            onClick={handleExtract}
            disabled={!referenceUrl || extracting}
            size="sm"
            className="bg-emerald-400 hover:bg-emerald-500 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {extracting ? 'Ext...' : 'Extract'}
          </Button>
        </div>
        <p className="text-xs text-[#999]">
          Provide a URL and click Extract to auto-generate your project description
        </p>
      </div>

      {/* Project Description */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2 text-[#666]">Project Description</label>
        <Textarea
          placeholder="Describe your project or use Extract button above. You can write multiple sentences with details about your vision, target audience, style, and goals."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] text-sm bg-white border-gray-300"
        />
      </div>

      {/* Bottom Actions */}
      <Button 
        onClick={handleSubmit}
        disabled={!description}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm"
      >
        Continue to Project Details
      </Button>
    </div>
  );
}