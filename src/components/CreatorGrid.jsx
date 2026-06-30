import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { ExternalLink, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreatorGrid({ creators, view = 'list', onDelete }) {
  if (view === 'list') {
    return (
      <div className="space-y-2">
        {creators.map((creator, idx) => (
          <div 
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                {creator.logo_url ? (
                  <img src={creator.logo_url} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-[200px]">
                <h4 className="font-bold text-base">{creator.name}</h4>
                <p className="text-xs text-gray-500">{creator.city}, {creator.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-sm">
                <span className="text-gray-500">Profile:</span>
                <span className="ml-2 font-medium capitalize">{creator.type}</span>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">Awards:</span>
                <span className="ml-2 font-bold text-blue-600">{creator.awards_count}</span>
              </div>

              <div className="text-sm min-w-[200px]">
                <span className="text-gray-500">Categories:</span>
                <span className="ml-2 text-xs">
                  {creator.categories.slice(0, 2).map(c => c.replace('_', ' ')).join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`${createPageUrl('ArtistPublicProfile')}?id=${creator.id}`}>
                  <button className="px-6 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-black transition-all">
                    View
                  </button>
                </Link>
                {onDelete && (
                  <button 
                    onClick={async () => {
                      if (confirm(`Delete ${creator.name}?`)) {
                        await base44.entities.Creator.delete(creator.id);
                        onDelete();
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
      {creators.map((creator, idx) => (
        <Link 
          to={`${createPageUrl('ArtistPublicProfile')}?id=${creator.id}`}
          key={idx}
          className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 block"
        >
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {creator.profile_image_url ? (
              <img 
                src={creator.profile_image_url}
                alt={creator.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                {creator.name.substring(0, 2)}
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {creator.logo_url ? (
                  <img src={creator.logo_url} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded uppercase font-bold">
                {creator.type}
              </span>
            </div>

            <h3 className="text-base font-bold mb-2 line-clamp-1">{creator.name}</h3>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Location:</span>
                <span className="text-xs font-medium">{creator.city}</span>
              </div>
              {creator.website && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Website:</span>
                  <a 
                    href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {creator.website.replace(/^https?:\/\/(www\.)?/, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {creator.awards_count > 0 && (
              <div className="grid grid-cols-4 gap-2 py-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">IM</div>
                  <div className="text-sm font-bold">{Math.floor(creator.awards_count * 0.4)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">CSS</div>
                  <div className="text-sm font-bold">{Math.floor(creator.awards_count * 0.3)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">SOTD</div>
                  <div className="text-sm font-bold">{Math.floor(creator.awards_count * 0.2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">SOTY</div>
                  <div className="text-sm font-bold">{Math.floor(creator.awards_count * 0.1)}</div>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}