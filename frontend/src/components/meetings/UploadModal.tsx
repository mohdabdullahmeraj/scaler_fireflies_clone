import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create meeting
      const meetingResponse = await fetchApi('/meetings/', {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          date: new Date().toISOString(),
          duration_seconds: transcript ? Math.max(transcript.split(' ').length / 2.5, 60) : 1800,
          status: 'completed',
          meeting_type: 'internal',
        })
      });

      // 2. Upload transcript if provided
      if (transcript.trim()) {
        const formData = new FormData();
        const blob = new Blob([transcript], { type: 'text/plain' });
        formData.append('file', blob, 'transcript.txt');
        
        await fetchApi(`/meetings/${meetingResponse.id}/transcript/`, {
          method: 'POST',
          body: formData,
        }, true);
      }

      // Refresh meetings list
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      setTitle('');
      setTranscript('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-indigo-600" />
            Upload Meeting
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Planning"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste Transcript (Optional)</label>
              <div className="relative">
                <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your raw transcript text here...&#10;e.g.&#10;John: Hello team!&#10;Jane: Hi John, let's get started."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm min-h-[160px] resize-y"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Pasted text will be automatically parsed to generate timestamps and speaker labels.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="upload-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Create Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
