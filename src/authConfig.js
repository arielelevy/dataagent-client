// Configuración de MSAL para autenticación con Fabric
export const msalConfig = {
  auth: {
    clientId: "cb26c94e-580b-4828-8c9d-20a1d395d2b7",
    authority: "https://login.microsoftonline.com/6a197d6d-488f-4023-b91e-bfeaab90e12f",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scopes para Fabric API (usuario final)
export const fabricScopes = {
  scopes: [
    "https://api.fabric.microsoft.com/DataAgent.Execute.All",
    "https://api.fabric.microsoft.com/DataAgent.Read.All",
    "https://api.fabric.microsoft.com/MLModel.Execute.All",
  ],
};

// Configuración del Data Agent
export const dataAgentConfig = {
  workspaceId: "69de573b-8d13-4e01-8492-11d91eb5ab15",
  dataAgentId: "7a4af8af-66c4-4282-b061-21f6f965a172",
  endpoint: "https://api.fabric.microsoft.com/v1/workspaces/69de573b-8d13-4e01-8492-11d91eb5ab15/dataagents/7a4af8af-66c4-4282-b061-21f6f965a172/aiassistant/openai",
  infoEndpoint: "https://api.fabric.microsoft.com/v1/workspaces/69de573b-8d13-4e01-8492-11d91eb5ab15/dataAgents/7a4af8af-66c4-4282-b061-21f6f965a172",
};
