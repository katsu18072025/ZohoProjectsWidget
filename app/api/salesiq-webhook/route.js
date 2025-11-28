import { NextResponse } from 'next/server';

// HEAD request - SalesIQ uses this to validate the webhook
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// GET request - for manual testing
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'SalesIQ webhook endpoint is ready'
  }, { status: 200 });
}

// POST request - SalesIQ sends data here
export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('SalesIQ webhook received:', body);
    
    // Extract data from SalesIQ payload
    const visitorMessage = body.message || body.question || '';
    const visitorEmail = body.visitor?.email || body.email || '';
    const visitorName = body.visitor?.name || body.name || '';
    
    // Check if asking about projects
    if (visitorMessage.toLowerCase().includes('project') || 
        visitorMessage.toLowerCase().includes('status') ||
        visitorMessage.toLowerCase().includes('task')) {
      
      // Call your Zoho Projects API
      const projectsData = await fetchProjects();
      
      // Return in SalesIQ expected format
      return NextResponse.json({
        action: 'reply',
        replies: [
          formatProjectsResponse(projectsData)
        ]
      }, { status: 200 });
    }
    
    // Default response
    return NextResponse.json({
      action: 'reply',
      replies: [
        "I can help you check your project status. Try asking 'Show my projects' or 'What's my project status?'"
      ]
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json({
      action: 'reply',
      replies: ['Sorry, I encountered an error. Please try again.']
    }, { status: 200 });
  }
}

// Fetch projects from Zoho
async function fetchProjects() {
  try {
    const portalId = process.env.ZOHO_PORTAL_ID;
    const accessToken = process.env.ZOHO_ACCESS_TOKEN;
    
    const response = await fetch(
      `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.projects || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Format projects for chat response
function formatProjectsResponse(projects) {
  if (!projects || projects.length === 0) {
    return "No active projects found.";
  }
  
  let message = `📊 Found ${projects.length} project(s):\n\n`;
  
  projects.slice(0, 5).forEach((project) => {
    const status = project.status || 'active';
    message += `• ${project.name} - ${status}\n`;
  });
  
  if (projects.length > 5) {
    message += `\n...and ${projects.length - 5} more`;
  }
  
  return message;
}