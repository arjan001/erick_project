import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Edit2, X } from 'lucide-react';

export default function ClientJobRow({ job, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{job.short_description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">{job.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(job.id)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}