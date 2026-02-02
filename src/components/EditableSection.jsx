import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload, Link as LinkIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EditableSection({ title, onGenerate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [boxes, setBoxes] = useState([
    { id: 1, image: null, prompt: '', uploading: false },
    { id: 2, image: null, prompt: '', uploading: false },
    { id: 3, image: null, prompt: '', uploading: false }
  ]);

  const handleGenerateImage = async (boxId) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box.prompt && !box.image) return;

    const updatedBoxes = boxes.map(b => 
      b.id === boxId ? { ...b, uploading: true } : b
    );
    setBoxes(updatedBoxes);

    try {
      const response = await base44.integrations.Core.GenerateImage({
        prompt: box.prompt || `Generate a cinematic production image for ${title}`,
        existing_image_urls: box.image ? [box.image] : undefined
      });

      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, image: response.url, uploading: false } : b
      ));
    } catch (error) {
      console.error('Failed to generate image:', error);
      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, uploading: false } : b
      ));
    }
  };

  const handleFileUpload = async (boxId, file) => {
    const updatedBoxes = boxes.map(b => 
      b.id === boxId ? { ...b, uploading: true } : b
    );
    setBoxes(updatedBoxes);

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, image: response.file_url, uploading: false } : b
      ));
    } catch (error) {
      console.error('Failed to upload file:', error);
      setBoxes(boxes.map(b => 
        b.id === boxId ? { ...b, uploading: false } : b
      ));
    }
  };

  const handleUrlInput = (boxId, url) => {
    setBoxes(boxes.map(b => 
      b.id === boxId ? { ...b, image: url } : b
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
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                  {box.uploading ? (
                    <div className="text-sm text-gray-500">Processing...</div>
                  ) : box.image ? (
                    <img src={box.image} alt="Generated" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <Textarea
                  placeholder="Describe the image or paste URL/GIF link..."
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
                    disabled={!box.prompt && !box.image}
                    size="sm"
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate
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
                onGenerate(boxes.filter(b => b.image));
                setIsExpanded(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Content
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}