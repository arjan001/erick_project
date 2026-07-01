import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { StickyNote, Plus, X, Pin, Pencil } from 'lucide-react';
import NoteEditor from './NoteEditor';

const COLORS = {
  yellow: 'bg-yellow-100 border-yellow-300',
  pink: 'bg-pink-100 border-pink-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  purple: 'bg-purple-100 border-purple-300',
};

export default function QuickNotesCard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const handleCreate = async (data) => {
    try {
      const created = await base44.entities.Note.create(data);
      setNotes(prev => [created, ...prev]);
      setAdding(false);
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await base44.entities.Note.update(id, data);
      setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
      setEditingId(null);
    } catch (err) {
      console.error('Error updating note:', err);
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
          Brainstorm Notes
        </h2>
        <button
          onClick={() => { setEditingId(null); setAdding(!adding); }}
          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700"
        >
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {adding && <NoteEditor onSave={handleCreate} onCancel={() => setAdding(false)} />}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notes.length === 0 && !adding && (
          <div className="text-center py-6 text-sm text-gray-500">
            No notes yet. Click + to add a brainstorm note.
          </div>
        )}
        {notes.map((note) => (
          editingId === note.id ? (
            <NoteEditor
              key={note.id}
              note={note}
              onSave={(data) => handleUpdate(note.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={note.id}
              onClick={() => setEditingId(note.id)}
              className={`p-3 rounded-lg border relative group cursor-pointer ${COLORS[note.color] || COLORS.yellow}`}
            >
              {note.pinned && <Pin className="w-3 h-3 absolute top-2 right-14 text-gray-500" />}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setEditingId(note.id); }} className="text-gray-500 hover:text-blue-600">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-gray-500 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {note.title && <p className="text-xs font-bold text-gray-900 pr-10 mb-1">{note.title}</p>}
              <div className="note-content text-xs text-gray-800 pr-10" dangerouslySetInnerHTML={{ __html: note.content }} />
              <p className="text-[10px] text-gray-500 mt-1">{new Date(note.created_date).toLocaleDateString()}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}