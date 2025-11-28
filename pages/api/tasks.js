export default async function handler(req, res) {
  const { token, portalId, projectId } = req.query;

  if (req.method === 'GET') {
    if (!token || !portalId || !projectId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      const response = await fetch(
        `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`,
        {
          headers: { 
            Authorization: `Zoho-oauthtoken ${token}` 
          }
        }
      );

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
    }
  }

  if (req.method === 'POST') {
    const { action } = req.query;
    const body = req.body;

    if (!token || !portalId || !projectId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      let url = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;
      
      // If updating a specific task
      if (action === 'update' && body.taskId) {
        url += `${body.taskId}/`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body.data || body)
      });

      const data = await response.json();
      return res.status(response.ok ? 200 : 400).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process task', message: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}