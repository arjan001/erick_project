import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Team } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderKanban, Plus, CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import { useAuth } from '@/lib/AuthContext';

export default function TeamTasksPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    loadTeamData();
  }, [isAuthenticated]);

  const loadTeamData = async () => {
    try {
      let teamData = null;
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_date', 1).then(r => r?.[0] || null);
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_date', 1);
        teamData = teams?.[0] || null;
      }
      setTeam(teamData);
      if (teamData) {
        fetchTasks(teamData.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading team:', err);
      toastError('Load Failed', 'Failed to load team data');
      setLoading(false);
    }
  };

  const fetchTasks = async (teamId) => {
    try {
      const allTasks = await base44.entities.Task.filter({ team_id: teamId });
      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toastError('Load Failed', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!team) return;
    try {
      await base44.entities.Task.create({
        ...taskForm,
        team_id: team.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      success('Task Created', 'Task has been created successfully');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      toastError('Creation Failed', 'Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await base44.entities.Task.update(taskId, { status: 'completed', completed_at: new Date().toISOString() });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      success('Task Completed', 'Task has been marked as completed');
    } catch (err) {
      console.error('Error completing task:', err);
      toastError('Action Failed', 'Failed to complete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    completed: CheckCircle,
    in_progress: Clock,
    pending: AlertCircle
  };

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <Button onClick={() => setShowTaskModal(true)} className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const StatusIcon = statusIcons[task.status] || AlertCircle;
              return (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </div>
                    <StatusIcon className={`w-5 h-5 ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in_progress' ? 'text-yellow-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <User className="w-4 h-4" />
                    <span>{task.assigned_to || 'Unassigned'}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-4">Create tasks to manage your team's work</p>
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Assigned To</label>
                <Input
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  placeholder="Member name or email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCreateTask} className="flex-1 bg-black text-white hover:bg-gray-800">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
