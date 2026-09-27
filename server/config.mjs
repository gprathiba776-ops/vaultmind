try {
  process.loadEnvFile?.('.env');
} catch {
  // Environment variables may be injected by the host/container.
}

const truthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  demoMode: truthy(process.env.DEMO_MODE),

  session: {
    secret: process.env.VAULTMIND_SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'vaultmind-development-session-secret-change-me'),
  },

  lyzr: {
    apiKey: process.env.LYZR_API_KEY || '',
    agentId: process.env.LYZR_AGENT_ID || '',
    apiUrl: process.env.LYZR_API_URL || 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  },

  qdrant: {
    url: process.env.QDRANT_URL || '',
    apiKey: process.env.QDRANT_API_KEY || '',
    collection: process.env.QDRANT_COLLECTION || 'vaultmind_memories',
    vectorSize: Number(process.env.QDRANT_VECTOR_SIZE || 768),
  },

  embeddings: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    outputDimensionality: Number(process.env.GEMINI_EMBEDDING_DIMENSION || 768),
  },

  omi: {
    webhookToken: process.env.OMI_WEBHOOK_TOKEN || '',
    apiKey: process.env.OMI_API_KEY || '',
    apiBaseUrl: process.env.OMI_API_BASE_URL || 'https://api.omi.me',
  },
};

export function integrationStatus() {
  return {
    mode: config.demoMode ? 'DEMO' : 'SERVER',
    lyzr: {
      configured: Boolean(config.lyzr.apiKey && config.lyzr.agentId),
      agentId: config.lyzr.agentId || 'not-configured',
      endpoint: config.lyzr.apiUrl,
    },
    qdrant: {
      configured: Boolean(config.qdrant.url),
      collection: config.qdrant.collection,
      url: config.qdrant.url ? '[configured]' : null,
    },
    embeddings: {
      configured: Boolean(config.embeddings.apiKey),
      model: config.embeddings.model,
      dimensions: config.embeddings.outputDimensionality,
    },
    omi: {
      webhookConfigured: Boolean(config.omi.webhookToken),
      apiConfigured: Boolean(config.omi.apiKey),
    },
  };
}
