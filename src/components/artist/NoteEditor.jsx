import React, { useRef, useState } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Check, X } from 'lucide-react'

const COLORS = {
  yellow: 'bg-yellow-100 border-yellow-300',
  pink: 'bg-pink-100 border-pink-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  purple: 'bg-purple-100 border-purple-300',
}
const COLOR_KEYS = Object.keys(COLORS)

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '')
  const [color, setColor] = useState(note?.color || 'yellow')
  const contentRef = useRef(null)

  const format = (command) => {
    document.execCommand(command, false, null)
    contentRef.current?.focus()
  }

  const handleSave = () => {
    const content = contentRef.current?.innerHTML.trim()
    if (!content || content === '<br>') return
    onSave({ title: title.trim(), content, color })
  }

  return (
    <div className={`mb-3 p-3 rounded-lg border ${COLORS[color]}`}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full mb-2 px-2 py-1 bg-white/70 border border-black/10 rounded text-sm font-semibold focus:outline-none"
      />
      <div className="flex items-center gap-1 mb-2">
        <button type="button" onClick={() => format('bold')} className="p-1.5 rounded hover:bg-black/10" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => format('italic')} className="p-1.5 rounded hover:bg-black/10" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => format('underline')} className="p-1.5 rounded hover:bg-black/10" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => format('insertUnorderedList')} className="p-1.5 rounded hover:bg-black/10" title="Bullet list"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => format('insertOrderedList')} className="p-1.5 rounded hover:bg-black/10" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="flex-1" />
        {COLOR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            title={key}
            onClick={() => setColor(key)}
            className={`w-4 h-4 rounded-full ${COLORS[key].split(' ')[0]} border ${color === key ? 'ring-2 ring-offset-1 ring-gray-500' : 'border-black/20'}`}
          />
        ))}
      </div>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: note?.content || '' }}
        data-placeholder="Jot down an idea..."
        className="note-editable w-full min-h-[60px] px-3 py-2 bg-white/70 border border-black/10 rounded-lg text-sm focus:outline-none"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={handleSave} className="flex-1 bg-black text-white text-sm py-1.5 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-1">
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  )
}