// pages/api/tasks.js
export default async function handler(req, res) {
  const { token, portalId, projectId, action } = req.query;

  // Add detailed logging
  console.log('Tasks API called:', {
    method: req.method,
    token: token ? 'Present' : 'Missing',
    portalId,
    projectId,
    action
  });

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      received: { token: !!token, portalId, projectId }
    });
  }

  if (req.method === 'GET') {
    try {
      // Correct Zoho Projects API endpoint for tasks
      const url = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;
      
      console.log('Fetching tasks from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      });

      console.log('Tasks API Response Status:', response.status);

      // Get the response text first
      const responseText = await response.text();
      console.log('Tasks API Response Text:', responseText);

      // Try to parse as JSON
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
      
      // Return the response with appropriate status
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Tasks API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch tasks', 
        message: error.message,
        stack: error.stack
      });
    }
  }

  if (req.method === 'POST') {
    const body = req.body;
    
    console.log('Creating/Updating task:', body);
    
    try {
      let url = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;
      let method = 'POST';
      
      // If updating a specific task
      if (action === 'update' && body.taskId) {
        url = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/${body.taskId}/`;
        console.log('Updating task at:', url);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body.data || body)
      });

      const responseText = await response.text();
      console.log('Task Create/Update Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return res.status(500).json({ 
          error: 'Invalid JSON response',
          responseText 
        });
      }
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Task Create/Update Error:', error);
      return res.status(500).json({ 
        error: 'Failed to process task', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}