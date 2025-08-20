# Services Architecture

## 📁 Estructura de Servicios

```
functions/src/services/
├── README.md
├── _core/                          # Servicios base compartidos
│   ├── httpClient.ts              # Cliente HTTP base
│   ├── cache.ts                   # Sistema de cache
│   ├── rateLimiter.ts            # Control de rate limiting
│   └── errorHandler.ts           # Manejo de errores
├── financial/                     # Servicios financieros
│   ├── index.ts                  # Exports principales
│   ├── polygon/                  # Polygon.io API
│   │   ├── client.ts            # Cliente Polygon
│   │   ├── stocks.ts            # Stocks API
│   │   ├── crypto.ts            # Crypto API
│   │   ├── forex.ts             # Forex API
│   │   └── types.ts             # Types específicos
│   ├── coinGecko/               # Backup para crypto
│   │   ├── client.ts
│   │   └── crypto.ts
│   └── alphaVantage/            # Backup para stocks
│       ├── client.ts
│       └── stocks.ts
├── entertainment/                # Servicios de entretenimiento
│   ├── index.ts
│   ├── formula1/                # F1 API
│   │   ├── client.ts
│   │   ├── races.ts
│   │   ├── drivers.ts
│   │   └── types.ts
│   ├── nba/                     # NBA API
│   │   ├── client.ts
│   │   ├── games.ts
│   │   ├── players.ts
│   │   └── types.ts
│   └── lol/                     # League of Legends API
│       ├── client.ts
│       ├── matches.ts
│       ├── champions.ts
│       └── types.ts
├── ai/                          # Servicios de AI
│   ├── index.ts
│   ├── openai/                  # OpenAI integration
│   │   ├── client.ts
│   │   ├── chat.ts
│   │   └── types.ts
│   ├── anthropic/               # Claude integration
│   │   ├── client.ts
│   │   └── chat.ts
│   └── analysis/                # AI analysis services
│       ├── sentiment.ts
│       ├── marketAnalysis.ts
│       └── portfolio.ts
└── notifications/               # Servicios de notificaciones
    ├── index.ts
    ├── email/
    │   ├── client.ts
    │   └── templates.ts
    ├── push/
    │   ├── client.ts
    │   └── fcm.ts
    └── sms/
        ├── client.ts
        └── twilio.ts
```

## 🎯 Principios de Diseño

### 1. **Separación por Dominio**

- Cada dominio (financial, entertainment, ai) es independiente
- Servicios dentro del dominio pueden interactuar libremente
- Comunicación entre dominios a través de interfaces bien definidas

### 2. **Servicios Core Compartidos**

- HTTP client base con retry logic y timeouts
- Sistema de cache centralizado (Redis/Firestore)
- Rate limiting por proveedor de API
- Error handling consistente

### 3. **Múltiples Proveedores**

- Polygon.io como principal para financial
- Proveedores backup para redundancia
- Failover automático entre proveedores

### 4. **Escalabilidad**

- Nuevos dominios se agregan fácilmente
- Nuevos proveedores dentro de cada dominio
- Configuration-driven service selection

## 🔧 Implementación por Fases

### **Fase 1: Financial Services (Actual)**

```typescript
services/
├── _core/
│   ├── httpClient.ts
│   ├── cache.ts
│   └── errorHandler.ts
└── financial/
    ├── polygon/
    │   ├── client.ts
    │   ├── stocks.ts
    │   └── crypto.ts
    └── index.ts
```

### **Fase 2: Entertainment Services**

```typescript
services/entertainment/
├── formula1/
├── nba/
└── lol/
```

### **Fase 3: AI Services**

```typescript
services/ai/
├── openai/
├── anthropic/
└── analysis/
```

## 🚀 Uso en Functions

```typescript
// En portfolioFunctions.ts
import { financialService } from '@services/financial';

export const updateAssetPrices = pubsub
  .schedule('0 * * * *')
  .onRun(async () => {
    const prices = await financialService.getAllPrices(['AAPL', 'BTC-USD']);
    // Update portfolio values
  });
```

## 📊 Configuration Management

```typescript
// services/_core/config.ts
export const serviceConfig = {
  financial: {
    primary: 'polygon',
    fallback: ['alphaVantage', 'coinGecko'],
    polygon: {
      apiKey: process.env.POLYGON_API_KEY,
      baseUrl: 'https://api.polygon.io',
      rateLimits: { requests: 5, per: 'minute' },
    },
  },
  entertainment: {
    f1: {
      apiKey: process.env.F1_API_KEY,
      baseUrl: 'https://ergast.com/api/f1',
    },
  },
};
```
