import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { StickyNote, Plus, X, Pin } from 'lucide-react';

const COLORS = {
  yellow: 'bg-yellow-100 border-yellow-300',
  pink: 'bg-pink-100 border-pink-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  purple: 'bg-purple-100 border-purple-300',
};
const COLOR_KEYS = Object.keys(COLORS);

export default function QuickNotesCard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = async () => {
    try {
      const rows = await base44.entities.Note.filter({ created_by_id: user.id }, '-created_date', 20);
      setNotes(rows || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchNotes(); }, [user]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const color = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    try {
      const created = await base44.entities.Note.create({ content: newNote.trim(), color });
      setNotes(prev => [created, ...prev]);
      setNewNote('');
      setAdding(false);
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await base44.entities.Note.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  if (!user || loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-blue-600" />
          Quick Notes
        </h2>
        <button onClick={() => setAdding(!adding)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {adding && (
        <div className="mb-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Jot down an idea..."
            rows={2}
            autoFocus
            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-400"
          />
          <button onClick={handleAddNote} className="mt-2 w-full bg-black text-white text-sm py-1.5 rounded-lg hover:bg-gray-800">
            Save Note
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 && !adding && (
          <div className="text-center py-6 text-sm text-gray-500">
            No notes yet. Click + to add a sticky note.
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className={`p-3 rounded border relative group ${COLORS[note.color] || COLORS.yellow}`}>
            {note.pinned && <Pin className="w-3 h-3 absolute top-2 right-7 text-gray-500" />}
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs text-gray-800 pr-4 whitespace-pre-wrap">{note.content}</p>
            <p className="text-[10px] text-gray-500 mt-1">{new Date(note.created_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}