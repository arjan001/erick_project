import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EditableSection({ title, onGenerate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [boxes, setBoxes] = useState([
    { id: 1, images: [], prompt: '', title: '', description: '', uploading: false, progress: '' },
    { id: 2, images: [], prompt: '', title: '', description: '', uploading: false, progress: '' },
    { id: 3, images: [], prompt: '', title: '', description: '', uploading: false, progress: '' }
  ]);
  const [hoveredBox, setHoveredBox] = useState(null);

  const handleGenerateImage = async (boxId) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box.prompt && box.images.length === 0) return;

    try {
      // Generate 5 images for the project
      const generatedImages = [];
      const shots = [
        'Wide back-of-room angle. Crowd as silhouettes. Stage barely lit.',
        'Side angle near the DJ booth or mixing area. Hands resting. No action.',
        'Close shot of a face in profile. Expression neutral.',
        'High angle from a corner. Slow drift perspective.',
        'Rear crowd perspective looking toward the stage or focal point.'
      ];

      for (let i = 0; i < 5; i++) {
        setBoxes(prevBoxes => prevBoxes.map(b => 
          b.id === boxId ? { ...b, uploading: true, progress: `Generating shot ${i + 1}/5...`, images: generatedImages } : b
        ));

        const shotPrompt = `${box.prompt}\n\nSpecific shot: ${shots[i]}\n\nCinematic style. Muted colors. Practical lights. Natural grain. In-production feel.`;
        
        const response = await base44.integrations.Core.GenerateImage({
          prompt: shotPrompt,
          existing_image_urls: box.images.length > 0 ? [box.images[0]] : undefined
        });

        generatedImages.push(response.url);
        
        // Update progressively
        setBoxes(prevBoxes => prevBoxes.map(b => 
          b.id === boxId ? { ...b, images: [...generatedImages] } : b
        ));
      }

      setBoxes(prevBoxes => prevBoxes.map(b => 
        b.id === boxId ? { ...b, images: generatedImages, uploading: false, progress: '' } : b
      ));
    } catch (error) {
      console.error('Failed to generate image:', error);
      setBoxes(prevBoxes => prevBoxes.map(b => 
        b.id === boxId ? { ...b, uploading: false, progress: 'Error generating' } : b
      ));
    }
  };

  const handleFileUpload = async (boxId, file) => {
    setBoxes(boxes.map(b => 
      b.id === boxId ? { ...b, uploading: true, progress: 'Uploading...' } : b
    ));

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, images: [response.file_url], uploading: false, progress: '' } : b
      ));
    } catch (error) {
      console.error('Failed to upload file:', error);
      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, uploading: false, progress: 'Upload failed' } : b
      ));
    }
  };

  const handleUrlInput = (boxId, url) => {
    setBoxes(boxes.map(b => 
      b.id === boxId ? { ...b, images: [url] } : b
    ));
  };

  return (
    <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Generate Content for {title}
          </span>
        </div>
        <span className="text-2xl text-gray-400">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boxes.map((box) => (
              <div key={box.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div 
                  className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative group"
                  onMouseEnter={() => setHoveredBox(box.id)}
                  onMouseLeave={() => setHoveredBox(null)}
                >
                  {box.uploading ? (
                    <div className="text-center p-4">
                      <div className="text-sm text-gray-500 mb-2">{box.progress}</div>
                      {box.images.length > 0 && (
                        <div className="text-xs text-gray-400">{box.images.length}/5 shots ready</div>
                      )}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(box.images.length / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : box.images.length > 0 ? (
                    <>
                      {hoveredBox === box.id && box.images.length > 1 ? (
                        <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                          {box.images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`Shot ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <img src={box.images[0]} alt="Primary shot" className="w-full h-full object-cover" />
                      )}
                      {box.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {box.images.length} shots
                        </div>
                      )}
                    </>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <Input
                  placeholder="Project Title"
                  value={box.title}
                  onChange={(e) => {
                    setBoxes(boxes.map(b => 
                      b.id === box.id ? { ...b, title: e.target.value } : b
                    ));
                  }}
                  className="text-xs mb-2"
                />

                <Textarea
                  placeholder="Short description (1-2 sentences)"
                  value={box.description}
                  onChange={(e) => {
                    setBoxes(boxes.map(b => 
                      b.id === box.id ? { ...b, description: e.target.value } : b
                    ));
                  }}
                  className="text-xs mb-2 h-16"
                />

                <Textarea
                  placeholder="Describe 5 cinematic shots for your project..."
                  value={box.prompt}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.startsWith('http')) {
                      handleUrlInput(box.id, value);
                    }
                    setBoxes(boxes.map(b => 
                      b.id === box.id ? { ...b, prompt: value } : b
                    ));
                  }}
                  className="text-xs mb-2 h-20"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateImage(box.id)}
                    disabled={!box.prompt && box.images.length === 0}
                    size="sm"
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate 5 Shots
                  </Button>
                  <label className="flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`file-${box.id}`).click();
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <input
                      id={`file-${box.id}`}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(box.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                onGenerate(boxes.filter(b => b.images.length > 0));
                setIsExpanded(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Content ({boxes.filter(b => b.images.length > 0).length} projects)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}