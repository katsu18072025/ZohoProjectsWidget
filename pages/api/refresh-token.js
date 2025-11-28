export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CONFIG = {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    authDomain: 'https://accounts.zoho.com'
  };

  try {
    const response = await fetch(`${CONFIG.authDomain}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: CONFIG.refreshToken,
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    const data = await response.json();
    
    if (data?.access_token) {
      return res.status(200).json({ access_token: data.access_token });
    } else {
      return res.status(400).json({ error: 'Failed to refresh token', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Token refresh failed', message: error.message });
  }
}