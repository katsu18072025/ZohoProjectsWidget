// pages/api/tasks.js
export default async function handler(req, res) {
  const { token, portalId, projectId, taskId } = req.query;

  console.log('Tasks API called:', {
    method: req.method,
    token: token ? 'Present' : 'Missing',
    portalId,
    projectId,
    taskId
  });

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      received: { token: !!token, portalId, projectId }
    });
  }

  // GET - Fetch all tasks
  if (req.method === 'GET') {
    try {
      const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasks`;
      
      console.log('Fetching tasks from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      });

      console.log('Tasks API Response Status:', response.status);

      // Handle 204 No Content
      if (response.status === 204) {
        console.log('No tasks found (204)');
        return res.status(200).json({ tasks: [] });
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return res.status(500).json({ 
          error: 'Invalid JSON response from Zoho API',
          responseText 
        });
      }

      console.log('Tasks API Response Data:', data);
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Tasks API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch tasks', 
        message: error.message
      });
    }
  }

  // POST - Create task
  if (req.method === 'POST' && !taskId) {
    const body = req.body;
    
    console.log('Creating task:', body);
    
    try {
      const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasks`;
      
      console.log('Create task URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('Create task response status:', response.status);

      const responseText = await response.text();
      console.log('Create task response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (response.status >= 200 && response.status < 300) {
          return res.status(200).json({ success: true, message: 'Task created successfully' });
        }
        return res.status(500).json({ 
          error: 'Invalid JSON response',
          responseText 
        });
      }
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Create task error:', error);
      return res.status(500).json({ 
        error: 'Failed to create task', 
        message: error.message 
      });
    }
  }

  // PATCH - Update task
  if (req.method === 'POST' && taskId) {
    const body = req.body;
    
    console.log('Updating task:', taskId, body);
    
    try {
      // Build the correct payload - status needs to be an object with id
      const payload = {
        status: {
          id: body.status
        }
      };
      
      console.log('Update payload:', payload);
      
      const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasks/${taskId}`;
      
      console.log('Update task URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Update task response status:', response.status);

      // Handle 204 No Content (successful update with no body)
      if (response.status === 204) {
        console.log('Task updated successfully (204)');
        return res.status(200).json({ success: true, message: 'Task updated successfully' });
      }

      const responseText = await response.text();
      console.log('Update task response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If we can't parse but status is 200-299, consider it success
        if (response.status >= 200 && response.status < 300) {
          return res.status(200).json({ success: true, message: 'Task updated successfully' });
        }
        return res.status(500).json({ 
          error: 'Invalid JSON response',
          responseText 
        });
      }
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Update task error:', error);
      return res.status(500).json({ 
        error: 'Failed to update task', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}