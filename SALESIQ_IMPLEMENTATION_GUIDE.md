# SalesIQ Widget Implementation Guide
## Zoho Projects Issue Manager

This guide walks you through converting your Next.js Zoho Projects Widget into a SalesIQ Scripts widget.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Widget State Contract](#widget-state-contract)
5. [Setup Instructions](#setup-instructions)
6. [Implementation Steps](#implementation-steps)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What Changed?
- **Frontend**: React/Next.js → SalesIQ Scripts (Deluge)
- **Backend**: Same Next.js API endpoints (no changes needed)
- **Deployment**: Widget runs in SalesIQ portal, calls your backend via `invokeUrl`

### Why SalesIQ Scripts?
- Server-rendered UI (no JavaScript framework needed)
- Direct integration with Zoho ecosystem
- Operators can use it directly in SalesIQ conversations
- Stateful widget that maintains context

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SalesIQ Portal                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SalesIQ Widget (Deluge Script)                      │   │
│  │  - detail(context) → UI sections                     │   │
│  │  - action(context, payload) → Handle actions         │   │
│  │  - State: email, projects, issues, editingIssue      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│                    invokeUrl (HTTPS)                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           Your Next.js Backend (Deployed)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/projects      - GET projects                   │   │
│  │  /api/tasks         - GET/POST/PATCH tasks           │   │
│  │  /api/bugs          - POST bugs                       │   │
│  │  /api/statuses      - GET statuses                    │   │
│  │  /api/tasklists     - GET/POST tasklists             │   │
│  │  /api/refresh-token - POST refresh OAuth token       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│                    Zoho Projects API v3                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend API Endpoints

### 1. GET /api/projects
**Purpose**: Fetch all projects for a portal

**Request**:
```
GET /api/projects?token=ACCESS_TOKEN&portalId=PORTAL_ID
```

**Response**:
```json
{
  "projects": [
    {
      "id": "2595946000000075005",
      "id_string": "2595946000000075005",
      "name": "Project Name",
      "description": "Project description"
    }
  ]
}
```

---

### 2. GET /api/tasks
**Purpose**: Fetch all tasks for a project

**Request**:
```
GET /api/tasks?token=ACCESS_TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID
```

**Response**:
```json
{
  "tasks": [
    {
      "id": "2595946000000066822",
      "id_string": "2595946000000066822",
      "name": "Task Title",
      "description": "Task description",
      "status": {
        "id": "2595946000000016068",
        "name": "Open"
      },
      "priority": "high",
      "created_time": "2025-11-29T12:00:00Z"
    }
  ]
}
```

---

### 3. POST /api/tasks
**Purpose**: Create a new task

**Request**:
```
POST /api/tasks?token=ACCESS_TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID

Body:
{
  "name": "New Task",
  "description": "Task description",
  "priority": "high",
  "tasklist": {
    "id": "TASKLIST_ID"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task created successfully"
}
```

---

### 4. POST /api/tasks (Update)
**Purpose**: Update task status

**Request**:
```
POST /api/tasks?token=ACCESS_TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID&taskId=TASK_ID

Body:
{
  "status": "STATUS_ID"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

---

### 5. POST /api/bugs
**Purpose**: Create a new bug/issue

**Request**:
```
POST /api/bugs?token=ACCESS_TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID

Body:
{
  "title": "Bug Title",
  "description": "Bug description",
  "severity": "High"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bug created successfully"
}
```

---

### 6. GET /api/statuses
**Purpose**: Fetch available statuses for a project

**Request**:
```
GET /api/statuses?token=ACCESS_TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID
```

**Response**:
```json
{
  "statuses": [
    {
      "id": "2595946000000016068",
      "name": "Open",
      "type": "open",
      "color_code": "#74cb80"
    },
    {
      "id": "2595946000000016071",
      "name": "Closed",
      "type": "closed",
      "color_code": "#f56b62"
    }
  ]
}
```

---

## Widget State Contract

The widget maintains state between interactions using this JSON structure:

```javascript
{
  // User input
  email: "customer@example.com",
  
  // Project data
  projects: [
    { id: "...", id_string: "...", name: "..." }
  ],
  selectedProject: "PROJECT_ID",
  
  // Issue data
  issues: [
    {
      id: "...",
      id_string: "...",
      name: "Issue Title",
      description: "...",
      status: { id: "...", name: "Open" },
      priority: "high",
      created_time: "..."
    }
  ],
  
  // Editing state
  editingIssue: {
    id: "...",
    name: "...",
    status: { id: "...", name: "..." }
  } || null,
  
  // Available statuses
  statuses: [
    { id: "...", name: "Open" },
    { id: "...", name: "Closed" }
  ],
  
  // UI messages
  message: {
    type: "success" || "error",
    text: "Message text"
  } || null
}
```

---

## Setup Instructions

### Step 1: Deploy Your Backend

Your Next.js app must be deployed to a public HTTPS URL:

**Options**:
- **Vercel** (recommended): `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`

**Verify deployment**:
```bash
curl https://your-app.vercel.app/api/projects?token=TEST&portalId=TEST
```

Should return a response (even if error, it means backend is accessible).

---

### Step 2: Get Zoho OAuth Credentials

1. Go to https://accounts.zoho.com/developerconsole
2. Create or select your OAuth app
3. Note your:
   - **Client ID**
   - **Client Secret**
   - **Refresh Token**
   - **Portal ID**

---

### Step 3: Create SalesIQ Widget

1. Go to **SalesIQ Portal** → **Settings** → **Developers** → **Widgets**
2. Click **Add Widget**
3. Fill in:
   - **Name**: "Zoho Projects Issue Manager"
   - **Module Scope**: Conversation
   - **Platform**: SalesIQ Scripts
4. Click **Create**

---

### Step 4: Configure the Widget Script

1. In the widget editor, replace the default script with the content from `SALESIQ_WIDGET_SCRIPT.deluge`
2. **Update these values**:

```deluge
// Line ~450 - Update backend URL
function getBackendUrl() {
  return "https://your-app.vercel.app"; // ← Your deployed URL
}

// Line ~460 - Update access token retrieval
function getAccessToken() {
  return "YOUR_ZOHO_ACCESS_TOKEN"; // ← Get from context or OAuth
}

// Line ~470 - Update portal ID
function getPortalId() {
  return "907432121"; // ← Your portal ID
}
```

3. Click **Save**

---

### Step 5: Attach Widget to Operator Panel

1. Go to **Settings** → **Portals/Brands** → Select your brand
2. Go to **Widgets** tab
3. Click **Add Widget**
4. Select "Zoho Projects Issue Manager"
5. Configure visibility (show for all conversations or specific types)
6. Click **Save**

---

## Implementation Steps

### Step 1: Understand the Flow

The widget operates in a state machine:

```
┌─────────────────┐
│  Initial State  │
│  - Empty email  │
└────────┬────────┘
         │ User enters email & clicks "Fetch Projects"
         ↓
┌─────────────────┐
│ Projects Loaded │
│ - Show dropdown │
└────────┬────────┘
         │ User selects project
         ↓
┌─────────────────┐
│ Issues Loaded   │
│ - Show list     │
│ - Show form     │
└────────┬────────┘
         │ User clicks "Create" or "Edit"
         ↓
┌─────────────────┐
│ Issue Created/  │
│ Updated         │
│ - Refresh list  │
└─────────────────┘
```

### Step 2: Key Functions

**detail(context)** - Renders UI based on state:
```deluge
function detail(context) {
  // Initialize state if empty
  if (!context.data) {
    context.data = { email: "", projects: [], ... };
  }
  
  // Build sections conditionally
  sections.add(getEmailInputSection(context.data));
  if (context.data.email != "") {
    sections.add(getProjectSelectionSection(context.data));
  }
  // ... more sections
  
  return { "sections": sections, "data": context.data };
}
```

**action(context, payload)** - Handles user actions:
```deluge
function action(context, payload) {
  if (payload.action == "fetch_projects") {
    return handleFetchProjects(context, data, payload);
  }
  else if (payload.action == "create_issue") {
    return handleCreateIssue(context, data, payload);
  }
  // ... more actions
}
```

### Step 3: Action Handlers

Each action handler:
1. Validates input
2. Calls backend via `invokeUrl`
3. Updates state
4. Returns new UI via `detail(context)`

Example:
```deluge
function handleCreateIssue(context, data, payload) {
  // Validate
  if (payload.title == "") {
    data.message = { "type": "error", "text": "Title required" };
    return detail(context);
  }
  
  // Call backend
  map response = invokeUrl([
    "url": getBackendUrl() + "/api/tasks?...",
    "type": "POST",
    "body": requestBody
  ]);
  
  // Update state
  if (response.get("status_code") == 200) {
    data.message = { "type": "success", "text": "Created!" };
    return handleSelectProject(...); // Refresh
  }
  
  return detail(context);
}
```

---

## Testing

### Test 1: Widget Loads
1. Open SalesIQ conversation
2. Click widget panel
3. Should see "Find Issues by Customer Email" form

### Test 2: Fetch Projects
1. Enter customer email
2. Click "Fetch Projects"
3. Should see project dropdown populated

### Test 3: Create Issue
1. Select project
2. Fill in "Create New Issue" form
3. Click "Create Issue"
4. Should see success message
5. Issue should appear in list

### Test 4: Edit Issue
1. Click "Edit" on an issue
2. Change status in dropdown
3. Click "Update Issue"
4. Should see success message
5. List should refresh with new status

### Test 5: Error Handling
1. Try creating issue without title
2. Should see error message
3. Try with invalid project ID
4. Should see error from backend

---

## Troubleshooting

### Issue: "Network error - cannot reach backend"

**Solution**:
1. Verify backend is deployed: `curl https://your-app.vercel.app/api/projects`
2. Check URL in `getBackendUrl()` function
3. Verify CORS: Backend should accept requests from Zoho IPs
4. Check firewall/network policies

### Issue: "Missing OAuth credentials"

**Solution**:
1. Verify `getAccessToken()` returns valid token
2. Check `getPortalId()` is correct
3. Ensure token is not expired (refresh if needed)

### Issue: "Invalid JSON response"

**Solution**:
1. Check backend logs for errors
2. Verify response format matches expected structure
3. Check if backend is returning HTML error page instead of JSON

### Issue: "Task created but not showing in list"

**Solution**:
1. Check if tasklist was auto-created
2. Verify task appears in Zoho Projects UI
3. Check backend logs for any warnings

### Issue: "Status update not working"

**Solution**:
1. Verify status ID is correct (from statuses endpoint)
2. Check if task ID is being passed correctly
3. Ensure backend is using PATCH method (not POST)

---

## Advanced: Custom Modifications

### Add More Fields to Create Form

In `getCreateIssueSection()`:
```deluge
map(
  "id", "assignee",
  "type", "select",
  "label", "Assign To",
  "options", assigneeOptions,
  "required", false
)
```

Then in `handleCreateIssue()`:
```deluge
requestBody.put("owner", payload.assignee);
```

### Add Search/Filter

Add a search field in issues list section:
```deluge
map(
  "id", "search",
  "type", "text",
  "label", "Search Issues",
  "placeholder", "Filter by title..."
)
```

Filter in `getIssuesListSection()`:
```deluge
for each issue in data.issues {
  if (issue.get("name").contains(data.searchTerm)) {
    issueCards.add(issue);
  }
}
```

### Add Pagination

Track page number in state:
```deluge
data.currentPage = 1;
data.itemsPerPage = 10;
```

Slice issues in list section:
```deluge
list startIdx = (data.currentPage - 1) * data.itemsPerPage;
list endIdx = startIdx + data.itemsPerPage;
list paginatedIssues = data.issues.subList(startIdx, endIdx);
```

---

## Support & Resources

- **SalesIQ Widgets Docs**: https://www.zoho.com/salesiq/help/developer-section/salesiq-widgets.html
- **SalesIQ Scripts Guide**: https://www.zoho.com/salesiq/help/developer-section/widget-siq-scripts-connections.html
- **Zoho Projects API**: https://projects.zoho.com/api-docs
- **invokeUrl Reference**: https://www.zoho.com/salesiq/help/developer-section/js-api.html

---

## Next Steps

1. ✅ Deploy backend to public HTTPS URL
2. ✅ Get Zoho OAuth credentials
3. ✅ Create SalesIQ widget
4. ✅ Paste and configure script
5. ✅ Attach to operator panel
6. ✅ Test all flows
7. ✅ Deploy to production

---

**Questions?** Check the troubleshooting section or review the backend API endpoints to ensure compatibility.
