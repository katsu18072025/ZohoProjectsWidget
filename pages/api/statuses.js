// pages/api/statuses.js
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
    // Use v3 API endpoint instead of old restapi
    const url = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/statuses`;
    
    console.log('Fetching statuses from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Statuses API Response Status:', response.status);

    // Handle 204 No Content - project has no custom statuses
    if (response.status === 204) {
      console.log('No custom statuses, returning defaults');
      return res.status(200).json({
        statuses: [
          { id: '2595946000000016068', name: 'Open', type: 'open', color_code: '#74cb80' },
          { id: '2595946000000031001', name: 'In Progress', type: 'open', color_code: '#08aeea' },
          { id: '2595946000000031003', name: 'In Review', type: 'open', color_code: '#8cbabb' },
          { id: '2595946000000031005', name: 'To be Tested', type: 'open', color_code: '#f6a96d' },
          { id: '2595946000000031007', name: 'On Hold', type: 'open', color_code: '#fbc11e' },
          { id: '2595946000000031009', name: 'Delayed', type: 'open', color_code: '#c5a070' },
          { id: '2595946000000016071', name: 'Closed', type: 'closed', color_code: '#f56b62' },
          { id: '2595946000000031011', name: 'Cancelled', type: 'closed', color_code: '#558dca' }
        ]
      });
    }

    const responseText = await response.text();
    console.log('Statuses API Response Text:', responseText);

    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      console.log('Empty response, returning defaults');
      return res.status(200).json({
        statuses: [
          { id: '2595946000000016068', name: 'Open', type: 'open', color_code: '#74cb80' },
          { id: '2595946000000031001', name: 'In Progress', type: 'open', color_code: '#08aeea' },
          { id: '2595946000000031003', name: 'In Review', type: 'open', color_code: '#8cbabb' },
          { id: '2595946000000031005', name: 'To be Tested', type: 'open', color_code: '#f6a96d' },
          { id: '2595946000000031007', name: 'On Hold', type: 'open', color_code: '#fbc11e' },
          { id: '2595946000000031009', name: 'Delayed', type: 'open', color_code: '#c5a070' },
          { id: '2595946000000016071', name: 'Closed', type: 'closed', color_code: '#f56b62' },
          { id: '2595946000000031011', name: 'Cancelled', type: 'closed', color_code: '#558dca' }
        ]
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      // Return defaults on parse error
      return res.status(200).json({
        statuses: [
          { id: '2595946000000016068', name: 'Open', type: 'open', color_code: '#74cb80' },
          { id: '2595946000000031001', name: 'In Progress', type: 'open', color_code: '#08aeea' },
          { id: '2595946000000031003', name: 'In Review', type: 'open', color_code: '#8cbabb' },
          { id: '2595946000000031005', name: 'To be Tested', type: 'open', color_code: '#f6a96d' },
          { id: '2595946000000031007', name: 'On Hold', type: 'open', color_code: '#fbc11e' },
          { id: '2595946000000031009', name: 'Delayed', type: 'open', color_code: '#c5a070' },
          { id: '2595946000000016071', name: 'Closed', type: 'closed', color_code: '#f56b62' },
          { id: '2595946000000031011', name: 'Cancelled', type: 'closed', color_code: '#558dca' }
        ]
      });
    }

    console.log('Statuses API Response Data:', data);
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Statuses API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch statuses', 
      message: error.message
    });
  }
}