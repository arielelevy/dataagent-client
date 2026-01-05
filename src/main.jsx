import React from 'react'
import ReactDOM from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { msalConfig } from './authConfig'
import App from './App'

const msalInstance = new PublicClientApplication(msalConfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={webLightTheme}>
        <App />
      </FluentProvider>
    </MsalProvider>
  </React.StrictMode>
)
