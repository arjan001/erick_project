import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewProjectForm({ selectedCategory = 'commercial' }) {
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
  const [generating, setGenerating] = useState(false);

  React.useEffect(() => {
    setProjectType(projectTypeMap[selectedCategory] || 'commercial');
  }, [selectedCategory]);

  const handleExtract = async () => {
    if (!referenceUrl) return;
    
    setExtracting(true);
    try {
      const response = await base44.functions.invoke('extractWebsite', { url: referenceUrl });
      if (response.data?.description) {
        setDescription(response.data.description);
      }
    } catch (error) {
      console.error('Extract failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!description) return;
    
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed production plan for this project:\n\nType: ${projectType}\nDescription: ${description}\n\nProvide a structured production plan with timeline, departments needed, and key deliverables.`,
      });
      
      console.log('Production plan:', response);
      alert('Production plan generated! Check console for details.');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[15px] p-8">
      <h2 className="text-2xl font-bold mb-1 text-[#1a1a1a]">New Project</h2>
      <p className="text-[#666] text-sm mb-4">One sentence. The system handles the rest.</p>

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
      <div className="space-y-2">
        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger className="w-full bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="short_film">Short Film</SelectItem>
            <SelectItem value="film">Film</SelectItem>
            <SelectItem value="music_video">Music Video</SelectItem>
            <SelectItem value="documentary">Documentary</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={handleGeneratePlan}
          disabled={!description || generating}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Production Plan'}
        </Button>
      </div>
    </div>
  );
}