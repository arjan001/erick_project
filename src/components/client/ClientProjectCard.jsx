import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Edit2, X, MoreVertical } from 'lucide-react';

const statusConfig = {
  submitted: { label: 'Submitted', color: 'bg-gray-100 text-gray-700' },
  verified: { label: 'Verified', color: 'bg-gray-900 text-white' },
  in_progress: { label: 'In Progress', color: 'bg-gray-800 text-white' },
  delivered: { label: 'Delivered', color: 'bg-gray-700 text-white' },
  rejected: { label: 'Rejected', color: 'bg-gray-200 text-gray-700' }
};

export default function ClientProjectCard({ project, onEdit, onDelete }) {
  const status = statusConfig[project.status] || statusConfig.submitted;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {project.image_url && (
        <div className="h-36 bg-gray-100 relative overflow-hidden">
          <img src={project.image_url} alt={project.project_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-gray-400">{project.created_date ? new Date(project.created_date).toLocaleDateString() : ''}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-base">{project.project_type?.replace(/_/g, ' ')}</h3>
        {project.notes && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.notes}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {project.location_city || 'TBD'}
          </span>
          {project.timeline_start && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.timeline_start).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400" onClick={() => onEdit(project)}>
            <Edit2 className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs font-medium border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600" onClick={() => onDelete(project.id)}>
            <X className="w-3 h-3 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}