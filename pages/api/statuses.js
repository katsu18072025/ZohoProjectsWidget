// pages/api/statuses.js
// New API endpoint to fetch available statuses for a project

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, portalId, projectId } = req.query;

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      received: { token: !!token, portalId, projectId }
    });
  }

  try {
    const url = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/statuses/`;
    
    console.log('Fetching statuses from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': `Zoho-oauthtoken ${token}`
      }
    });

    console.log('Statuses API Response Status:', response.status);

    const responseText = await response.text();
    console.log('Statuses API Response Text:', responseText);

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

    console.log('Statuses API Response Data:', data);
    
    return res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Statuses API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch statuses', 
      message: error.message,
      stack: error.stack
    });
  }
}