import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import { Users, FolderKanban, Clock, CheckCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#1a1a1a', '#6b7280', '#d1d5db', '#374151'];

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState([]);
  const [artists, setArtists] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, a, t] = await Promise.all([
          adminApi.projects.list(),
          adminApi.artists.list(),
          adminApi.teams.list(),
        ]);
        setProjects(p);
        setArtists(a);
        setTeams(t);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const pendingProjects = projects.filter(p => p.status === 'submitted').length;
  const approvedProjects = projects.filter(p => p.status === 'verified').length;
  const pendingArtists = artists.filter(a => a.status === 'pending').length;
  const approvedArtists = artists.filter(a => a.status === 'approved').length;
  const pendingTeams = teams.filter(t => t.status === 'pending').length;

  // Project types breakdown
  const projectTypeData = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.project_type || 'other'] = (acc[p.project_type || 'other'] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  // Artist roles breakdown (top 5)
  const artistRoleData = Object.entries(
    artists.reduce((acc, a) => {
      acc[a.role || 'other'] = (acc[a.role || 'other'] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  // Status distribution for projects
  const statusData = [
    { name: 'Submitted', value: projects.filter(p => p.status === 'submitted').length, color: '#f59e0b' },
    { name: 'Verified', value: projects.filter(p => p.status === 'verified').length, color: '#10b981' },
    { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Rejected', value: projects.filter(p => p.status === 'rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      sub: `${pendingProjects} pending`,
      icon: FolderKanban,
      trend: pendingProjects > 0 ? 'up' : 'neutral',
    },
    {
      label: 'Total Creators',
      value: artists.length,
      sub: `${approvedArtists} approved`,
      icon: Users,
      trend: 'up',
    },
    {
      label: 'Teams',
      value: teams.length,
      sub: `${pendingTeams} pending`,
      icon: Activity,
      trend: pendingTeams > 0 ? 'up' : 'neutral',
    },
    {
      label: 'Pending Review',
      value: pendingProjects + pendingArtists + pendingTeams,
      sub: 'across all queues',
      icon: Clock,
      trend: pendingProjects + pendingArtists + pendingTeams > 0 ? 'up' : 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of Studio22 platform activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100"
              style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Artist Roles */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Creator Roles Distribution</h3>
            <span className="text-xs text-gray-400">{artists.length} total</span>
          </div>
          {artistRoleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={artistRoleData} barSize={24}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="value" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">No creator data yet</div>
          )}
        </div>

        {/* Pie Chart - Project Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Project Status</h3>
            <span className="text-xs text-gray-400">{projects.length} total</span>
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[130px] flex items-center justify-center text-sm text-gray-400">No project data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row - Project Types + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Types */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Project Types</h3>
          {projectTypeData.length > 0 ? (
            <div className="space-y-2.5">
              {projectTypeData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 capitalize truncate">{d.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-black h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.round((d.value / projects.length) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-5 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No data yet</div>
          )}
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Projects awaiting approval', count: pendingProjects, href: '/ProjectAdmin', color: 'bg-amber-100 text-amber-700' },
              { label: 'Creator applications', count: pendingArtists, href: '/ArtistAdmin', color: 'bg-blue-100 text-blue-700' },
              { label: 'Team applications', count: pendingTeams, href: '/TeamAdmin', color: 'bg-purple-100 text-purple-700' },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.count}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}