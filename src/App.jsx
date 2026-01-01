import { useState, useRef, useEffect } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import {
  Button,
  Spinner,
  Card,
  Text,
  Tab,
  TabList,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { Send24Regular } from '@fluentui/react-icons'
import { fabricScopes, dataAgentConfig } from './authConfig'

// CSS para las animaciones
const globalStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes slideProgress {
  0% { left: -100px; }
  100% { left: 100%; }
}
`

// Inyectar estilos globales
if (typeof document !== 'undefined') {
  const styleEl = document.getElementById('custom-animations') || document.createElement('style')
  styleEl.id = 'custom-animations'
  styleEl.textContent = globalStyles
  if (!document.getElementById('custom-animations')) {
    document.head.appendChild(styleEl)
  }
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tabsHeader: {
    padding: '8px 24px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: 'white',
  },
  tabsContent: {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#fafafa',
  },
  chatContent: {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageUser: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    marginRight: '0',
    backgroundColor: '#e6f4ea',
    color: '#1a1a1a',
    padding: '12px 20px',
    borderRadius: '8px',
    maxWidth: '80%',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageBot: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    padding: '0',
    maxWidth: '100%',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    fontSize: '14px',
    color: '#242424',
  },
  // Steps panel - like Fabric Data Agent
  stepsPanel: {
    marginTop: '16px',
    border: `1px solid #e0e0e0`,
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  stepsPanelHeader: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  stepsPanelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  responseTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  stepItem: {
    padding: '12px 16px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  stepCheckmark: {
    color: '#0f7b0f',
    fontSize: '18px',
    marginTop: '2px',
  },
  stepDescription: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.4',
  },
  queryCodeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  codeBlock: {
    margin: '0 16px 16px 16px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
  },
  codeContent: {
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    color: tokens.colorNeutralForeground1,
  },
  copyButton: {
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground4,
    },
  },
  queryOutputSection: {
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  queryOutputTable: {
    margin: '0 16px 16px 16px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
    fontWeight: 600,
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tableCell: {
    padding: '10px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tableRow: {
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  streamingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  analyzingText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    marginBottom: '8px',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '8px',
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '12px',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    width: '100px',
    background: 'linear-gradient(90deg, #5ec75e 0%, #0f7b0f 50%, #5ec75e 100%)',
    borderRadius: '2px',
    animation: 'slideProgress 1.5s ease-in-out infinite',
  },
  stopButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 16px',
    marginTop: '16px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    ':hover': {
      color: tokens.colorNeutralForeground1,
    },
  },
  spinnerCircle: {
    width: '20px',
    height: '20px',
    border: '2px solid #e0e0e0',
    borderTop: '2px solid #0f7b0f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  inputArea: {
    position: 'relative',
    display: 'flex',
    gap: '12px',
    padding: '32px 32px 16px 32px',
    alignItems: 'flex-end',
    backgroundColor: '#fafafa',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minHeight: '100px',
  },
  sampleQuestions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '0',
  },
  loginCard: {
    margin: 'auto',
    padding: '32px',
    textAlign: 'center',
  },
})


