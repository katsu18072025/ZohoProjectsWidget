# SalesIQ Widget - Quick Start Checklist

Get your Zoho Projects widget running in SalesIQ in 5 steps.

---

## ✅ Pre-requisites

- [ ] Next.js backend deployed to public HTTPS URL
- [ ] Zoho OAuth credentials (Client ID, Secret, Refresh Token)
- [ ] Portal ID from Zoho Projects
- [ ] SalesIQ account with admin access
- [ ] Access to SalesIQ Developer section

---

## 🚀 Step 1: Deploy Backend (5 minutes)

### Option A: Deploy to Vercel (Recommended)

```bash
# From your project directory
npm run build
vercel deploy
```

**Result**: Your app is now at `https://your-project.vercel.app`

### Option B: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-deploys on push

**Result**: Your app is at `https://your-project.railway.app`

### Verify Deployment

```bash
curl https://your-app.vercel.app/api/projects?token=test&portalId=test
```

Should return a response (error is OK, means backend is accessible).

---

## 🔐 Step 2: Get OAuth Credentials (5 minutes)

1. Go to https://accounts.zoho.com/developerconsole
2. Click **OAuth Applications** → **Create**
3. Fill in:
   - **Application Name**: "Zoho Projects Widget"
   - **Homepage URL**: Your backend URL
   - **Authorized Redirect URIs**: `https://your-app.vercel.app/api/callback`
4. Click **Create**
5. Copy:
   - **Client ID**
   - **Client Secret**
6. Click **Generate Token** to get **Refresh Token**
7. Note your **Portal ID** from Zoho Projects

**Save these values** - you'll need them in Step 4.

---

## 🎨 Step 3: Create SalesIQ Widget (5 minutes)

1. Go to **SalesIQ Portal** → **Settings** → **Developers** → **Widgets**
2. Click **Add Widget**
3. Fill in:
   - **Widget Name**: `Zoho Projects Issue Manager`
   - **Module Scope**: `Conversation`
   - **Platform**: `SalesIQ Scripts`
4. Click **Create**
5. You'll see the script editor

---

## 📝 Step 4: Paste & Configure Script (10 minutes)

1. Open `SALESIQ_WIDGET_SCRIPT.deluge` from your project
2. Copy all the code
3. In SalesIQ widget editor, select all and paste
4. **Find and replace these 3 lines**:

### Line ~450: Update Backend URL
```deluge
// BEFORE:
function getBackendUrl() {
  return "https://your-app.vercel.app";
}

// AFTER:
function getBackendUrl() {
  return "https://your-actual-app.vercel.app"; // ← Your deployed URL
}
```

### Line ~460: Update Access Token
```deluge
// BEFORE:
function getAccessToken() {
  return "YOUR_ZOHO_ACCESS_TOKEN";
}

// AFTER:
function getAccessToken() {
  return "1000.abc123def456..."; // ← Your refresh token from Step 2
}
```

### Line ~470: Update Portal ID
```deluge
// BEFORE:
function getPortalId() {
  return "907432121";
}

// AFTER:
function getPortalId() {
  return "YOUR_PORTAL_ID"; // ← Your portal ID from Step 2
}
```

5. Click **Save**

---

## 🔌 Step 5: Attach to Operator Panel (5 minutes)

1. Go to **Settings** → **Portals/Brands** → Select your brand
2. Go to **Widgets** tab
3. Click **Add Widget**
4. Select **"Zoho Projects Issue Manager"**
5. Configure:
   - **Visibility**: Show for all conversations (or custom)
   - **Position**: Right panel (recommended)
6. Click **Save**

---

## ✨ Test It! (5 minutes)

### Test in SalesIQ

1. Open a test conversation in SalesIQ
2. Click the **Widgets** icon in the right panel
3. Select **"Zoho Projects Issue Manager"**
4. You should see the email input form

### Test Fetch Projects

1. Enter a customer email
2. Click **"Fetch Projects"**
3. Should see project dropdown

### Test Create Issue

1. Select a project
2. Fill in "Create New Issue" form
3. Click **"Create Issue"**
4. Should see success message
5. Issue should appear in list

### Test Edit Issue

1. Click **"Edit"** on an issue
2. Change status
3. Click **"Update Issue"**
4. Should see success message

---

## 🐛 Troubleshooting

### Widget doesn't load
- [ ] Check SalesIQ Scripts syntax (look for red X)
- [ ] Verify backend URL is correct
- [ ] Check browser console for errors

### "Network error" when fetching projects
- [ ] Verify backend is deployed: `curl https://your-app.vercel.app/api/projects`
- [ ] Check firewall/CORS settings
- [ ] Verify token is valid

### "Missing OAuth credentials"
- [ ] Check `getAccessToken()` returns a token
- [ ] Check `getPortalId()` is correct
- [ ] Verify token is not expired

### Issues not showing in list
- [ ] Check if project has a tasklist
- [ ] Verify task appears in Zoho Projects UI
- [ ] Check backend logs

### Status update fails
- [ ] Verify status ID is from `/api/statuses` endpoint
- [ ] Check task ID is being passed correctly
- [ ] Verify backend is accessible

---

## 📚 Next Steps

### Customize the Widget

**Add more fields**:
- Edit `getCreateIssueSection()` to add fields
- Update `handleCreateIssue()` to send them

**Add search/filter**:
- Add search input in `getIssuesListSection()`
- Filter issues in the loop

**Add pagination**:
- Track page number in state
- Slice issues array in list section

### Deploy to Production

1. Update backend URL in script (if using different domain)
2. Use production OAuth credentials
3. Test thoroughly in SalesIQ
4. Enable for all operators

### Monitor & Debug

- Check SalesIQ logs for errors
- Monitor backend API logs
- Track widget usage in SalesIQ analytics

---

## 📞 Support

**Documentation**:
- [SalesIQ Widgets](https://www.zoho.com/salesiq/help/developer-section/salesiq-widgets.html)
- [SalesIQ Scripts](https://www.zoho.com/salesiq/help/developer-section/widget-siq-scripts-connections.html)
- [Zoho Projects API](https://projects.zoho.com/api-docs)

**Files in this project**:
- `SALESIQ_WIDGET_SCRIPT.deluge` - Main widget script
- `SALESIQ_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `API_MAPPING_REFERENCE.md` - API endpoint reference

---

## ⏱️ Estimated Total Time: 30 minutes

- Step 1 (Deploy): 5 min
- Step 2 (OAuth): 5 min
- Step 3 (Create Widget): 5 min
- Step 4 (Configure): 10 min
- Step 5 (Attach): 5 min
- **Total**: 30 min

---

## 🎉 You're Done!

Your Zoho Projects widget is now live in SalesIQ. Operators can:
- ✅ Fetch issues by customer email
- ✅ Create new tasks and bugs
- ✅ Update issue status
- ✅ View all project issues

**Next**: Customize the widget to match your workflow, add more fields, or integrate with other Zoho products.

---

**Questions?** Check the troubleshooting section or review the detailed implementation guide.

**Last Updated**: 2025-11-29
