import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function UnifiedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const lowerQuery = query.toLowerCase();

        const [projects, artists, teams] = await Promise.all([
          base44.entities.Project.list(),
          base44.entities.Artist.list(),
          base44.entities.Team.list()
        ]);

        const projectResults = projects
          .filter(p => 
            p.project_owner_company?.toLowerCase().includes(lowerQuery) ||
            p.project_owner_name?.toLowerCase().includes(lowerQuery) ||
            p.notes?.toLowerCase().includes(lowerQuery) ||
            p.location_city?.toLowerCase().includes(lowerQuery) ||
            p.location_country?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5);

        const artistResults = artists
          .filter(a =>
            a.full_name?.toLowerCase().includes(lowerQuery) ||
            a.role?.toLowerCase().includes(lowerQuery) ||
            a.based_in_city?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5);

        const teamResults = teams
          .filter(t =>
            t.team_code?.toLowerCase().includes(lowerQuery) ||
            t.city?.toLowerCase().includes(lowerQuery) ||
            t.country?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5);

        setResults({
          projects: projectResults,
          artists: artistResults,
          teams: teamResults,
          hasResults: projectResults.length > 0 || artistResults.length > 0 || teamResults.length > 0
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults({ projects: [], artists: [], teams: [], hasResults: false });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects, creators, teams..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : results.hasResults ? (
            <div className="divide-y divide-gray-200">
              {/* Projects Section */}
              {results.projects.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 px-2">Projects</h4>
                  <div className="space-y-1">
                    {results.projects.map(p => (
                      <Link
                        key={p.id}
                        to={createPageUrl('Projects')}
                        onClick={() => setIsOpen(false)}
                        className="block p-2 hover:bg-gray-50 rounded text-sm text-gray-900 hover:text-black transition-colors"
                      >
                        <div className="font-medium">{p.project_owner_company || p.project_owner_name}</div>
                        <div className="text-xs text-gray-500">{p.location_city}, {p.location_country}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators Section */}
              {results.artists.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 px-2">Creators</h4>
                  <div className="space-y-1">
                    {results.artists.map(a => (
                      <Link
                        key={a.id}
                        to={createPageUrl('ApplyArtist')}
                        onClick={() => setIsOpen(false)}
                        className="block p-2 hover:bg-gray-50 rounded text-sm text-gray-900 hover:text-black transition-colors"
                      >
                        <div className="font-medium">{a.full_name}</div>
                        <div className="text-xs text-gray-500">{a.role} • {a.based_in_city || 'Europe'}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams Section */}
              {results.teams.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 px-2">Teams</h4>
                  <div className="space-y-1">
                    {results.teams.map(t => (
                      <Link
                        key={t.id}
                        to={createPageUrl('ApplyTeam')}
                        onClick={() => setIsOpen(false)}
                        className="block p-2 hover:bg-gray-50 rounded text-sm text-gray-900 hover:text-black transition-colors"
                      >
                        <div className="font-medium">{t.team_code}</div>
                        <div className="text-xs text-gray-500">{t.city}, {t.country}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No results for "{query}"
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}