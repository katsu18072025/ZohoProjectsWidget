// pages/api/tasklists.js
export default async function handler(req, res) {
  const { token, portalId, projectId } = req.query;

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      received: { token: !!token, portalId, projectId }
    });
  }

  // GET - Fetch all tasklists
  if (req.method === 'GET') {
    try {
      const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasklists`;
      
      console.log('Fetching tasklists from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      });

      console.log('Tasklists API Response Status:', response.status);

      // Handle 204 No Content
      if (response.status === 204) {
        console.log('No tasklists found (204)');
        return res.status(200).json({ tasklists: [] });
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

      console.log('Tasklists API Response Data:', data);
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Tasklists API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch tasklists', 
        message: error.message
      });
    }
  }

  // POST - Create tasklist
  if (req.method === 'POST') {
    const body = req.body;
    
    console.log('Creating tasklist:', body);
    
    try {
      const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasklists`;
      
      console.log('Create tasklist URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('Create tasklist response status:', response.status);

      const responseText = await response.text();
      console.log('Create tasklist response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (response.status >= 200 && response.status < 300) {
          return res.status(200).json({ success: true, message: 'Tasklist created successfully' });
        }
        return res.status(500).json({ 
          error: 'Invalid JSON response',
          responseText 
        });
      }
      
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('Create tasklist error:', error);
      return res.status(500).json({ 
        error: 'Failed to create tasklist', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
