import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Edit2, X } from 'lucide-react';

const statusColors = {
  submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  verified: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-green-100 text-green-800 border-green-300',
  delivered: 'bg-purple-100 text-purple-800 border-purple-300',
  rejected: 'bg-red-100 text-red-800 border-red-300'
};

export default function ClientProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      {project.image_url && (
        <div className="h-40 bg-gray-200 relative">
          <img src={project.image_url} alt={project.project_type} className="w-full h-full object-cover" />
          <button
            onClick={() => onDelete(project.id)}
            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[project.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
            {project.status}
          </span>
          <span className="text-xs text-gray-500">{project.created_date ? new Date(project.created_date).toLocaleDateString() : ''}</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-2 capitalize">{project.project_type?.replace(/_/g, ' ')}</h3>
        {project.notes && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.notes}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location_city}
          </span>
          {project.timeline_start && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(project.timeline_start).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onEdit(project)}>
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onDelete(project.id)}>
            <X className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}