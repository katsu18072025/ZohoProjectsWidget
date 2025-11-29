# API Mapping Reference
## Next.js Backend → SalesIQ Widget

This document maps your existing Next.js API endpoints to their usage in the SalesIQ widget script.

---

## Quick Reference Table

| Operation | HTTP Method | Endpoint | SalesIQ Function | Status |
|-----------|-------------|----------|------------------|--------|
| Fetch Projects | GET | `/api/projects` | `handleFetchProjects()` | ✅ Ready |
| Fetch Tasks | GET | `/api/tasks` | `handleSelectProject()` | ✅ Ready |
| Create Task | POST | `/api/tasks` | `handleCreateIssue()` | ✅ Ready |
| Update Task | POST | `/api/tasks?taskId=X` | `handleUpdateIssue()` | ✅ Ready |
| Create Bug | POST | `/api/bugs` | `handleCreateIssue()` | ✅ Ready |
| Fetch Statuses | GET | `/api/statuses` | `handleSelectProject()` | ✅ Ready |
| Fetch Tasklists | GET | `/api/tasklists` | (Optional) | ⏳ Not Used |
| Create Tasklist | POST | `/api/tasklists` | (Auto-created in backend) | ✅ Auto |
| Refresh Token | POST | `/api/refresh-token` | (Handled by backend) | ✅ Backend |

---

## Detailed Endpoint Mapping

### 1. GET /api/projects

**When Called**: User clicks "Fetch Projects" button

**SalesIQ Code**:
```deluge
map response = invokeUrl([
  "url": getBackendUrl() + "/api/projects?token=" + getAccessToken() + "&portalId=" + getPortalId(),
  "type": "GET",
  "headers": map("Content-Type", "application/json")
]);
```

**Expected Response**:
```json
{
  "projects": [
    {
      "id": "2595946000000075005",
      "id_string": "2595946000000075005",
      "name": "My Project",
      "description": "Project description"
    }
  ]
}
```

**State Update**:
```deluge
data.projects = response.get("response").get("projects");
data.selectedProject = data.projects.get(0).get("id_string");
```

---

### 2. GET /api/tasks

**When Called**: User selects a project

**SalesIQ Code**:
```deluge
map response = invokeUrl([
  "url": getBackendUrl() + "/api/tasks?token=" + getAccessToken() + "&portalId=" + getPortalId() + "&projectId=" + data.selectedProject,
  "type": "GET",
  "headers": map("Content-Type", "application/json")
]);
```

**Expected Response**:
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
      "created_time": "2025-11-29T12:00:00Z",
      "tasklist": {
        "id": "2595946000000075135",
        "id_string": "2595946000000075135",
        "name": "Default Tasklist"
      }
    }
  ]
}
```

**State Update**:
```deluge
data.issues = response.get("response").get("tasks");
data.selectedTasklist = data.issues.get(0).get("tasklist").get("id_string");
```

---

### 3. POST /api/tasks (Create)

**When Called**: User clicks "Create Issue" button with type="task"

**SalesIQ Code**:
```deluge
map requestBody = map();
requestBody.put("name", payload.title);
requestBody.put("description", payload.description);
requestBody.put("priority", payload.priority);
requestBody.put("tasklist", map("id", data.selectedTasklist));

map response = invokeUrl([
  "url": getBackendUrl() + "/api/tasks?token=" + getAccessToken() + "&portalId=" + getPortalId() + "&projectId=" + data.selectedProject,
  "type": "POST",
  "headers": map("Content-Type", "application/json"),
  "body": requestBody
]);
```

**Request Body**:
```json
{
  "name": "New Task Title",
  "description": "Task description",
  "priority": "high",
  "tasklist": {
    "id": "2595946000000075135"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Task created successfully"
}
```

**Note**: If no tasklist exists, the backend automatically creates one.

---

### 4. POST /api/tasks (Update)

**When Called**: User clicks "Update Issue" button

**SalesIQ Code**:
```deluge
map updateBody = map();
updateBody.put("status", payload.status);

map issueId = data.editingIssue.get("id_string");

map response = invokeUrl([
  "url": getBackendUrl() + "/api/tasks?token=" + getAccessToken() + "&portalId=" + getPortalId() + "&projectId=" + data.selectedProject + "&taskId=" + issueId,
  "type": "POST",
  "headers": map("Content-Type", "application/json"),
  "body": updateBody
]);
```

**Request Body**:
```json
{
  "status": "2595946000000016071"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

**Important**: 
- Status ID must match one from `/api/statuses` endpoint
- Backend converts POST to PATCH for Zoho API
- Handle both 200 and 204 status codes as success

---

### 5. POST /api/bugs (Create)

**When Called**: User clicks "Create Issue" button with type="bug"

**SalesIQ Code**:
```deluge
map requestBody = map();
requestBody.put("title", payload.title);
requestBody.put("description", payload.description);
requestBody.put("severity", payload.severity);

map response = invokeUrl([
  "url": getBackendUrl() + "/api/bugs?token=" + getAccessToken() + "&portalId=" + getPortalId() + "&projectId=" + data.selectedProject,
  "type": "POST",
  "headers": map("Content-Type", "application/json"),
  "body": requestBody
]);
```

**Request Body**:
```json
{
  "title": "Bug Title",
  "description": "Bug description",
  "severity": "High"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Bug created successfully"
}
```

**Note**: Backend maps `title` → `name` for Zoho API

---

### 6. GET /api/statuses

**When Called**: User selects a project (to populate status dropdown)

**SalesIQ Code**:
```deluge
map response = invokeUrl([
  "url": getBackendUrl() + "/api/statuses?token=" + getAccessToken() + "&portalId=" + getPortalId() + "&projectId=" + data.selectedProject,
  "type": "GET",
  "headers": map("Content-Type", "application/json")
]);
```

**Expected Response**:
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
      "id": "2595946000000031001",
      "name": "In Progress",
      "type": "open",
      "color_code": "#08aeea"
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

**State Update**:
```deluge
data.statuses = response.get("response").get("statuses");
```

---

## Query Parameters Reference

### Common Parameters

All endpoints require these query parameters:

| Parameter | Example | Source |
|-----------|---------|--------|
| `token` | `1000.abc123...` | `getAccessToken()` |
| `portalId` | `907432121` | `getPortalId()` |
| `projectId` | `2595946000000075005` | `data.selectedProject` |
| `taskId` | `2595946000000066822` | `data.editingIssue.get("id_string")` |

### URL Construction Examples

**Fetch projects**:
```
GET /api/projects?token=TOKEN&portalId=PORTAL_ID
```

**Fetch tasks**:
```
GET /api/tasks?token=TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID
```

**Create task**:
```
POST /api/tasks?token=TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID
```

**Update task**:
```
POST /api/tasks?token=TOKEN&portalId=PORTAL_ID&projectId=PROJECT_ID&taskId=TASK_ID
```

---

## Error Handling

### Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 204 | No Content (success) | Treat as success, no data |
| 400 | Bad Request | Show error message from response |
| 401 | Unauthorized | Token expired, refresh needed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Show error message from response |

### Error Response Format

```json
{
  "error": "Error title",
  "message": "Detailed error message",
  "details": { ... }
}
```

### SalesIQ Error Handling

```deluge
if (response.get("status_code") == 200 || response.get("status_code") == 204) {
  // Success
  data.message = { "type": "success", "text": "Operation successful" };
} else {
  // Error
  map errorResponse = response.get("response");
  data.message = { 
    "type": "error", 
    "text": errorResponse.get("error") + ": " + errorResponse.get("message")
  };
}
```

---

## Field Mapping

### Task Fields

| Frontend Field | API Field | Type | Required | Example |
|---|---|---|---|---|
| Title | `name` | string | Yes | "Fix login bug" |
| Description | `description` | string | No | "Users can't login with SSO" |
| Priority | `priority` | enum | No | "high", "medium", "low" |
| Status | `status.id` | string | No | "2595946000000016068" |
| Tasklist | `tasklist.id` | string | No | "2595946000000075135" |

### Bug Fields

| Frontend Field | API Field | Type | Required | Example |
|---|---|---|---|---|
| Title | `title` → `name` | string | Yes | "Login page crashes" |
| Description | `description` | string | No | "Crashes on Firefox" |
| Severity | `severity` | enum | No | "High", "Medium", "Low" |

---

## Testing Checklist

- [ ] Backend deployed and accessible
- [ ] All endpoints return correct response format
- [ ] Token refresh works
- [ ] Projects endpoint returns list
- [ ] Tasks endpoint returns list with status objects
- [ ] Statuses endpoint returns list with IDs
- [ ] Create task endpoint accepts payload
- [ ] Update task endpoint handles PATCH correctly
- [ ] Create bug endpoint accepts title/description
- [ ] Error responses include helpful messages

---

## Common Issues & Solutions

### Issue: "Invalid JSON response"
**Cause**: Backend returning HTML error page
**Solution**: Check backend logs, verify endpoint exists

### Issue: "Missing required parameters"
**Cause**: Query parameters not included
**Solution**: Verify `getAccessToken()`, `getPortalId()` return values

### Issue: "Task created but not visible"
**Cause**: Tasklist not created
**Solution**: Backend auto-creates tasklist, check logs

### Issue: "Status update fails"
**Cause**: Invalid status ID
**Solution**: Use ID from `/api/statuses` endpoint

---

## Performance Notes

- **Fetch projects**: ~500ms (cached in state)
- **Fetch tasks**: ~1-2s (depends on project size)
- **Create task**: ~1-2s (includes validation)
- **Update task**: ~500ms (simple PATCH)
- **Fetch statuses**: ~500ms (cached in state)

**Optimization**: Cache projects and statuses in widget state to avoid refetching.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-29 | Initial SalesIQ widget script |
| | | - 6 endpoints mapped |
| | | - Full CRUD operations |
| | | - Error handling |

---

**Last Updated**: 2025-11-29
**Backend Version**: Next.js with Zoho Projects API v3
**SalesIQ Scripts Version**: Latest
