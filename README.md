# Data Agent Client - Teams App

Teams App to query Fabric Data Agent using natural language.

## Requirements

- Node.js 18+
- Azure AD App Registration
- Access to Fabric Data Agent

## Setup

### 1. Create App Registration in Azure AD

1. Go to [Azure Portal](https://portal.azure.com) > Azure Active Directory > App registrations
2. New registration:
   - Name: `Data Agent Client`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `Single-page application (SPA)` > `http://localhost:3000`
3. Copy the **Application (client) ID**

### 2. Configure API Permissions

In the App Registration:
1. API permissions > Add a permission
2. APIs my organization uses > search for `Power BI Service`
3. Delegated permissions:
   - `Dataset.Read.All`
   - `Workspace.Read.All`
4. Grant admin consent

### 3. Configure the App

Edit `src/authConfig.js`:

```js
clientId: "YOUR_CLIENT_ID_HERE",
```

### 4. Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Teams

### Option A: Teams Toolkit CLI (Recommended)

1. **Install Teams Toolkit CLI**:
```bash
npm install -g @microsoft/teamsapp-cli
```

2. **Login to Azure and M365**:
```bash
teamsapp auth login azure
teamsapp auth login m365
```

3. **Provision resources**:
```bash
teamsapp provision --env dev
```

4. **Deploy**:
```bash
teamsapp deploy --env dev
```

5. **Publish to Teams**:
```bash
teamsapp publish --env dev
```

### Option B: Manual

#### 1. Hosting

Upload the build to Azure Static Web Apps, Vercel, or similar:

```bash
npm run build
```

#### 2. Update Manifest

Edit `appPackage/manifest.json`:
- `{{APP_ID}}`: A unique GUID for the app
- `{{APP_DOMAIN}}`: Your domain (e.g., `your-app.azurestaticapps.net`)
- `{{AAD_APP_ID}}`: The Azure AD Client ID

#### 3. Configure Azure AD for Teams SSO

```bash
az ad app update --id YOUR_CLIENT_ID \
  --identifier-uris "api://YOUR_CLIENT_ID"
```

#### 4. Create Icons

Create in `appPackage/`:
- `color.png`: 192x192 px
- `outline.png`: 32x32 px (transparent)

#### 5. Package

```bash
cd appPackage
zip -r ../dataagent-client.zip manifest.json color.png outline.png
```

#### 6. Upload to Teams

**As a user:**
1. Teams > Apps > Manage your apps
2. Upload an app > Upload a custom app
3. Select `dataagent-client.zip`

**As admin (for the entire organization):**
1. Go to [Teams Admin Center](https://admin.teams.microsoft.com)
2. Teams apps > Manage apps
3. Upload new app > Select `dataagent-client.zip`
4. Publish

## Structure

```
├── src/
│   ├── main.jsx        # Entry point
│   ├── App.jsx         # Main component (chat)
│   └── authConfig.js   # MSAL config + endpoint
├── appPackage/
│   └── manifest.json   # Teams manifest
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
