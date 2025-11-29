export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, portalId } = req.query;

  console.log('Projects API called:', {
    method: req.method,
    token: token ? 'Present' : 'Missing',
    portalId
  });

  if (!token || !portalId) {
    return res.status(400).json({ 
      error: 'Missing token or portalId',
      received: { token: !!token, portalId }
    });
  }

  try {
    // Use v3 API endpoint instead of old restapi
    const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects`;
    
    console.log('Fetching projects from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Projects API response status:', response.status);

    // Handle 204 No Content
    if (response.status === 204) {
      console.log('No projects found (204)');
      return res.status(200).json({ projects: [] });
    }

    const responseText = await response.text();
    console.log('Projects API raw response:', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse projects response as JSON:', parseErr);
      return res.status(500).json({ 
        error: 'Invalid JSON response from Zoho API',
        responseText: responseText.substring(0, 200)
      });
    }

    console.log('Projects API parsed data:', {
      hasProjects: !!data?.projects,
      projectCount: data?.projects?.length || 0
    });

    if (!response.ok) {
      console.error('Projects API error response:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Projects API Error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    return res.status(500).json({ 
      error: 'Failed to fetch projects', 
      message: error.message,
      type: error.constructor.name,
      hint: 'Network error - check if you can reach projectsapi.zoho.com. Verify your access token is valid.'
    });
  }
}