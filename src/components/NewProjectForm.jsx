import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewProjectForm() {
  const [referenceUrl, setReferenceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('commercial');
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);

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
    <div>
      <h2 className="text-3xl font-bold mb-2">New Project</h2>
      <p className="text-gray-500 mb-8">One sentence. The system handles the rest.</p>

      {/* Reference Website */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Reference Website (Optional)</label>
        <div className="flex gap-2 mb-2">
          <Input 
            placeholder="www.example.com"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleExtract}
            disabled={!referenceUrl || extracting}
            size="sm"
            className="bg-emerald-400 hover:bg-emerald-500 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {extracting ? 'Extracting...' : 'Extract'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Provide a URL and click Extract to auto-generate your project description
        </p>
      </div>

      {/* Project Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Project Description</label>
        <Textarea
          placeholder="Describe your project or use Extract button above. You can write multiple sentences with details about your vision, target audience, style, and goals."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[140px] text-sm"
        />
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3">
        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger className="w-full">
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
          className="w-full bg-gray-500 hover:bg-gray-600 text-white"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Production Plan'}
        </Button>
      </div>
    </div>
  );
}