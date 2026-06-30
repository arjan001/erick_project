import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export function PortfolioModal({ show, editing, form, setForm, videoInputRef, uploading, onClose, onSave }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editing ? 'Edit Portfolio Item' : 'Add Work to Portfolio'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Enter project title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select value={form.project_type} onChange={(e) => setForm(p => ({ ...p, project_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400">
              <option value="commercial">Commercial</option>
              <option value="music_video">Music Video</option>
              <option value="documentary">Documentary</option>
              <option value="short_film">Short Film</option>
              <option value="film">Film</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Role</label>
            <input type="text" value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
              placeholder="e.g., Production Team, Camera Crew"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the project..." rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
            <div onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 100MB</p>
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={() => {}} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={onSave} disabled={uploading} className="flex-1 bg-black text-white hover:bg-gray-800">
            {uploading ? 'Uploading...' : (editing ? 'Update' : 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MemberModal({ show, editing, form, setForm, onClose, onSave }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editing ? 'Edit Team Member' : 'Add Team Member'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Enter member name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <input type="text" value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
              placeholder="e.g., Director, Cinematographer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email || ''} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="member@example.com (sends an email invite)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input type="text" value={form.skills} onChange={(e) => setForm(p => ({ ...p, skills: e.target.value }))}
              placeholder="e.g., Lighting, Camera, Editing (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input type="text" value={form.avatar_url} onChange={(e) => setForm(p => ({ ...p, avatar_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={onSave} className="flex-1 bg-black text-white hover:bg-gray-800">
            {editing ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}