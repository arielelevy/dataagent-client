import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { FluentProvider, webLightTheme, webDarkTheme, teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme } from '@fluentui/react-components'
import { app } from '@microsoft/teams-js'
import { msalConfig } from './authConfig'
import App from './App'

const msalInstance = new PublicClientApplication(msalConfig)

// Mapeo de temas de Teams a Fluent UI
const teamsThemes = {
  default: teamsLightTheme,
  dark: teamsDarkTheme,
  contrast: teamsHighContrastTheme,
}

function Root() {
  const [theme, setTheme] = useState(teamsLightTheme)
  const [isInTeams, setIsInTeams] = useState(false)

  useEffect(() => {
    // Intentar inicializar Teams SDK
    app.initialize().then(() => {
      setIsInTeams(true)

      // Obtener contexto y tema inicial
      app.getContext().then(context => {
        const teamsTheme = context.app?.theme || 'default'
        setTheme(teamsThemes[teamsTheme] || teamsLightTheme)
      })

      // Escuchar cambios de tema
      app.registerOnThemeChangeHandler((newTheme) => {
        setTheme(teamsThemes[newTheme] || teamsLightTheme)
      })

      // Notificar que la app está lista
      app.notifySuccess()
    }).catch(() => {
      // No estamos en Teams, usar tema web por defecto
      setIsInTeams(false)
      setTheme(webLightTheme)
    })
  }, [])

  return (
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <FluentProvider theme={theme}>
          <App isInTeams={isInTeams} />
        </FluentProvider>
      </MsalProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
