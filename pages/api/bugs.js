export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, portalId, projectId } = req.query;
  const body = req.body;

  console.log('Bugs API called:', {
    method: req.method,
    token: token ? 'Present' : 'Missing',
    portalId,
    projectId,
    body
  });

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Build the correct payload for Zoho API v3
    // Note: Zoho API expects 'name' not 'title' for issues/bugs
    const payload = {
      name: body.title,
      description: body.description,
      severity: body.severity || 'Medium'
    };

    console.log('Create bug payload:', payload);

    const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/issues`;
    
    console.log('Create bug URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Create bug response status:', response.status);

    const responseText = await response.text();
    console.log('Create bug response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      if (response.status >= 200 && response.status < 300) {
        return res.status(200).json({ success: true, message: 'Bug created successfully' });
      }
      return res.status(500).json({ 
        error: 'Invalid JSON response',
        responseText 
      });
    }
    
    return res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Create bug error:', error);
    return res.status(500).json({ 
      error: 'Failed to create bug', 
      message: error.message 
    });
  }
}