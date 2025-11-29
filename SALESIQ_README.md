# Zoho Projects SalesIQ Widget
## Complete Conversion Package

Welcome! Your Zoho Projects Widget has been successfully converted from a React application to a SalesIQ Scripts widget.

---

## 📦 What's Included

This package contains everything you need to deploy your widget to SalesIQ:

### 1. **SALESIQ_WIDGET_SCRIPT.deluge** ⭐
The main widget script - copy and paste this into SalesIQ.
- Complete Deluge implementation
- All UI sections and action handlers
- Ready to use (just update 3 configuration values)

### 2. **SALESIQ_QUICK_START.md** 🚀
Fast-track setup guide - get running in 30 minutes.
- 5 simple steps
- Pre-requisites checklist
- Configuration instructions
- Testing procedures

### 3. **SALESIQ_IMPLEMENTATION_GUIDE.md** 📚
Comprehensive implementation guide - detailed walkthrough.
- Architecture overview
- All 6 API endpoints explained
- Widget state contract
- Step-by-step setup
- Testing and troubleshooting

### 4. **API_MAPPING_REFERENCE.md** 🔗
API endpoint reference - quick lookup for all endpoints.
- Quick reference table
- Detailed endpoint mapping
- Request/response examples
- Error handling guide
- Field mapping tables

### 5. **WIDGET_FLOW_DIAGRAM.md** 📊
Visual flow diagrams - understand how the widget works.
- Widget lifecycle
- Fetch projects flow
- Create issue flow
- Update issue flow
- State transitions
- API call sequence
- Error handling flow
- UI structure
- Data flow summary

### 6. **CONVERSION_SUMMARY.md** 📋
Complete overview - what changed and what to do next.
- What was done
- Architecture changes
- API endpoints used
- Widget capabilities
- Deployment path
- Security considerations
- Next steps

---

## 🎯 Quick Start (30 minutes)

### Step 1: Deploy Backend
Your Next.js app is already deployed. Verify it's accessible:
```bash
curl https://your-app.vercel.app/api/projects?token=test&portalId=test
```

### Step 2: Get OAuth Credentials
1. Go to https://accounts.zoho.com/developerconsole
2. Create OAuth app
3. Get: Client ID, Client Secret, Refresh Token, Portal ID

### Step 3: Create SalesIQ Widget
1. SalesIQ → Settings → Developers → Widgets → Add
2. Name: "Zoho Projects Issue Manager"
3. Platform: "SalesIQ Scripts"

### Step 4: Configure Script
1. Copy `SALESIQ_WIDGET_SCRIPT.deluge`
2. Paste into SalesIQ widget editor
3. Update 3 values:
   - Line ~450: Backend URL
   - Line ~460: Access token
   - Line ~470: Portal ID

### Step 5: Test
1. Open SalesIQ conversation
2. Click widget
3. Enter email and test all features

**See SALESIQ_QUICK_START.md for detailed instructions.**

---

## 📖 Documentation Guide

### For Quick Setup
→ Read **SALESIQ_QUICK_START.md** (5 min)

### For Implementation Details
→ Read **SALESIQ_IMPLEMENTATION_GUIDE.md** (30 min)

### For API Reference
→ Read **API_MAPPING_REFERENCE.md** (lookup as needed)

### For Visual Understanding
→ Read **WIDGET_FLOW_DIAGRAM.md** (10 min)

### For Overview
→ Read **CONVERSION_SUMMARY.md** (10 min)

---

## 🔄 What Changed

### Before (React/Next.js)
- Frontend: React component in browser
- Backend: Next.js API routes
- Deployment: Separate frontend + backend

### After (SalesIQ Scripts)
- Frontend: Deluge script in SalesIQ portal
- Backend: Same Next.js API routes (no changes!)
- Deployment: Widget in SalesIQ, backend on Vercel/Railway

**Key Point**: Your backend stays the same! Only the frontend changed.

---

## ✨ Widget Features

✅ **Fetch Issues by Email**
- Operators enter customer email
- Widget loads all projects
- Auto-selects first project
- Displays all issues

✅ **Create Tasks**
- Title, description, priority
- Auto-creates tasklist if needed
- Refreshes list after creation

✅ **Create Bugs**
- Title, description, severity
- Separate from tasks

✅ **Update Status**
- Click "Edit" on any issue
- Change status in dropdown
- Click "Update"

✅ **Error Handling**
- Validates required fields
- Shows error messages
- Handles network failures

✅ **Stateful Widget**
- Maintains email, projects, issues
- Remembers selected project
- Handles editing state

---

## 🔧 Configuration

Three values need to be updated in the script:

```deluge
// Line ~450
function getBackendUrl() {
  return "https://your-app.vercel.app"; // ← Update
}

// Line ~460
function getAccessToken() {
  return "1000.abc123..."; // ← Update
}

// Line ~470
function getPortalId() {
  return "907432121"; // ← Update
}
```

---

## 📊 Architecture

```
SalesIQ Portal (Deluge Script)
         ↓
    invokeUrl (HTTPS)
         ↓
Next.js Backend (/api/*)
         ↓
Zoho Projects API v3
```

---

## 🧪 Testing Checklist

