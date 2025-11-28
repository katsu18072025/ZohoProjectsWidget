import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, CheckCircle, Clock, AlertCircle, Search, Edit2, X } from 'lucide-react';

const ZohoProjectsWidget = () => {
  // Configuration - REPLACE WITH YOUR ACTUAL VALUES
    const CONFIG = {
  portalId: process.env.NEXT_PUBLIC_ZOHO_PORTAL_ID
};

// Later in code, check if it exists
if (!CONFIG.portalId) {
  setError('Configuration error: Portal ID not set');
  return;
}

  const [accessToken, setAccessToken] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateBug, setShowCreateBug] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'Medium'
  });

  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    severity: 'Medium'
  });

  // Refresh Access Token
  
  const refreshAccessToken = async () => {
    try {
        const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (data?.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
        } 
        else {
        throw new Error(data.error || 'Failed to refresh token');
        }
    } catch (err) {
        console.error('Token refresh error:', err);
        setError('Authentication failed. Please check your credentials.');
        return null;
    }
};

// Fetch Projects
const fetchProjects = async (token) => {
  try {
    const res = await fetch(
      `/api/projects?token=${token}&portalId=${CONFIG.portalId}`
    );
    const data = await res.json();
    
    if (Array.isArray(data?.projects)) {
      setProjects(data.projects);
      if (data.projects.length > 0) {
        setSelectedProject(data.projects[0].id);
      }
    } else {
      setProjects([]);
      setError('No projects found or access denied');
    }
  } catch (err) {
    console.error('Fetch projects error:', err);
    setError('Failed to fetch projects');
  }
};

  // Fetch Tasks
const fetchTasks = async (token, projectId) => {
  if (!projectId) return;
  setLoading(true);
  try {
    const res = await fetch(
      `/api/tasks?token=${token}&portalId=${CONFIG.portalId}&projectId=${projectId}`
    );
    const data = await res.json();
    
    if (Array.isArray(data?.tasks)) {
      setTasks(data.tasks);
      setError('');
    } else {
      setTasks([]);
    }
  } catch (err) {
    console.error('Fetch tasks error:', err);
    setError('Failed to fetch tasks');
  } finally {
    setLoading(false);
  }
};

// Create Task
const createTask = async () => {
  if (!newTask.name || !selectedProject) {
    setError('Task name is required');
    return;
  }
  setLoading(true);
  try {
    const res = await fetch(
      `/api/tasks?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newTask.name,
          description: newTask.description,
          priority: newTask.priority
        })
      }
    );
    
    const data = await res.json();
    if (data?.tasks?.[0]) {
      setNewTask({ name: '', description: '', priority: 'Medium' });
      setShowCreateTask(false);
      await fetchTasks(accessToken, selectedProject);
      setError('');
    } else {
      setError('Failed to create task');
    }
  } catch (err) {
    console.error('Create task error:', err);
    setError('Failed to create task');
  } finally {
    setLoading(false);
  }
};


// Create Bug
const createBug = async () => {
  if (!newBug.title || !selectedProject) {
    setError('Bug title is required');
    return;
  }
  setLoading(true);
  try {
    const res = await fetch(
      `/api/bugs?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newBug.title,
          description: newBug.description,
          severity: newBug.severity
        })
      }
    );
    
    if (res.ok) {
      setNewBug({ title: '', description: '', severity: 'Medium' });
      setShowCreateBug(false);
      setError('Bug created successfully!');
      setTimeout(() => setError(''), 3000);
    } else {
      setError('Failed to create bug');
    }
  } catch (err) {
    console.error('Create bug error:', err);
    setError('Failed to create bug');
  } finally {
    setLoading(false);
  }
};


// Update Task Status
const updateTaskStatus = async (taskId, newStatus) => {
  setLoading(true);
  try {
    const res = await fetch(
      `/api/tasks?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}&action=update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: taskId,
          data: { status: newStatus }
        })
      }
    );
    
    if (res.ok) {
      await fetchTasks(accessToken, selectedProject);
      setEditingTask(null);
    } else {
      setError('Failed to update task');
    }
  } catch (err) {
    console.error('Update task error:', err);
    setError('Failed to update task');
  } finally {
    setLoading(false);
  }
};


  // Initialize
  useEffect(() => {
    const init = async () => {
      const token = await refreshAccessToken();
      if (token) {
        await fetchProjects(token);
      }
    };
    init();
  }, []);

  // Fetch tasks when project changes
  useEffect(() => {
    if (accessToken && selectedProject) {
      fetchTasks(accessToken, selectedProject);
    }
  }, [selectedProject, accessToken]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks.slice();

    if (customerEmail) {
      filtered = filtered.filter(task =>
        task.details?.owners?.some(o =>
          o.email?.toLowerCase().includes(customerEmail.toLowerCase())
        ) || task.details?.created_by?.toLowerCase().includes(customerEmail.toLowerCase())
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [searchTerm, customerEmail, tasks]);

  const getStatusIcon = (statusName) => {
    const status = (statusName || '').toLowerCase();
    if (status.includes('complete')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('progress')) return <Clock className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">Zoho Projects Manager</h2>
        <p className="text-sm opacity-90">Manage tasks directly from SalesIQ</p>
      </div>

      {/* Customer Email Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Email
        </label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="customer@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter customer email to filter their tasks
        </p>
      </div>

      {/* Project Selection & Actions */}
      <div className="p-4 border-b bg-white">
        <div className="flex gap-3 items-center">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchTasks(accessToken, selectedProject)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
          <button
            onClick={() => setShowCreateBug(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Create Bug
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Create Task Form */}
      {showCreateTask && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Create New Task</h3>
            <button onClick={() => setShowCreateTask(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="Task name *"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <button
              onClick={createTask}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {/* Create Bug Form */}
      {showCreateBug && (
        <div className="p-4 bg-red-50 border-b">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Create New Bug</h3>
            <button onClick={() => setShowCreateBug(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newBug.title}
              onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
              placeholder="Bug title *"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <textarea
              value={newBug.description}
              onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
              placeholder="Bug description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newBug.severity}
              onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Medium">Medium</option>
              <option value="Minor">Minor</option>
            </select>
            <button
              onClick={createBug}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Bug'}
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">
            Tasks {customerEmail && `for ${customerEmail}`}
          </h3>
          <span className="text-sm text-gray-500">{filteredTasks.length} task(s)</span>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading tasks...
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        )}

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(task.status?.name)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.name || '(no title)'}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>Priority: {task.priority || 'Medium'}</span>
                      <span>Status: {task.status?.name || 'Open'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTask(task.id === editingTask ? null : task.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {editingTask === task.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <select
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    defaultValue={task.status?.name || 'Open'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZohoProjectsWidget;