# SalesIQ Widget - Flow Diagrams

Visual representations of how the widget works.

---

## 1. Widget Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Widget Loads                              │
│              detail(context) called                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         Initialize State (if not exists)                     │
│  - email: ""                                                 │
│  - projects: []                                              │
│  - selectedProject: ""                                       │
│  - issues: []                                                │
│  - editingIssue: null                                        │
│  - statuses: []                                              │
│  - message: null                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         Render UI Sections (Conditionally)                   │
│  1. Email Input Section (always)                             │
│  2. Project Selection (if email entered)                     │
│  3. Create Issue Form (if project selected)                  │
│  4. Issues List (if issues exist)                            │
│  5. Edit Form (if editing)                                   │
│  6. Messages (if message exists)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         Return UI + State                                    │
│  {                                                           │
│    "sections": [ ... ],                                      │
│    "data": { email, projects, issues, ... }                  │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   User Interacts           │
        │   (Clicks button/submits)   │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   action(context, payload) │
        │   called with action type  │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   Route to Handler         │
        │   (fetch/create/update)    │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   Call Backend API         │
        │   via invokeUrl            │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   Update State             │
        │   (data object)            │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   Return detail(context)   │
        │   (re-render UI)           │
        └────────────┬───────────────┘
                     │
                     └──────────────────┐
                                        │
                                        ↓ (Loop back to UI Render)
```

---

## 2. Fetch Projects Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User enters email and clicks "Fetch Projects"               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  action(context, payload) called with:                       │
│  {                                                            │
│    action: "fetch_projects",                                 │
│    email: "customer@example.com"                             │
│  }                                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  handleFetchProjects(context, data, payload)                 │
│  1. Validate email is not empty                              │
│  2. Call backend:                                            │
│     GET /api/projects?token=TOKEN&portalId=PORTAL_ID         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────────────┐
        │  Backend Response                  │
        │  {                                 │
        │    "projects": [                   │
        │      { id, id_string, name, ... }  │
        │    ]                               │
        │  }                                 │
        └────────────┬───────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Update State:                                               │
│  - data.email = "customer@example.com"                       │
│  - data.projects = [ ... ]                                   │
│  - data.selectedProject = first project ID                   │
│  - data.message = { type: "success", text: "..." }           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Auto-call handleSelectProject() to load issues              │
│  (Fetch tasks and statuses for selected project)             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Return detail(context) - Re-render UI                       │
│  Now shows:                                                  │
│  - Email input (filled)                                      │
│  - Project dropdown (populated)                              │
│  - Create Issue form                                         │
│  - Issues list                                               │
│  - Success message                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Create Issue Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User fills Create Issue form and clicks "Create Issue"      │
│  {                                                            │
│    title: "Bug in login",                                    │
│    description: "Users can't login",                         │
│    issueType: "task",                                        │
│    priority: "high"                                          │
│  }                                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  action(context, payload) called with:                       │
│  {                                                            │
│    action: "create_issue",                                   │
│    title: "Bug in login",                                    │
│    description: "Users can't login",                         │
│    issueType: "task",                                        │
│    priority: "high"                                          │
│  }                                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  handleCreateIssue(context, data, payload)                   │
│  1. Validate title is not empty                              │
│  2. Check if issueType is "task" or "bug"                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ↓                       ↓
    ┌─────────────┐      ┌──────────────┐
    │ Task Path   │      │ Bug Path     │
    └──────┬──────┘      └────────┬─────┘
           │                      │
           ↓                      ↓
    POST /api/tasks       POST /api/bugs
    {                      {
      name: "...",           title: "...",
      description: "...",    description: "...",
      priority: "...",       severity: "..."
      tasklist: { id }     }
    }
           │                      │
           └───────────┬──────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Backend Response            │
        │  {                           │
        │    "success": true,          │
        │    "message": "Created!"     │
        │  }                           │
        └──────────┬───────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  Update State:                                               │
│  - data.message = { type: "success", text: "Created!" }      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Auto-call handleSelectProject() to refresh issues list      │
│  (Re-fetch tasks for current project)                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Return detail(context) - Re-render UI                       │
│  Now shows:                                                  │
│  - Success message                                           │
│  - Updated issues list (with new issue)                      │
│  - Form cleared                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Update Issue Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User clicks "Edit" button on an issue                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  action(context, payload) called with:                       │
│  {                                                            │
│    action: "edit_issue",                                     │
│    issue_id: "2595946000000066822"                           │
│  }                                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  handleEditIssue(context, data, payload)                     │
│  1. Find issue in data.issues by ID                          │
│  2. Set data.editingIssue = foundIssue                       │
│  3. Return detail(context)                                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  detail(context) renders Edit form:                          │
│  - Status dropdown (pre-filled with current status)          │
│  - "Update Issue" button                                     │
│  - "Cancel" button                                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  User selects new status and clicks "Update Issue"           │
│  {                                                            │
│    action: "update_issue",                                   │
│    status: "2595946000000016071"  (Closed)                   │
│  }                                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  handleUpdateIssue(context, data, payload)                   │
│  1. Get issue ID from data.editingIssue                      │
│  2. Call backend:                                            │
│     POST /api/tasks?taskId=ISSUE_ID&...                      │
│     Body: { status: "2595946000000016071" }                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────────┐
        │  Backend Response              │
        │  {                             │
        │    "success": true,            │
        │    "message": "Updated!"       │
        │  }                             │
        └────────────┬───────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Update State:                                               │
│  - data.editingIssue = null (clear editing)                  │
│  - data.message = { type: "success", text: "Updated!" }      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Auto-call handleSelectProject() to refresh issues list      │
│  (Re-fetch tasks to show updated status)                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│  Return detail(context) - Re-render UI                       │
│  Now shows:                                                  │
│  - Success message                                           │
│  - Updated issues list (with new status)                     │
│  - Edit form hidden                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. State Transitions

```
                    ┌─────────────────┐
                    │  INITIAL STATE  │
                    │  email: ""      │
                    │  projects: []   │
                    │  issues: []     │
                    └────────┬────────┘
                             │
                 ┌───────────┘
                 │ User enters email
                 │ Clicks "Fetch Projects"
                 ↓
            ┌─────────────────────┐
            │ PROJECTS_LOADED     │
            │ email: "..."        │
            │ projects: [...]     │
            │ selectedProject: "" │
            └────────┬────────────┘
                     │
         ┌───────────┘
         │ User selects project
         │ Clicks "Load Issues"
         ↓
    ┌─────────────────────┐
    │ ISSUES_LOADED       │
    │ projects: [...]     │
    │ selectedProject: "" │
    │ issues: [...]       │
    │ statuses: [...]     │
    └────────┬────────────┘
             │
    ┌────────┴────────┐
    │                 │
    │ Create Issue    │ Edit Issue
    ↓                 ↓
┌──────────────┐  ┌──────────────────┐
│ ISSUE_CREATED│  │ ISSUE_EDITING    │
│ issues: [...] │  │ editingIssue: {} │
│ message: OK  │  │ message: null    │
└──────────────┘  └────────┬─────────┘
    │                      │
    │                      │ Update Issue
    │                      ↓
    │              ┌──────────────────┐
    │              │ ISSUE_UPDATED    │
    │              │ editingIssue: null
    │              │ message: OK      │
    │              └────────┬─────────┘
    │                       │
    └───────────┬───────────┘
                │
                ↓
        ┌──────────────────┐
        │ ISSUES_LOADED    │
        │ (refreshed list) │
        └──────────────────┘
```

---

## 6. API Call Sequence

```
SalesIQ Widget                Backend API              Zoho Projects API
      │                            │                         │
      │─ GET /api/projects ───────→│                         │
      │                            │─ GET /api/v3/.../projects ──→│
      │                            │                         │
      │                            │←─ [projects] ──────────│
      │←─ [projects] ─────────────│                         │
      │                            │                         │
      │─ GET /api/statuses ───────→│                         │
      │                            │─ GET /api/v3/.../statuses ──→│
      │                            │                         │
      │                            │←─ [statuses] ──────────│
      │←─ [statuses] ─────────────│                         │
      │                            │                         │
      │─ GET /api/tasks ──────────→│                         │
      │                            │─ GET /api/v3/.../tasks ────→│
      │                            │                         │
      │                            │←─ [tasks] ─────────────│
      │←─ [tasks] ────────────────│                         │
      │                            │                         │
      │─ POST /api/tasks ─────────→│                         │
      │                            │─ POST /api/v3/.../tasks ───→│
      │                            │                         │
      │                            │←─ {success} ───────────│
      │←─ {success} ──────────────│                         │
      │                            │                         │
      │─ POST /api/tasks?taskId ──→│                         │
      │                            │─ PATCH /api/v3/.../tasks/id→│
      │                            │                         │
      │                            │←─ {success} ───────────│
      │←─ {success} ──────────────│                         │
      │                            │                         │
```

---

## 7. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User Action (e.g., Create Issue)                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │  Validate Input            │
        │  (title, description, etc) │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    Invalid              Valid
         │                       │
         ↓                       ↓
    ┌─────────────┐      ┌──────────────────┐
    │ Set Error   │      │ Call Backend API │
    │ Message     │      │ via invokeUrl    │
    └──────┬──────┘      └────────┬─────────┘
           │                      │
           │                      ↓
           │             ┌────────────────────┐
           │             │ Check Response     │
           │             │ Status Code        │
           │             └────────┬───────────┘
           │                      │
           │          ┌───────────┴───────────┐
           │          │                       │
           │      Success              Error
           │      (200/204)            (400/500)
           │          │                       │
           │          ↓                       ↓
           │      ┌─────────────┐      ┌──────────────┐
           │      │ Set Success │      │ Set Error    │
           │      │ Message     │      │ Message      │
           │      └──────┬──────┘      └────────┬─────┘
           │             │                      │
           │             ↓                      │
           │      ┌──────────────────┐          │
           │      │ Refresh Data     │          │
           │      │ (if needed)      │          │
           │      └────────┬─────────┘          │
           │               │                    │
           └───────────┬───┴────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │ Return detail(context)       │
        │ (Re-render with message)     │
        └──────────────────────────────┘
```

---

## 8. Widget UI Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    SalesIQ Widget Panel                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 1: Email Input                               │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Customer Email: [________________]             │   │   │
│  │ │ [Fetch Projects]                               │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 2: Project Selection (if email entered)      │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Project: [▼ Project Name]                      │   │   │
│  │ │ [Load Issues]                                  │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 3: Create Issue Form (if project selected)   │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Issue Type: [▼ Task]                           │   │   │
│  │ │ Title: [_____________________]                 │   │   │
│  │ │ Description: [_____________________]           │   │   │
│  │ │ Priority: [▼ Medium]                           │   │   │
│  │ │ [Create Issue]                                 │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 4: Issues List (if issues exist)             │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Issue 1: Bug in Login                          │   │   │
│  │ │ Status: Open                                   │   │   │
│  │ │ [Edit]                                         │   │   │
│  │ ├────────────────────────────────────────────────┤   │   │
│  │ │ Issue 2: Add Dark Mode                         │   │   │
│  │ │ Status: In Progress                            │   │   │
│  │ │ [Edit]                                         │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 5: Edit Form (if editing)                    │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ Edit Issue: Bug in Login                       │   │   │
│  │ │ Status: [▼ In Progress]                        │   │   │
│  │ │ [Update Issue] [Cancel]                        │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Section 6: Messages (if message exists)              │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │ ✓ Issue updated successfully!                  │   │   │
│  │ └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Data Flow Summary

```
User Input
    ↓
action(context, payload)
    ↓
Route to Handler
    ↓
Validate Input
    ↓
Call Backend API (invokeUrl)
    ↓
Parse Response
    ↓
Update State (data object)
    ↓
Return detail(context)
    ↓
Render UI Sections
    ↓
Display to User
    ↓
(Loop back to User Input)
```

---

**These diagrams show the complete flow of how the SalesIQ widget works, from user interaction to API calls to state updates.**
