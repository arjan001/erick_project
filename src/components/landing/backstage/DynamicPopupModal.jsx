import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Play, Volume2, Mic, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DynamicPopupModal({ popup, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  if (!popup) return null;

  const mediaItems = [
    ...(popup.image_url ? [{ type: 'image', url: popup.image_url }] : []),
    ...(popup.video_url ? [{ type: 'video', url: popup.video_url, embedUrl: popup.video_embed_url, source: popup.video_source }] : []),
  ];

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Voice recording created:', audioUrl);
        // Here you would upload to backend
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      mediaRecorderRef.current.timer = timer;
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      clearInterval(mediaRecorderRef.current.timer);
      setIsRecording(false);
    }
  };

  const getEmbedUrl = (url, source) => {
    if (source === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (source === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    return url;
  };

  const currentMedia = mediaItems[currentMediaIndex];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{popup.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Media Section */}
            {mediaItems.length > 0 && (
              <div className="relative aspect-video bg-gray-900">
                {currentMedia?.type === 'image' && (
                  <img
                    src={currentMedia.url}
                    alt={popup.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {currentMedia?.type === 'video' && (
                  <>
                    {currentMedia.source === 'upload' ? (
                      <video
                        ref={videoRef}
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(currentMedia.url, currentMedia.source)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    )}
                  </>
                )}

                {/* Media Navigation */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {mediaItems.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentMediaIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Body Content */}
            <div className="p-6">
              {popup.body && (
                <div className="prose prose-gray max-w-none text-gray-700">
                  {popup.body}
                </div>
              )}

              {/* Voice Recording Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Recording
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Record a voice message or audition clip for this opportunity
                </p>
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
                    >
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      Stop Recording
                    </button>
                  )}
                  {isRecording && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {popup.cta_text && popup.cta_link && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <a
                href={popup.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-colors font-semibold"
              >
                {popup.cta_text}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
