import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Briefcase, FolderKanban } from 'lucide-react';

export default function ClientRecentApplications({ applications, projects, jobs }) {
  // Group applications by project or job
  const applicationCounts = React.useMemo(() => {
    const counts = {};
    
    applications.forEach(app => {
      let key, title, type;
      
      if (app.project_id) {
        const project = projects?.find(p => p.id === app.project_id);
        key = `project-${app.project_id}`;
        title = project?.title || project?.project_type || 'Unknown Project';
        type = 'project';
      } else if (app.job_id) {
        const job = jobs?.find(j => j.id === app.job_id);
        key = `job-${app.job_id}`;
        title = job?.title || job?.job_type || 'Unknown Job';
        type = 'job';
      } else {
        return;
      }
      
      if (!counts[key]) {
        counts[key] = { title, type, count: 0, id: app.project_id || app.job_id };
      }
      counts[key].count++;
    });
    
    return Object.values(counts);
  }, [applications, projects, jobs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Applications Received</h3>
        <Link to={createPageUrl('ClientApplications')} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
          View all
        </Link>
      </div>
      {applicationCounts.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No applications yet</div>
      ) : (
        <div className="space-y-3">
          {applicationCounts.slice(0, 5).map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-gray-200">
                  {item.type === 'project' ? (
                    <FolderKanban className="w-4.5 h-4.5 text-gray-600" />
                  ) : (
                    <Briefcase className="w-4.5 h-4.5 text-gray-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-lg font-semibold text-gray-900">{item.count}</span>
                <span className="text-xs text-gray-500 ml-1">app{item.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}