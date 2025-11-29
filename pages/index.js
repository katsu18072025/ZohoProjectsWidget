import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, CheckCircle, Clock, AlertCircle, Search, Edit2, X, Bug } from 'lucide-react';

const ZohoProjectsWidget = () => {
  // Configuration
  const CONFIG = {
    portalId: process.env.NEXT_PUBLIC_ZOHO_PORTAL_ID
  };

  const [accessToken, setAccessToken] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [defaultTasklistId, setDefaultTasklistId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateBug, setShowCreateBug] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'medium'
  });

  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    severity: 'Medium'
  });

  // Debug logger
  const addDebug = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data || '');
  };

  // Refresh Access Token
  const refreshAccessToken = async () => {
    addDebug('Attempting to refresh access token...');
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      addDebug('Refresh token response status', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        addDebug('Refresh token error response', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      addDebug('Refresh token response data', data);
      
      if (data?.access_token) {
        setAccessToken(data.access_token);
        addDebug('Access token set successfully');
        setError('');
        return data.access_token;
      } else {
        throw new Error(data.error || 'No access token in response');
      }
    } catch (err) {
      addDebug('Token refresh error', err.message);
      setError(`Authentication failed: ${err.message}`);
      return null;
    }
  };

  // Fetch Projects
  const fetchProjects = async (token) => {
    if (!CONFIG.portalId) {
      setError('Portal ID not configured');
      addDebug('Portal ID missing');
      return;
    }

    addDebug('Fetching projects...', { token: token?.substring(0, 10) + '...', portalId: CONFIG.portalId });
    
    try {
      const url = `/api/projects?token=${token}&portalId=${CONFIG.portalId}`;
      addDebug('Projects API URL', url);
      
      const res = await fetch(url);
      addDebug('Projects response status', res.status);
      
      const data = await res.json();
      addDebug('Projects response data', data);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
      }
      
      if (Array.isArray(data?.projects)) {
        setProjects(data.projects);
        addDebug('Projects loaded', { count: data.projects.length });
        
        if (data.projects.length > 0) {
          const firstProjectId = data.projects[0].id_string || String(data.projects[0].id);
          setSelectedProject(firstProjectId);
          addDebug('Selected first project', firstProjectId);
        } else {
          setError('No projects found');
        }
      } else {
        addDebug('Unexpected projects response structure', data);
        setProjects([]);
        setError('Invalid response format from projects API');
      }
    } catch (err) {
      addDebug('Fetch projects error', err.message);
      setError(`Failed to fetch projects: ${err.message}`);
    }
  };

  // Fetch Tasks
  const fetchTasks = async (token, projectId) => {
    if (!projectId) {
      addDebug('No project selected for fetching tasks');
      return;
    }
    
    if (!token) {
      addDebug('No access token available for fetching tasks');
      setError('No access token. Please refresh authentication.');
      return;
    }

    setLoading(true);
    addDebug('Fetching tasks...', { projectId });
    
    try {
      const url = `/api/tasks?token=${token}&portalId=${CONFIG.portalId}&projectId=${projectId}`;
      addDebug('Tasks API URL', url);
      
      const res = await fetch(url);
      addDebug('Tasks response status', res.status);
      
      const responseText = await res.text();
      addDebug('Tasks raw response', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        addDebug('Failed to parse tasks response', parseErr.message);
        throw new Error('Invalid JSON response from tasks API');
      }
      
      addDebug('Tasks parsed data', data);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
      }
      
      if (Array.isArray(data?.tasks)) {
        setTasks(data.tasks);
        addDebug('Tasks loaded successfully', { count: data.tasks.length });
        
        // Extract default tasklist ID from first task
        if (data.tasks.length > 0 && data.tasks[0].tasklist) {
          const tasklistId = data.tasks[0].tasklist.id_string || data.tasks[0].tasklist.id;
          setDefaultTasklistId(tasklistId);
          addDebug('Default tasklist ID set', tasklistId);
        }
        
        // Also fetch project statuses for this project
        await fetchProjectStatuses(token, projectId);
        
        setError('');
      } else {
        addDebug('Unexpected tasks response structure', data);
        setTasks([]);
        if (data?.tasks === undefined) {
          setError('Invalid response format from tasks API');
        }
      }
    } catch (err) {
      addDebug('Fetch tasks error', err.message);
      setError(`Failed to fetch tasks: ${err.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Project Statuses
  const fetchProjectStatuses = async (token, projectId) => {
    try {
      const url = `/api/statuses?token=${token}&portalId=${CONFIG.portalId}&projectId=${projectId}`;
      addDebug('Fetching project statuses...', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      addDebug('Project statuses response', data);
      
      if (res.ok && Array.isArray(data?.statuses)) {
        setProjectStatuses(data.statuses);
        addDebug('Project statuses loaded', { count: data.statuses.length });
      } else {
        // If statuses API fails, use default statuses
        setProjectStatuses([
          { id: '2595946000000016068', name: 'Open', type: 'open', color_code: '#74cb80' },
          { id: '2595946000000031001', name: 'In Progress', type: 'open', color_code: '#08aeea' },
          { id: '2595946000000031003', name: 'In Review', type: 'open', color_code: '#8cbabb' },
          { id: '2595946000000031005', name: 'To be Tested', type: 'open', color_code: '#f6a96d' },
          { id: '2595946000000031007', name: 'On Hold', type: 'open', color_code: '#fbc11e' },
          { id: '2595946000000031009', name: 'Delayed', type: 'open', color_code: '#c5a070' },
          { id: '2595946000000016071', name: 'Closed', type: 'closed', color_code: '#f56b62' },
          { id: '2595946000000031011', name: 'Cancelled', type: 'closed', color_code: '#558dca' }
        ]);
        addDebug('Using default statuses');
      }
    } catch (err) {
      addDebug('Failed to fetch project statuses', err.message);
      // Use defaults
      setProjectStatuses([
        { id: '2595946000000016068', name: 'Open', type: 'open', color_code: '#74cb80' },
        { id: '2595946000000031001', name: 'In Progress', type: 'open', color_code: '#08aeea' },
        { id: '2595946000000031003', name: 'In Review', type: 'open', color_code: '#8cbabb' },
        { id: '2595946000000031005', name: 'To be Tested', type: 'open', color_code: '#f6a96d' },
        { id: '2595946000000031007', name: 'On Hold', type: 'open', color_code: '#fbc11e' },
        { id: '2595946000000031009', name: 'Delayed', type: 'open', color_code: '#c5a070' },
        { id: '2595946000000016071', name: 'Closed', type: 'closed', color_code: '#f56b62' },
        { id: '2595946000000031011', name: 'Cancelled', type: 'closed', color_code: '#558dca' }
      ]);
    }
  };

  // Create Tasklist
  const createTasklist = async (projectId) => {
    try {
      const url = `/api/tasklists?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${projectId}`;
      
      const payload = {
        name: 'Default Tasklist'
      };
      
      addDebug('Creating tasklist...', payload);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      addDebug('Create tasklist response status', res.status);
      
      const responseText = await res.text();
      addDebug('Create tasklist raw response', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        addDebug('Failed to parse create tasklist response', parseErr.message);
        throw new Error(`Invalid response: ${responseText}`);
      }
      
      addDebug('Create tasklist parsed response', data);
      
      if (res.ok) {
        // Extract tasklist ID from response
        const tasklistId = data?.tasklist?.id || data?.tasklist?.id_string || data?.id;
        if (tasklistId) {
          setDefaultTasklistId(tasklistId);
          addDebug('Tasklist created successfully', { tasklistId });
          return tasklistId;
        } else {
          throw new Error('No tasklist ID in response');
        }
      } else {
        const errorMsg = data?.error?.title || data?.error?.message || JSON.stringify(data?.error) || 'Failed to create tasklist';
        throw new Error(errorMsg);
      }
    } catch (err) {
      addDebug('Create tasklist error', err.message);
      throw err;
    }
  };

  // Create Task
  const createTask = async () => {
    if (!newTask.name || !selectedProject) {
      setError('Task name is required');
      return;
    }
    
    setLoading(true);
    addDebug('Creating task...', newTask);
    
    try {
      let tasklistId = defaultTasklistId;
      
      // If no tasklist exists, create one
      if (!tasklistId) {
        addDebug('No tasklist found, creating one...');
        tasklistId = await createTasklist(selectedProject);
      }
      
      const url = `/api/tasks?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}`;
      
      // Build payload according to Zoho API v3 requirements
      const payload = {
        name: newTask.name,
        description: newTask.description,
        priority: newTask.priority,
        tasklist: {
          id: tasklistId
        }
      };
      
      addDebug('Create task payload', payload);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      addDebug('Create task response status', res.status);
      
      const responseText = await res.text();
      addDebug('Create task raw response', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        addDebug('Failed to parse create task response', parseErr.message);
        throw new Error(`Invalid response: ${responseText}`);
      }
      
      addDebug('Create task parsed response', data);
      
      if (res.ok && (data?.tasks?.[0] || data?.id)) {
        setNewTask({ name: '', description: '', priority: 'medium' });
        setShowCreateTask(false);
        setSuccess('Task created successfully!');
        setTimeout(() => setSuccess(''), 3000);
        await fetchTasks(accessToken, selectedProject);
      } else {
        const errorMsg = data?.error?.title || data?.error?.message || JSON.stringify(data?.error) || 'Failed to create task';
        throw new Error(errorMsg);
      }
    } catch (err) {
      addDebug('Create task error', err.message);
      setError(`Failed to create task: ${err.message}`);
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
    addDebug('Creating bug...', newBug);
    
    try {
      const url = `/api/bugs?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBug.title,
          description: newBug.description,
          severity: newBug.severity
        })
      });
      
      addDebug('Create bug response status', res.status);
      
      if (res.ok) {
        setNewBug({ title: '', description: '', severity: 'Medium' });
        setShowCreateBug(false);
        setSuccess('Bug created successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create bug');
      }
    } catch (err) {
      addDebug('Create bug error', err.message);
      setError(`Failed to create bug: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Task Status
  const updateTaskStatus = async (taskId, statusId) => {
    if (!statusId) {
      setError('Please select a status');
      return;
    }
    
    setLoading(true);
    addDebug('Updating task status...', { taskId, statusId });
    
    try {
      const url = `/api/tasks?token=${accessToken}&portalId=${CONFIG.portalId}&projectId=${selectedProject}&taskId=${taskId}`;
      
      const payload = { status: statusId };
      addDebug('Update request payload', payload);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      addDebug('Update task response status', res.status);
      
      if (res.ok || res.status === 204) {
        setSuccess('Task status updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setEditingTask(null);
        // Refresh tasks to show updated status
        await fetchTasks(accessToken, selectedProject);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update task status');
      }
    } catch (err) {
      addDebug('Update task error', err.message);
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      addDebug('Initializing widget...');
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
      addDebug('Project changed, fetching tasks...', selectedProject);
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
    if (status.includes('complete') || status.includes('closed')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('progress')) return <Clock className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">Zoho Projects Manager</h2>
        <p className="text-sm opacity-90">Manage tasks directly from your interface</p>
      </div>

      {/* Debug Panel (Collapsible) */}
      <details className="p-4 bg-gray-100 border-b">
        <summary className="cursor-pointer font-semibold text-sm text-gray-700">
          🔍 Debug Info ({debugInfo.length} logs)
        </summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          {debugInfo.slice(-10).reverse().map((log, idx) => (
            <div key={idx} className="text-xs font-mono bg-white p-2 mb-1 rounded border">
              <span className="text-gray-500">[{log.timestamp}]</span>
              <span className="text-blue-600 ml-2">{log.message}</span>
              {log.data && (
                <pre className="mt-1 text-gray-600 overflow-x-auto">
                  {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                </pre>
              )}
            </div>
          ))}
        </div>
      </details>

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
          Filter tasks by customer email
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
              <option key={project.id_string || project.id} value={project.id_string || String(project.id)}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchTasks(accessToken, selectedProject)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !selectedProject}
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={!selectedProject}
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
          <button
            onClick={() => setShowCreateBug(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={!selectedProject}
          >
            <Bug className="w-4 h-4" />
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

      {/* Success Message */}
      {success && (
        <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
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
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="none">No Priority</option>
            </select>
            <button
              onClick={createTask}
              disabled={loading || !newTask.name}
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
              disabled={loading || !newBug.title}
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
            {tasks.length === 0 ? 'No tasks in this project' : 'No tasks match your filters'}
          </div>
        )}

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id_string || task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
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
                      {task.details?.owners?.length > 0 && (
                        <span>Owner: {task.details.owners[0].name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTask((task.id_string || task.id) === editingTask ? null : (task.id_string || task.id))}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {editingTask === (task.id_string || task.id) && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Update Status:</label>
                  <select
                    onChange={(e) => updateTaskStatus(task.id_string || task.id, e.target.value)}
                    defaultValue={task.status?.id || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Status</option>
                    {projectStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
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