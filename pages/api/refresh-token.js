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

  // Validate environment variables
  if (!CONFIG.clientId || !CONFIG.clientSecret || !CONFIG.refreshToken) {
    console.error('Missing OAuth credentials:', {
      hasClientId: !!CONFIG.clientId,
      hasClientSecret: !!CONFIG.clientSecret,
      hasRefreshToken: !!CONFIG.refreshToken
    });
    return res.status(400).json({ 
      error: 'Missing OAuth credentials in environment variables',
      details: {
        hasClientId: !!CONFIG.clientId,
        hasClientSecret: !!CONFIG.clientSecret,
        hasRefreshToken: !!CONFIG.refreshToken,
        hint: 'Make sure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN are set in .env.local'
      }
    });
  }

  try {
    console.log('Attempting token refresh...');
    console.log('Auth Domain:', CONFIG.authDomain);
    console.log('Client ID:', CONFIG.clientId.substring(0, 10) + '...');
    
    const tokenUrl = `${CONFIG.authDomain}/oauth/v2/token`;
    const params = new URLSearchParams({
      refresh_token: CONFIG.refreshToken,
      client_id: CONFIG.clientId,
      client_secret: CONFIG.clientSecret,
      grant_type: 'refresh_token'
    });

    console.log('Fetching from:', tokenUrl);
    console.log('Request params:', {
      grant_type: 'refresh_token',
      client_id: CONFIG.clientId.substring(0, 10) + '...',
      has_refresh_token: !!CONFIG.refreshToken
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    console.log('Token refresh response status:', response.status);
    
    const responseText = await response.text();
    console.log('Token refresh raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse response as JSON:', parseErr);
      return res.status(500).json({ 
        error: 'Invalid response from Zoho OAuth',
        details: {
          message: 'Response was not valid JSON',
          response: responseText.substring(0, 200)
        }
      });
    }
    
    console.log('Token refresh parsed response:', { 
      hasAccessToken: !!data?.access_token,
      error: data?.error,
      errorDescription: data?.error_description
    });
    
    if (data?.access_token) {
      console.log('Token refresh successful');
      return res.status(200).json({ access_token: data.access_token });
    } else {
      console.error('Token refresh failed:', data);
      return res.status(400).json({ 
        error: 'Failed to refresh token', 
        details: {
          error: data?.error,
          error_description: data?.error_description,
          message: data?.message,
          hint: data?.error === 'invalid_grant' ? 'Refresh token may be expired. Generate a new one from Zoho Developer Console.' : 'Check your OAuth credentials'
        }
      });
    }
  } catch (error) {
    console.error('Token refresh exception:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    return res.status(500).json({ 
      error: 'Token refresh failed', 
      message: error.message,
      type: error.constructor.name,
      hint: 'Network error - check if you can reach accounts.zoho.com. Verify OAuth credentials in .env.local',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}