function App({ isInTeams = false }) {
  const styles = useStyles()
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  // Multi-agent state
  const [availableAgents, setAvailableAgents] = useState([])
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [conversations, setConversations] = useState({}) // { agentId: { messages: [], agentInfo: null } }

  // Current conversation (derived from selected agent)
  const currentConversation = conversations[selectedAgentId] || { messages: [], agentInfo: null }
  const messages = currentConversation.messages
  const agentInfo = currentConversation.agentInfo

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSteps, setCurrentSteps] = useState([])
  const [expandedSteps, setExpandedSteps] = useState({}) // { msgIndex: boolean }
  const [expandedStepItems, setExpandedStepItems] = useState({}) // { "msgIndex-stepIndex": boolean }
  const [responseTime, setResponseTime] = useState(null)
  const [streamingIndex, setStreamingIndex] = useState(null) // índice del mensaje que está streaming
  const chatEndRef = useRef(null)
  const isSubmittingRef = useRef(false) // Prevenir doble envío

  // Helper to update messages for current agent
  const setMessages = (updater) => {
    setConversations(prev => ({
      ...prev,
      [selectedAgentId]: {
        ...prev[selectedAgentId],
        messages: typeof updater === 'function' ? updater(prev[selectedAgentId]?.messages || []) : updater
      }
    }))
  }

  // Helper to set agent info for current agent
  const setAgentInfo = (info) => {
    setConversations(prev => ({
      ...prev,
      [selectedAgentId]: {
        ...prev[selectedAgentId],
        agentInfo: info,
        messages: prev[selectedAgentId]?.messages || []
      }
    }))
  }

  // Toggle expand/collapse para el panel de steps de un mensaje
  const toggleStepsExpanded = (msgIndex) => {
    setExpandedSteps(prev => ({
      ...prev,
      [msgIndex]: prev[msgIndex] === undefined ? false : !prev[msgIndex]
    }))
  }

  // Toggle expand/collapse para un step individual (Query code, Query output)
  const toggleStepItemExpanded = (msgIndex, stepIndex) => {
    const key = `${msgIndex}-${stepIndex}`
    setExpandedStepItems(prev => ({
      ...prev,
      [key]: !prev[key] // undefined becomes true (expanded)
    }))
  }

  // Por defecto el panel de steps está expandido (true) cuando hay steps
  const isStepsExpanded = (msgIndex) => expandedSteps[msgIndex] !== false
  // Por defecto cada step item está COLAPSADO (false)
  const isStepItemExpanded = (msgIndex, stepIndex) => expandedStepItems[`${msgIndex}-${stepIndex}`] === true

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cargar lista de Data Agents disponibles al autenticarse
  useEffect(() => {
    const loadAvailableAgents = async () => {
      if (!isAuthenticated || availableAgents.length > 0) return

      try {
        const token = await getToken()

        // Buscar Data Agents en todos los workspaces accesibles
        const workspacesUrl = 'https://api.fabric.microsoft.com/v1/workspaces?api-version=2024-05-01-preview'
        const wsResponse = await fetch(workspacesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!wsResponse.ok) {
          // Fallback: usar solo el agent configurado
          const fallbackAgent = {
            id: dataAgentConfig.dataAgentId,
            workspaceId: dataAgentConfig.workspaceId,
            displayName: 'Data Agent',
          }
          setAvailableAgents([fallbackAgent])
          setSelectedAgentId(fallbackAgent.id)
          return
        }

        const workspaces = await wsResponse.json()
        const agents = []

        // Buscar data agents en cada workspace
        for (const ws of workspaces.value || []) {
          try {
            const agentsUrl = `https://api.fabric.microsoft.com/v1/workspaces/${ws.id}/dataAgents?api-version=2024-05-01-preview`
            const agentsResponse = await fetch(agentsUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (agentsResponse.ok) {
              const agentsData = await agentsResponse.json()
              for (const agent of agentsData.value || []) {
                agents.push({
                  ...agent,
                  workspaceId: ws.id,
                  workspaceName: ws.displayName,
                })
              }
            }
          } catch (e) {
            // Ignorar workspaces sin acceso
          }
        }

        if (agents.length > 0) {
          setAvailableAgents(agents)
          setSelectedAgentId(agents[0].id)
        } else {
          // Fallback si no se encontraron agents
          const fallbackAgent = {
            id: dataAgentConfig.dataAgentId,
            workspaceId: dataAgentConfig.workspaceId,
            displayName: 'Data Agent',
          }
          setAvailableAgents([fallbackAgent])
          setSelectedAgentId(fallbackAgent.id)
        }
      } catch (e) {
        console.error('Error loading agents:', e)
        // Fallback
        const fallbackAgent = {
          id: dataAgentConfig.dataAgentId,
          workspaceId: dataAgentConfig.workspaceId,
          displayName: 'Data Agent',
        }
        setAvailableAgents([fallbackAgent])
        setSelectedAgentId(fallbackAgent.id)
      }
    }
    loadAvailableAgents()
  }, [isAuthenticated])

  // Cargar info del Data Agent seleccionado
  useEffect(() => {
    const loadAgentInfo = async () => {
      if (!isAuthenticated || !selectedAgentId || agentInfo) return

      const agent = availableAgents.find(a => a.id === selectedAgentId)
      if (!agent) return

      try {
        const token = await getToken()
        const url = `https://api.fabric.microsoft.com/v1/workspaces/${agent.workspaceId}/dataAgents/${agent.id}?api-version=2024-05-01-preview`
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setAgentInfo(data)
        }
      } catch (e) {
        console.error('Error loading agent info:', e)
      }
    }
    loadAgentInfo()
  }, [isAuthenticated, selectedAgentId, availableAgents])

  const login = async () => {
    try {
      await instance.loginPopup(fabricScopes)
    } catch (e) {
      console.error('Login error:', e)
    }
  }

  const getToken = async () => {
    const account = accounts[0]
    if (!account) throw new Error('No account')

    try {
      const response = await instance.acquireTokenSilent({
        ...fabricScopes,
        account,
      })
      return response.accessToken
    } catch (e) {
      const response = await instance.acquireTokenPopup(fabricScopes)
      return response.accessToken
    }
  }

  // Get current agent endpoint
  const getCurrentAgentEndpoint = () => {
    const agent = availableAgents.find(a => a.id === selectedAgentId)
    if (agent) {
      return `https://api.fabric.microsoft.com/v1/workspaces/${agent.workspaceId}/dataagents/${agent.id}/aiassistant/openai`
    }
    return dataAgentConfig.endpoint
  }

  // Helper para llamadas API
  const apiCall = async (token, path, method = 'GET', body = null) => {
    const separator = path.includes('?') ? '&' : '?'
    const baseUrl = getCurrentAgentEndpoint()
    const url = `${baseUrl}${path}${separator}api-version=2024-05-01-preview`
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(url, options)
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`${response.status}: ${text}`)
    }
    if (method === 'DELETE') return {}
    return response.json()
  }

  const sendMessage = async () => {
    // Prevenir doble envío con ref (más rápido que estado)
    if (!input.trim() || loading || isSubmittingRef.current) return
    isSubmittingRef.current = true

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setCurrentSteps([])
    setResponseTime(null)
    const startTime = Date.now()

    // Agregar mensaje vacío del assistant que iremos llenando
    const botMsgIndex = messages.length + 1
    setStreamingIndex(botMsgIndex)
    setMessages((prev) => [...prev, { role: 'assistant', content: '', steps: [], responseTime: null, isStreaming: true }])

    try {
      const token = await getToken()

      // 1. Crear assistant
      const assistant = await apiCall(token, '/assistants', 'POST', { model: 'not used' })
      console.log('Assistant:', assistant)

      // 2. Crear thread
      const thread = await apiCall(token, '/threads', 'POST', {})
      console.log('Thread:', thread)

      // 3. Crear mensaje
      await apiCall(token, `/threads/${thread.id}/messages`, 'POST', {
        role: 'user',
        content: userMessage,
      })

      // 4. Crear run con streaming
      const url = `${dataAgentConfig.endpoint}/threads/${thread.id}/runs?api-version=2024-05-01-preview`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistant_id: assistant.id,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`)
      }

      // Leer stream SSE
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let steps = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)

              // Evento de delta de texto (respuesta final)
              if (event.object === 'thread.message.delta') {
                const delta = event.delta?.content?.[0]?.text?.value || ''
                fullContent += delta
                const elapsed = Math.round((Date.now() - startTime) / 1000)
                setResponseTime(elapsed)
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[botMsgIndex] = { role: 'assistant', content: fullContent, steps: [...steps], responseTime: elapsed }
                  return updated
                })
              }

              // Capturar tool calls de análisis de base de datos (in_progress y completed)
              if ((event.object === 'thread.run.step' || event.object === 'thread.run.step.delta' || event.object === 'thread.run.step.completed') && event.step_details?.tool_calls) {
                const toolCalls = event.step_details.tool_calls
                for (const tool of toolCalls) {
                  const funcName = tool.function?.name || ''

                  // Capturar nl2code (genera el DAX) o execute (ejecuta y devuelve resultados)
                  if (funcName === 'analyze.database.nl2code' || funcName === 'analyze.database.execute') {
                    try {
                      // Parsear arguments
                      let args = {}
                      if (tool.function?.arguments) {
                        try {
                          args = JSON.parse(tool.function.arguments)
                        } catch {
                          args = {}
                        }
                      }

                      // Extraer DAX del output (nl2code) o de arguments.code (execute)
                      let daxCode = ''

                      if (funcName === 'analyze.database.nl2code' && tool.function?.output) {
                        // El DAX viene en el output como markdown
                        const output = tool.function.output
                        const daxMatch = output.match(/```dax\n?([\s\S]*?)```/)
                        if (daxMatch) {
                          daxCode = daxMatch[1].trim()
                        }
                      } else if (funcName === 'analyze.database.execute') {
                        // Extraer DAX de args.code (puede venir con ```dax wrapper)
                        if (args.code) {
                          const daxMatch = args.code.match(/```dax\n?([\s\S]*?)```/)
                          if (daxMatch) {
                            daxCode = daxMatch[1].trim()
                          } else {
                            daxCode = args.code.replace(/^```dax\n?/i, '').replace(/\n?```$/i, '').trim()
                          }
                        }
                      }

                      // Capturar output de ejecución (SOLO de execute, no de nl2code)
                      let queryOutput = null
                      const rawOutput = tool.function?.output || tool.output

                      // Solo parsear tabla del execute - nl2code solo tiene DAX
                      if (rawOutput && funcName === 'analyze.database.execute') {
                        // El output viene como tabla markdown, parsearlo
                        if (typeof rawOutput === 'string' && rawOutput.includes('|')) {
                          const normalized = rawOutput.replace(/\r\n/g, '\n').trim()
                          const lines = normalized.split('\n').filter(l => l.trim())

                          if (lines.length >= 2) {
                            const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean)
                            const dataRows = lines.slice(2)

                            queryOutput = dataRows.map(row => {
                              const cells = row.split('|').map(c => c.trim()).filter(Boolean)
                              const obj = {}
                              headers.forEach((h, idx) => {
                                const val = cells[idx] || ''
                                const num = parseFloat(val)
                                obj[h] = isNaN(num) ? val : num
                              })
                              return obj
                            }).filter(row => Object.keys(row).length > 0)
                          }
                        } else {
                          try {
                            const parsed = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput
                            if (Array.isArray(parsed)) queryOutput = parsed
                            else if (parsed.results) queryOutput = parsed.results
                            else if (parsed.value) queryOutput = parsed.value
                          } catch { /* ignore */ }
                        }
                      }

                      // Verificar si ya existe este step (buscar por call id o por DAX similar)
                      let existingStepIndex = steps.findIndex(s => s.callId === tool.id)

                      // Si es execute y no encontramos por callId, buscar el último step con DAX pero sin output
                      if (existingStepIndex < 0 && funcName === 'analyze.database.execute' && queryOutput) {
                        existingStepIndex = steps.findIndex(s => s.daxQuery && !s.output)
                      }

                      if (existingStepIndex >= 0) {
                        // Actualizar step existente
                        if (daxCode && !steps[existingStepIndex].daxQuery) {
                          steps[existingStepIndex].daxQuery = daxCode
                        }
                        if (queryOutput && !steps[existingStepIndex].output) {
                          steps[existingStepIndex].output = queryOutput
                        }
                        steps[existingStepIndex].status = event.status
                        setCurrentSteps([...steps])
                        setMessages((prev) => {
                          const updated = [...prev]
                          if (updated[botMsgIndex]) {
                            updated[botMsgIndex] = { ...updated[botMsgIndex], steps: [...steps] }
                          }
                          return updated
                        })
                        continue
                      }

                      // Nuevo step
                      const modelName = args.datasource_name || 'SemanticModel'
                      const description = args.natural_language_query || ''

                      // Solo crear step si tiene información útil
                      if (!daxCode && !description) continue

                      const stepInfo = {
                        id: event.id,
                        callId: tool.id,
                        type: 'function',
                        name: funcName,
                        modelName,
                        description,
                        daxQuery: daxCode,
                        status: event.status,
                        output: queryOutput,
                      }

                      steps.push(stepInfo)
                      setCurrentSteps([...steps])
                      setMessages((prev) => {
                        const updated = [...prev]
                        if (updated[botMsgIndex]) {
                          updated[botMsgIndex] = { ...updated[botMsgIndex], steps: [...steps] }
                        }
                        return updated
                      })
                    } catch (e) {
                      // Ignorar errores de parsing
                    }
                  }
                }
              }

            } catch (e) {
              // Ignorar líneas que no son JSON válido
            }
          }
        }
      }

      // Calcular tiempo final de respuesta
      const finalTime = Math.round((Date.now() - startTime) / 1000)
      setResponseTime(finalTime)
      setStreamingIndex(null)

      // Log resumen al finalizar
      console.log(`✅ Streaming completed in ${finalTime}s - ${steps.length} step(s)`)
      console.log('📄 Response:', fullContent)
      if (steps.length > 0) {
        steps.forEach((step, i) => {
          console.log(`📊 Step ${i + 1}:`, {
            model: step.modelName,
            query: step.description,
            hasDAX: !!step.daxQuery,
            outputRows: Array.isArray(step.output) ? step.output.length : 0
          })
        })
      }

      // Si no hubo streaming, obtener mensaje normal
      if (!fullContent) {
        const msgs = await apiCall(token, `/threads/${thread.id}/messages`)
        const assistantMsg = msgs.data?.find((m) => m.role === 'assistant')
        fullContent = assistantMsg?.content?.[0]?.text?.value || 'Sin respuesta'
      }

      // Marcar que terminó el streaming
      setMessages((prev) => {
        const updated = [...prev]
        updated[botMsgIndex] = { role: 'assistant', content: fullContent, steps: [...steps], responseTime: finalTime, isStreaming: false }
        return updated
      })

      // Cleanup del thread
      try {
        await apiCall(token, `/threads/${thread.id}`, 'DELETE')
      } catch (e) {
        console.log('Thread cleanup error (ignorado):', e)
      }
    } catch (error) {
      console.error('Error:', error)
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      setStreamingIndex(null)
      setMessages((prev) => {
        const updated = [...prev]
        updated[botMsgIndex] = { role: 'assistant', content: `Error: ${error.message}`, steps: [], responseTime: elapsed, isStreaming: false }
        return updated
      })
    } finally {
      setLoading(false)
      isSubmittingRef.current = false
    }
  }

  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Card className={styles.loginCard}>
          <Text size={500} weight="semibold">
            VE Data Agent
          </Text>
          <Text>Inicia sesión para consultar tus datos</Text>
          <Button appearance="primary" onClick={login} style={{ marginTop: 16 }}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Tabs de Data Agents */}
      {availableAgents.length > 0 && (
        <div className={styles.tabsHeader}>
          <div className={styles.tabsContent}>
            <TabList
              selectedValue={selectedAgentId}
              onTabSelect={(_, data) => setSelectedAgentId(data.value)}
              size="small"
            >
              {availableAgents.map(agent => (
                <Tab key={agent.id} value={agent.id}>
                  {agent.displayName}
                </Tab>
              ))}
            </TabList>
          </div>
        </div>
      )}

      <div className={styles.chatArea}>
        {/* Contenido centrado con max-width */}
        <div className={styles.chatContent}>
          {messages.length === 0 && (
            <Text style={{ textAlign: 'center', color: tokens.colorNeutralForeground3, marginTop: '40px' }}>
              {agentInfo?.instruction || 'Ask a question to test the data agent\'s response'}
            </Text>
          )}
          {messages.map((msg, i) => (
            <div key={i}>
            {/* Mensaje del usuario */}
            {msg.role === 'user' && (
              <div className={styles.messageUser}>
                {msg.content}
              </div>
            )}

            {/* Respuesta del assistant */}
            {msg.role === 'assistant' && (
              <div style={{
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: `1px solid ${tokens.colorNeutralStroke1}`,
                padding: '20px 24px',
              }}>
                {/* Durante streaming: mostrar panel de análisis ANTES de la respuesta */}
                {msg.isStreaming && (
                  <div className={styles.stepsPanel} style={{ marginBottom: '16px' }}>
                    {/* Texto "Analyzing..." */}
                    <div style={{ padding: '16px' }}>
                      <div className={styles.analyzingText}>
                        <strong>Analyzing</strong> {currentSteps[0]?.modelName || 'Orders'} <strong>SemanticModel</strong> database ...
                      </div>

                      {/* Details header colapsable */}
                      <div
                        className={styles.detailsHeader}
                        onClick={() => toggleStepsExpanded(i)}
                      >
                        <span>Details</span>
                        <span>{isStepsExpanded(i) ? '∧' : '∨'}</span>
                      </div>

                      {/* Contenido de Details */}
                      {isStepsExpanded(i) && currentSteps.map((step, stepIdx) => (
                        <div key={stepIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 16px',
                          backgroundColor: tokens.colorNeutralBackground1,
                          border: `1px solid ${tokens.colorNeutralStroke1}`,
                          borderRadius: '8px',
                          marginBottom: '8px',
                        }}>
                          {/* Spinner circular */}
                          <div className={styles.spinnerCircle}></div>
                          <div style={{ flex: 1, fontSize: '14px' }}>
                            Analyzing {step.modelName} SemanticModel for: "{step.description}"
                          </div>
                          <span style={{ fontSize: '16px', color: tokens.colorNeutralForeground3 }}>∨</span>
                        </div>
                      ))}

                      {/* Si no hay steps aún, mostrar placeholder */}
                      {isStepsExpanded(i) && currentSteps.length === 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 16px',
                          backgroundColor: tokens.colorNeutralBackground1,
                          border: `1px solid ${tokens.colorNeutralStroke1}`,
                          borderRadius: '8px',
                        }}>
                          <div className={styles.spinnerCircle}></div>
                          <div style={{ flex: 1, fontSize: '14px', color: tokens.colorNeutralForeground3 }}>
                            Processing your request...
                          </div>
                        </div>
                      )}

                      {/* Barra de progreso */}
                      <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    {/* Botón Stop */}
                    <div className={styles.stopButton}>
                      <span>⏹</span>
                      <span>Stop</span>
                    </div>
                  </div>
                )}

                {/* Texto de respuesta (solo si hay contenido o terminó streaming) */}
                {(msg.content || !msg.isStreaming) && (
                  <div className={styles.messageBot}>
                    {msg.content || '...'}
                  </div>
                )}

                {/* Panel de steps completados - solo después de terminar streaming */}
                {!msg.isStreaming && msg.steps && msg.steps.length > 0 && (
                  <div className={styles.stepsPanel}>
                    {/* Header del panel */}
                    <div
                      className={styles.stepsPanelHeader}
                      onClick={() => toggleStepsExpanded(i)}
                    >
                      <div className={styles.stepsPanelHeaderLeft}>
                        <span>{msg.steps.length} step{msg.steps.length !== 1 ? 's' : ''} completed</span>
                        <span style={{ fontSize: '12px' }}>{isStepsExpanded(i) ? '∧' : '∨'}</span>
                      </div>
                      {msg.responseTime && (
                        <div className={styles.responseTime}>
                          <span>⏱</span>
                          <span>Response time: {msg.responseTime} sec</span>
                        </div>
                      )}
                    </div>

                    {/* Contenido expandido */}
                    {isStepsExpanded(i) && (
                      <>

                        {/* Steps */}
                        {msg.steps?.map((step, stepIdx) => (
                          <div key={stepIdx} style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke1}` }}>
                            {/* Info del step - clickeable para expandir/colapsar */}
                            <div
                              className={styles.stepItem}
                              onClick={() => toggleStepItemExpanded(i, stepIdx)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={styles.stepHeader}>
                                <span className={styles.stepCheckmark}>✓</span>
                                <div className={styles.stepDescription}>
                                  <strong>Analyzed {step.modelName} SemanticModel</strong>
                                  {step.description && (
                                    <span> for: "{step.description}"</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '16px', color: tokens.colorNeutralForeground3 }}>
                                  {isStepItemExpanded(i, stepIdx) ? '∧' : '∨'}
                                </span>
                              </div>
                            </div>

                            {/* Contenido expandible del step */}
                            {isStepItemExpanded(i, stepIdx) && (
                              <>
                                {/* Query code section */}
                                {step.daxQuery && (
                                  <>
                                    <div className={styles.queryCodeHeader}>
                                      <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>&lt;/&gt;</span>
                                      <span>Query code</span>
                                    </div>

                                    <div className={styles.codeBlock}>
                                      <div className={styles.codeHeader}>
                                        <span>Dax</span>
                                        <span
                                          className={styles.copyButton}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            copyToClipboard(step.daxQuery)
                                          }}
                                          title="Copy to clipboard"
                                        >
                                          📋
                                        </span>
                                      </div>
                                      <pre className={styles.codeContent}>
                                        {step.daxQuery}
                                      </pre>
                                    </div>
                                  </>
                                )}

                                {/* Query output section - tabla de resultados */}
                                {step.output && (
                                  <>
                                    <div className={styles.queryOutputSection}>
                                      <span>⊞</span>
                                      <span>Query output</span>
                                    </div>
                                    <div className={styles.queryOutputTable}>
                                      <div className={styles.tableContainer}>
                                        {/* Si es array de objetos, mostrar tabla */}
                                        {Array.isArray(step.output) && step.output.length > 0 && typeof step.output[0] === 'object' ? (
                                          <>
                                            <table className={styles.table}>
                                              <thead>
                                                <tr>
                                                  {Object.keys(step.output[0]).map((col, colIdx) => (
                                                    <th key={colIdx} className={styles.tableHeader}>{col}</th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {step.output.slice(0, 10).map((row, rowIdx) => (
                                                  <tr key={rowIdx} className={styles.tableRow}>
                                                    {Object.values(row).map((val, valIdx) => (
                                                      <td key={valIdx} className={styles.tableCell}>
                                                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                                                      </td>
                                                    ))}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            {step.output.length > 10 && (
                                              <div style={{ padding: '8px 12px', fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                                                Showing 10 of {step.output.length} rows
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          /* Fallback: mostrar como texto/JSON */
                                          <pre className={styles.codeContent} style={{ margin: 0 }}>
                                            {typeof step.output === 'string'
                                              ? step.output
                                              : JSON.stringify(step.output, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ))}

                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className={styles.inputArea}>
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', position: 'relative' }}>
          {/* Sample questions a la derecha encima del input */}
          {agentInfo?.sampleQuestions && agentInfo.sampleQuestions.length > 0 && (
            <div style={{ position: 'absolute', right: '0', top: '-24px' }}>
              <Text
                size={200}
                style={{ cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  if (agentInfo.sampleQuestions[0]) {
                    setInput(agentInfo.sampleQuestions[0])
                  }
                }}
              >
                <span>📋</span> Sample questions
              </Text>
            </div>
          )}
          <div className={styles.inputWrapper}>
            <textarea
              placeholder={agentInfo?.instruction || "Ask a question to test the data agent's response"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                resize: 'none',
                width: '100%',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button
                appearance="transparent"
                icon={<Send24Regular />}
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ color: loading || !input.trim() ? '#999' : '#666' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 24px',
        backgroundColor: '#fafafa',
      }}>
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', fontSize: '12px', color: '#666' }}>
          Created with AI. Mistakes are possible. <a href="#" style={{ color: tokens.colorBrandForeground1 }}>Review terms</a>
        </div>
      </div>
    </div>
  )
}

export default App
