export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, portalId } = req.query;

  if (!token || !portalId) {
    return res.status(400).json({ error: 'Missing token or portalId' });
  }

  try {
    const response = await fetch(
      `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/`,
      {
        headers: { 
          Authorization: `Zoho-oauthtoken ${token}` 
        }
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects', message: error.message });
  }
}