- [ ] Widget loads without errors
- [ ] Email input form displays
- [ ] "Fetch Projects" button works
- [ ] Project dropdown populates
- [ ] Issues list displays
- [ ] Create task form displays
- [ ] Create bug form displays
- [ ] "Create Issue" button works
- [ ] "Edit" button works
- [ ] Status update works
- [ ] Success messages display
- [ ] Error messages display

---

## 🚀 Deployment Steps

1. **Deploy Backend** (already done)
   - Verify at: https://your-app.vercel.app

2. **Get OAuth Credentials**
   - Client ID, Secret, Refresh Token, Portal ID

3. **Create SalesIQ Widget**
   - Settings → Developers → Widgets → Add

4. **Configure Script**
   - Paste SALESIQ_WIDGET_SCRIPT.deluge
   - Update 3 configuration values

5. **Attach to Operator Panel**
   - Settings → Portals/Brands → Widgets → Add

6. **Test All Features**
   - Follow testing checklist

---

## 📚 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | Fetch projects |
| `/api/tasks` | GET | Fetch tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks?taskId=X` | POST | Update task |
| `/api/bugs` | POST | Create bug |
| `/api/statuses` | GET | Fetch statuses |

All endpoints are already implemented in your backend.

---

## 🐛 Troubleshooting

### Widget doesn't load
- Check script syntax in SalesIQ
- Verify backend URL is correct
- Check browser console for errors

### "Network error" when fetching
- Verify backend is deployed
- Check firewall/CORS settings
- Verify token is valid

### Issues not showing
- Check if project has issues
- Verify task appears in Zoho Projects
- Check backend logs

### Status update fails
- Verify status ID is correct
- Check task ID is being passed
- Verify backend is accessible

**See SALESIQ_IMPLEMENTATION_GUIDE.md for detailed troubleshooting.**

---

## 📞 Support

### Documentation Files
- `SALESIQ_QUICK_START.md` - Fast setup (30 min)
- `SALESIQ_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `API_MAPPING_REFERENCE.md` - API reference
- `WIDGET_FLOW_DIAGRAM.md` - Visual diagrams
- `CONVERSION_SUMMARY.md` - Overview

### External Resources
- [SalesIQ Widgets](https://www.zoho.com/salesiq/help/developer-section/salesiq-widgets.html)
- [SalesIQ Scripts](https://www.zoho.com/salesiq/help/developer-section/widget-siq-scripts-connections.html)
- [Zoho Projects API](https://projects.zoho.com/api-docs)

---

## 📈 Next Steps

### Immediate
1. Follow SALESIQ_QUICK_START.md
2. Deploy and test
3. Train operators

### Short-term
1. Implement proper OAuth flow
2. Add more fields to forms
3. Add search/filter functionality

### Long-term
1. Add bulk operations
2. Add custom fields
3. Add integrations

---

## ✅ Checklist

- [ ] Read SALESIQ_QUICK_START.md
- [ ] Deploy backend (verify it's accessible)
- [ ] Get OAuth credentials
- [ ] Create SalesIQ widget
- [ ] Paste and configure script
- [ ] Attach to operator panel
- [ ] Test all features
- [ ] Train operators
- [ ] Deploy to production

---

## 📝 File Structure

```
ZohoProjectsWidget/
├── SALESIQ_WIDGET_SCRIPT.deluge          ← Main widget (copy to SalesIQ)
├── SALESIQ_QUICK_START.md                ← Start here (30 min)
├── SALESIQ_IMPLEMENTATION_GUIDE.md       ← Detailed guide
├── API_MAPPING_REFERENCE.md              ← API reference
├── WIDGET_FLOW_DIAGRAM.md                ← Visual diagrams
├── CONVERSION_SUMMARY.md                 ← Overview
├── SALESIQ_README.md                     ← This file
├── pages/
│   ├── index.js                          ← Original React component
│   └── api/
│       ├── projects.js
│       ├── tasks.js
│       ├── bugs.js
│       ├── statuses.js
│       ├── tasklists.js
│       └── refresh-token.js
└── ... (other Next.js files)
```

---

## 🎓 Learning Path

1. **Start Here** (5 min)
   - Read this file (SALESIQ_README.md)

2. **Quick Setup** (30 min)
   - Follow SALESIQ_QUICK_START.md

3. **Deep Dive** (1-2 hours)
   - Read SALESIQ_IMPLEMENTATION_GUIDE.md
   - Review WIDGET_FLOW_DIAGRAM.md

4. **Reference** (as needed)
   - Use API_MAPPING_REFERENCE.md for endpoint details

5. **Troubleshoot** (as needed)
   - Check SALESIQ_IMPLEMENTATION_GUIDE.md troubleshooting section

---

## 🎉 You're Ready!

Everything you need is in this package. Follow the SALESIQ_QUICK_START.md guide and you'll have your widget running in 30 minutes.

**Questions?** Check the documentation files - they have detailed answers.

---

**Conversion Date**: 2025-11-29
**Status**: ✅ Complete and Ready for Deployment
**Estimated Setup Time**: 30 minutes
**Support**: See documentation files

---

**Start with SALESIQ_QUICK_START.md →**
