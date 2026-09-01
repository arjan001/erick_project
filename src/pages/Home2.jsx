import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Home2() {
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
      // Generate production plan logic here
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-black flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
          <span className="text-black font-black text-sm">S22</span>
        </div>
        
        <nav className="flex flex-col items-center gap-6 text-white text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center">🏠</div>
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">🎬</div>
            <span>Services</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">👤</div>
            <span>Find Frame</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">💼</div>
            <span>Work</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">👥</div>
            <span>Team</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">✉️</div>
            <span>Contact</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">S22</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Eric Rabar</h1>
              <p className="text-gray-500">Production Network</p>
            </div>
          </div>

          {/* New Project Form */}
          <div className="bg-white rounded-xl shadow-lg p-10">
            <h2 className="text-5xl font-bold mb-2">New Project</h2>
            <p className="text-gray-500 text-lg mb-10">One sentence. The system handles the rest.</p>

            {/* Reference Website */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Reference Website (Optional)</label>
              <div className="flex gap-3">
                <Input 
                  placeholder="www.example.com"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="flex-1 h-12 px-4 text-base"
                />
                <Button 
                  onClick={handleExtract}
                  disabled={!referenceUrl || extracting}
                  className="h-12 px-6 bg-emerald-400 hover:bg-emerald-500 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {extracting ? 'Extracting...' : 'Extract'}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Provide a URL and click Extract to auto-generate your project description
              </p>
            </div>

            {/* Project Description */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Project Description</label>
              <Textarea
                placeholder="Describe your project or use Extract button above. You can write multiple sentences with details about your vision, target audience, style, and goals."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[180px] p-4 text-base"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="w-48 h-12">
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
                className="h-12 px-8 bg-gray-500 hover:bg-gray-600 text-white text-base"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Production Plan'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}