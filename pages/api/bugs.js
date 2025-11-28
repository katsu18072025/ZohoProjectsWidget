export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, portalId, projectId } = req.query;
  const body = req.body;

  if (!token || !portalId || !projectId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch(
      `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/bugs/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create bug', message: error.message });
  }
}