# 📚 PATRÓN ESTÁNDAR UNIFICADO PARA SERVICIOS Y HOOKS

## 🎯 **PATRÓN ESTANDARIZADO v2.0 - COMPLETAMENTE UNIFICADO**

### **🚀 MEJORAS IMPLEMENTADAS:**

1. **Servicios Unificados**: Mock y real en el mismo archivo
2. **Factory Interna**: Lógica de creación dentro del servicio
3. **Mock Data Inline**: Datos de prueba junto al código
4. **Índice Simple**: Solo re-exports, sin lógica
5. **Consistencia Total**: Mismo patrón para todos los servicios
6. **Mantenimiento Fácil**: Un solo archivo por feature

## ✅ **PATRÓN UNIFICADO - IMPLEMENTACIÓN COMPLETADA**

### **🎯 ESTADO ACTUAL (POST-UNIFICACIÓN):**

```
src/services/finances/
├── personalFinancesService.ts     # ✅ TODO unificado
│   ├── Mock data inline
│   ├── Firebase service
│   ├── Mock service
│   └── Factory function
├── portfolioService.ts            # ✅ TODO unificado
│   ├── Mock data inline
│   ├── Firebase service
│   ├── Mock service
│   └── Factory function
└── index.ts                       # ✅ Solo re-exports
    └── Imports desde archivos principales
```

### **🗑️ ARCHIVOS ELIMINADOS:**

- ❌ `mockFinancialPlansService.ts` → Unificado en `personalFinancesService.ts`
- ❌ `financeMockData.ts` → Mock data inline en servicios
- ❌ Factory functions en `index.ts` → Movidas a archivos principales

### **📈 BENEFICIOS ALCANZADOS:**

1. **🗂️ Organización Simple**: Un archivo por feature, no fragmentación
2. **🔄 Consistencia Total**: Mismo patrón en todos los servicios
3. **🛠️ Mantenimiento Fácil**: Cambios en un solo lugar
4. **📋 Overview Claro**: Todo el servicio visible de un vistazo
5. **🎯 DRY Principle**: Validaciones compartidas entre mock y real
6. **📁 Menos Archivos**: Reducción significativa de archivos de configuración

### **1. ESTRUCTURA DEL SERVICIO UNIFICADA**

```typescript
// src/services/[domain]/[feature]Service.ts

// ============= TIPOS Y INTERFACES =============
export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ServiceResult<T> {
  data?: T;
  error?: ServiceError;
  loading?: boolean;
}

// ============= MOCK DATA (EN EL MISMO ARCHIVO) =============
const MOCK_DATA: IModel[] = [
  {
    id: 'mock-1',
    name: 'Mock Item 1',
    // ... datos de prueba
  },
  {
    id: 'mock-2',
    name: 'Mock Item 2',
    // ... más datos
  }
];

// ============= FIREBASE SERVICE =============
export const [feature]Service = {
  getCollection: (userId: string) =>
    collection(firestore, FIRESTORE_PATHS[FEATURE](userId)),

  subscribe: (
    userId: string,
    onSuccess: (data: IModel[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = [feature]Service.getCollection(userId);

    return onSnapshot(
      collectionRef,
      (snap) => {
        const data = snap.docs.map(doc =>
          normalizeObjectDates({ id: doc.id, ...doc.data() }, toDayjs)
        );
        onSuccess(data);
      },
      (error) => onError(getError(error))
    );
  },

  get: async (userId: string, id: string): Promise<IModel> => {
    const docRef = doc([feature]Service.getCollection(userId), id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('No data found');
    }

    return normalizeObjectDates({ id: snap.id, ...snap.data() }, toDayjs);
  },

  set: async (userId: string, data: IModel): Promise<void> => {
    const collectionRef = [feature]Service.getCollection(userId);
    const docRef = data.id
      ? doc(collectionRef, data.id)
      : doc(collectionRef);

    const { id, ...cleanData } = normalizeObjectDates(data, toTimestamp);
    await setDoc(docRef, cleanData);
  },

  validate: (data: Partial<IModel>): string[] => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    // Más validaciones...
    return errors;
  },
};

// ============= MOCK SERVICE (MISMA INTERFAZ) =============
let mockData = [...MOCK_DATA];
type SubscriberCallback = (data: IModel[]) => void;
const subscribers: Set<SubscriberCallback> = new Set();

const notifySubscribers = () => {
  subscribers.forEach((callback) => {
    try {
      callback([...mockData]);
    } catch (error) {
      console.error('Error notifying subscriber:', error);
    }
  });
};

export const mock[Feature]Service = {
  subscribe: (
    _userId: string,
    onSuccess: (data: IModel[]) => void,
    onError: (error: string) => void
  ) => {
    subscribers.add(onSuccess);

    const timeoutId = setTimeout(() => {
      try {
        onSuccess([...mockData]);
      } catch (error) {
        onError('Mock error occurred');
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      subscribers.delete(onSuccess);
    };
  },

  get: async (_userId: string, id: string): Promise<IModel> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const item = mockData.find(item => item.id === id);
    if (!item) {
      throw new Error('No data found');
    }
    return { ...item };
  },

  set: async (_userId: string, data: IModel): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 250));

    if (!data.id) {
      const newItem = { ...data, id: `mock-${Date.now()}` };
      mockData.push(newItem);
    } else {
      const index = mockData.findIndex(item => item.id === data.id);
      if (index === -1) {
        throw new Error('Item not found for update');
      }
      mockData[index] = { ...data };
    }

    setTimeout(() => notifySubscribers(), 100);
  },

  validate: [feature]Service.validate, // Reutilizar validaciones
};

// ============= FACTORY PATTERN =============
export const create[Feature]Service = (forceMock: boolean = false) => {
  return process.env.NODE_ENV === 'development' || forceMock
    ? mock[Feature]Service
    : [feature]Service;
};
```

### **3. ESTRUCTURA DEL ÍNDICE SIMPLIFICADA**

```typescript
// src/services/[domain]/index.ts

// ✅ IMPORTAR TODO DESDE LOS ARCHIVOS PRINCIPALES
import {
  [feature]Service,
  mock[Feature]Service,
  create[Feature]Service
} from './[feature]Service';

import {
  [otherFeature]Service,
  mock[OtherFeature]Service,
  create[OtherFeature]Service
} from './[otherFeature]Service';

// ✅ RE-EXPORTAR SIN LÓGICA ADICIONAL
export {
  [feature]Service,
  mock[Feature]Service,
  create[Feature]Service,
  [otherFeature]Service,
  mock[OtherFeature]Service,
  create[OtherFeature]Service,
};
```

### **🎯 PRINCIPIOS DEL PATRÓN UNIFICADO:**

1. **📁 Un Archivo por Servicio**: Todo en `[feature]Service.ts`
2. **🏭 Factory Interna**: `create[Feature]Service` dentro del mismo archivo
3. **� Índice Simple**: Solo imports y exports, sin lógica
4. **🔄 Validaciones Compartidas**: Mock reutiliza validaciones del real
5. **� Mock Data Inline**: Datos de prueba dentro del archivo principal### **2. ESTRUCTURA DEL HOOK MEJORADA**

```typescript
// src/hooks/use[Feature].ts

interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

interface Use[Feature]Options extends CommonFetchHookProps {
  enableOptimisticUpdates?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
  pagination?: PaginationOptions;
}

interface Use[Feature]Result {
  // Data states
  data: IModel[];
  selectedItem: IModel | null;

  // Loading states granulares
  loading: LoadingStates;
  isLoading: boolean; // computed

  // Error handling
  error: ServiceError | null;

  // Pagination
  pagination: {
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
  };

  // CRUD operations con optimistic updates
  actions: {
    create: (data: Omit<IModel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServiceResult<string>>;
    update: (id: string, data: Partial<IModel>) => Promise<ServiceResult<void>>;
    delete: (id: string) => Promise<ServiceResult<void>>;
    select: (id: string) => Promise<void>;
    validate: (data: Partial<IModel>) => Promise<ServiceResult<IModel>>;
  };

  // Cache management
  cache: {
    invalidate: () => void;
    refresh: () => Promise<void>;
    isStale: boolean;
  };
}

const use[Feature] = (
  resourceId?: string,
  options: Use[Feature]Options = {}
): Use[Feature]Result => {
  const {
    autoLoad = true,
    forceMock = false,
    enableOptimisticUpdates = true,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    pagination,
  } = options;

  const { currentUser } = useAuth();

  // States
  const [data, setData] = useState<IModel[]>([]);
  const [selectedItem, setSelectedItem] = useState<IModel | null>(null);
  const [loading, setLoading] = useState<LoadingStates>({
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  });
  const [error, setError] = useState<ServiceError | null>(null);
  const [cache, setCacheState] = useState({
    lastFetch: 0,
    isStale: false,
  });

  // Repository con dependency injection
  const repository = useMemo(
    () => create[Feature]Repository({ forceMock }),
    [forceMock]
  );

  // Computed values
  const isLoading = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );

  const isStale = useMemo(
    () => enableCache && Date.now() - cache.lastFetch > cacheTimeout,
    [cache.lastFetch, cacheTimeout, enableCache]
  );

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError({
        code: 'UNHANDLED_ERROR',
        message: event.message,
        details: event.error,
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Main subscription effect con async generator
  useEffect(() => {
    if (!autoLoad || !currentUser) return;

    let cancelled = false;

    const subscribeToData = async () => {
      setLoading(prev => ({ ...prev, fetching: true }));
      setError(null);

      try {
        for await (const result of repository.subscribe(currentUser.uid)) {
          if (cancelled) break;

          setData(result);
          setCacheState({
            lastFetch: Date.now(),
            isStale: false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError({
            code: 'SUBSCRIPTION_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
            details: err,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(prev => ({ ...prev, fetching: false }));
        }
      }
    };

    subscribeToData();

    return () => {
      cancelled = true;
    };
  }, [autoLoad, currentUser, repository]);

  // CRUD Actions con optimistic updates
  const actions = useMemo(() => ({
    create: async (itemData: Omit<IModel, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) {
        const error = { code: 'AUTH_ERROR', message: 'User not authenticated' };
        setError(error);
        return { error };
      }

      setLoading(prev => ({ ...prev, creating: true }));
      setError(null);

      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const tempItem: IModel = {
        ...itemData,
        id: tempId,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IModel;

      if (enableOptimisticUpdates) {
        setData(prev => [tempItem, ...prev]);
      }

      try {
        const result = await repository.create(currentUser.uid, itemData);

        if (result.error) {
          // Revert optimistic update
          if (enableOptimisticUpdates) {
            setData(prev => prev.filter(item => item.id !== tempId));
          }
          setError(result.error);
          return result;
        }

        // Update with real ID
        if (enableOptimisticUpdates && result.data) {
          setData(prev => prev.map(item =>
            item.id === tempId
              ? { ...item, id: result.data! }
              : item
          ));
        }

        return result;
      } catch (err) {
        const error = {
          code: 'CREATE_ERROR',
          message: err instanceof Error ? err.message : 'Create failed',
          details: err,
        };

        // Revert optimistic update
        if (enableOptimisticUpdates) {
          setData(prev => prev.filter(item => item.id !== tempId));
        }

        setError(error);
        return { error };
      } finally {
        setLoading(prev => ({ ...prev, creating: false }));
      }
    },

    update: async (id: string, updates: Partial<IModel>) => {
      if (!currentUser) {
        const error = { code: 'AUTH_ERROR', message: 'User not authenticated' };
        setError(error);
        return { error };
      }

      setLoading(prev => ({ ...prev, updating: true }));
      setError(null);

      // Store original for rollback
      const originalItem = data.find(item => item.id === id);

      // Optimistic update
      if (enableOptimisticUpdates && originalItem) {
        setData(prev => prev.map(item =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        ));
      }

      try {
        const result = await repository.update(currentUser.uid, id, updates);

        if (result.error) {
          // Revert optimistic update
          if (enableOptimisticUpdates && originalItem) {
            setData(prev => prev.map(item =>
              item.id === id ? originalItem : item
            ));
          }
          setError(result.error);
        }

        return result;
      } catch (err) {
        const error = {
          code: 'UPDATE_ERROR',
          message: err instanceof Error ? err.message : 'Update failed',
          details: err,
        };

        // Revert optimistic update
        if (enableOptimisticUpdates && originalItem) {
          setData(prev => prev.map(item =>
            item.id === id ? originalItem : item
          ));
        }

        setError(error);
        return { error };
      } finally {
        setLoading(prev => ({ ...prev, updating: false }));
      }
    },

    delete: async (id: string) => {
      if (!currentUser) {
        const error = { code: 'AUTH_ERROR', message: 'User not authenticated' };
        setError(error);
        return { error };
      }

      setLoading(prev => ({ ...prev, deleting: true }));
      setError(null);

      // Store original for rollback
      const originalItem = data.find(item => item.id === id);

      // Optimistic update
      if (enableOptimisticUpdates) {
        setData(prev => prev.filter(item => item.id !== id));
      }

      try {
        const result = await repository.delete(currentUser.uid, id);

        if (result.error) {
          // Revert optimistic update
          if (enableOptimisticUpdates && originalItem) {
            setData(prev => [...prev, originalItem].sort((a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ));
          }
          setError(result.error);
        }

        return result;
      } catch (err) {
        const error = {
          code: 'DELETE_ERROR',
          message: err instanceof Error ? err.message : 'Delete failed',
          details: err,
        };

        // Revert optimistic update
        if (enableOptimisticUpdates && originalItem) {
          setData(prev => [...prev, originalItem].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ));
        }

        setError(error);
        return { error };
      } finally {
        setLoading(prev => ({ ...prev, deleting: false }));
      }
    },

    select: async (id: string) => {
      const item = data.find(item => item.id === id);
      if (item) {
        setSelectedItem(item);
        return;
      }

      // Fetch if not in cache
      if (currentUser) {
        const result = await repository.get(currentUser.uid, id);
        if (result.data) {
          setSelectedItem(result.data);
        } else if (result.error) {
          setError(result.error);
        }
      }
    },

    validate: async (itemData: Partial<IModel>) => {
      return await repository.validate(itemData);
    },
  }), [currentUser, data, repository, enableOptimisticUpdates]);

  // Cache management
  const cacheActions = useMemo(() => ({
    invalidate: () => {
      setCacheState(prev => ({ ...prev, isStale: true }));
    },

    refresh: async () => {
      if (currentUser) {
        setCacheState({
          lastFetch: Date.now(),
          isStale: false,
        });
        // Trigger re-subscription or manual fetch
      }
    },

    isStale,
  }), [isStale, currentUser]);

  // Pagination (simplified)
  const paginationActions = useMemo(() => ({
    hasMore: false, // Implement based on your pagination logic
    loadMore: async () => {
      // Implement pagination logic
    },
    refresh: async () => {
      await cacheActions.refresh();
    },
  }), [cacheActions]);

  return {
    data,
    selectedItem,
    loading,
    isLoading,
    error,
    actions,
    pagination: paginationActions,
    cache: cacheActions,
  };
};

export default use[Feature];
```

### **3. TESTING STRATEGY MEJORADA**

```typescript
// __tests__/hooks/use[Feature].test.ts

import { renderHook, act } from '@testing-library/react';
import { create[Feature]Repository } from '../services/[feature]Service';
import use[Feature] from '../hooks/use[Feature]';

// Mock del repository
const mockRepository = {
  subscribe: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  validate: jest.fn(),
};

jest.mock('../services/[feature]Service', () => ({
  create[Feature]Repository: jest.fn(() => mockRepository),
}));

describe('use[Feature]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle optimistic updates correctly', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    mockRepository.subscribe.mockImplementation(async function* () {
      yield mockData;
    });

    mockRepository.create.mockResolvedValue({ data: 'new-id' });

    const { result } = renderHook(() =>
      use[Feature]('test-user', { enableOptimisticUpdates: true })
    );

    await act(async () => {
      await result.current.actions.create({ name: 'New Item' });
    });

    // Verify optimistic update happened
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('New Item');
  });

  it('should handle error states properly', async () => {
    mockRepository.create.mockResolvedValue({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data' }
    });

    const { result } = renderHook(() => use[Feature]('test-user'));

    await act(async () => {
      await result.current.actions.create({ name: '' });
    });

    expect(result.current.error).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Invalid data'
    });
  });

  it('should manage cache correctly', async () => {
    const { result } = renderHook(() =>
      use[Feature]('test-user', { cacheTimeout: 1000 })
    );

    // Initially not stale
    expect(result.current.cache.isStale).toBe(false);

    // Wait for cache to become stale
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(result.current.cache.isStale).toBe(true);
  });
});
```

### **4. ESTRUCTURA DE ARCHIVOS MEJORADA**

```
src/
├── shared/
│   ├── types/
│   │   ├── common.types.ts          # ServiceResult, PaginationOptions, etc.
│   │   └── [feature].types.ts       # Feature-specific types
│   ├── interfaces/
│   │   └── [feature].interface.ts   # Repository interfaces
│   └── models/
│       └── [feature].model.ts       # Data models
├── services/
│   ├── base/
│   │   ├── BaseRepository.ts        # Abstract base class
│   │   └── BaseFirebaseRepository.ts
│   └── [domain]/
│       ├── [feature]Repository.ts   # Concrete implementation
│       └── index.ts
├── hooks/
│   ├── base/
│   │   └── useBaseQuery.ts          # Shared hook logic
│   └── [domain]/
│       └── use[Feature].ts
└── __tests__/
    ├── services/
    └── hooks/
```

### **5. CONFIGURATION & ENVIRONMENT**

```typescript
// src/config/services.config.ts

export interface ServiceConfig {
  environment: 'development' | 'staging' | 'production';
  enableMocks: boolean;
  enableOptimisticUpdates: boolean;
  enableCache: boolean;
  cacheTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const serviceConfig: ServiceConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  enableMocks: process.env.REACT_APP_USE_MOCKS === 'true',
  enableOptimisticUpdates: process.env.REACT_APP_OPTIMISTIC_UPDATES !== 'false',
  enableCache: process.env.REACT_APP_ENABLE_CACHE !== 'false',
  cacheTimeout: Number(process.env.REACT_APP_CACHE_TIMEOUT) || 5 * 60 * 1000,
  retryAttempts: Number(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,
  retryDelay: Number(process.env.REACT_APP_RETRY_DELAY) || 1000,
};

// src/services/base/BaseRepository.ts
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly config: ServiceConfig;

  constructor(config: ServiceConfig = serviceConfig) {
    this.config = config;
  }

  protected async withRetry<R>(
    operation: () => Promise<R>,
    attempts: number = this.config.retryAttempts
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.retryDelay)
        );
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  protected handleError(error: unknown, code: string): ServiceError {
    return {
      code,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: this.config.environment === 'development' ? error : undefined,
    };
  }
}
```

## 🚀 **CÓMO PEDIR NUEVAS FUNCIONALIDADES - PLANTILLA v2.0**

### **PLANTILLA PARA REQUESTS MEJORADA:**

```
"Necesito crear [funcionalidad] siguiendo el patrón estándar mejorado de servicios.

ARQUITECTURA REQUERIDA:
- Repository Pattern: I[Feature]Repository interface
- Error Handling: ServiceResult<T> con códigos específicos
- Loading States: Estados granulares (fetching, creating, updating, deleting)
- Optimistic Updates: [SÍ/NO] para mejor UX
- Cache Management: [SÍ/NO] con invalidación automática
- Testing Strategy: Unit tests con mocks del repository

MODELOS Y DATOS:
- Interface: I[Feature] con [propiedades específicas]
- Validaciones: [reglas de negocio específicas]
- Relaciones: [si tiene relaciones con otros modelos]

FUNCIONALIDAD ESPECÍFICA:
- CRUD Operations: [específica qué operaciones necesitas]
- Real-time Subscriptions: [qué datos necesitan tiempo real]
- Pagination: [SÍ/NO] con load more
- Search/Filter: [SÍ/NO] con qué criterios

CONFIGURACIÓN:
- Environment: [development/staging/production]
- Mock Data: [descripción de datos de prueba]
- Error Scenarios: [qué errores específicos manejar]

Implementa usando BaseRepository y el patrón repository con dependency injection."
```

### **EJEMPLO ESPECÍFICO MEJORADO:**

```
"Quiero crear un servicio para gestionar trading journal siguiendo el patrón estándar mejorado.

ARQUITECTURA REQUERIDA:
- Repository Pattern: ITradingJournalRepository interface
- Error Handling: ServiceResult<T> con códigos VALIDATION_ERROR, MARKET_CLOSED, INSUFFICIENT_FUNDS
- Loading States: Estados granulares para todas las operaciones
- Optimistic Updates: SÍ para mejor UX en trades
- Cache Management: SÍ con invalidación cada 5 minutos
- Testing Strategy: Unit tests con scenarios de trading exitosos y fallidos

MODELOS Y DATOS:
- Interface: ITradingEntry con fecha, símbolo, tipo (buy/sell), cantidad, precio, fees, notes
- Validaciones: precio > 0, cantidad > 0, fecha no futura, símbolo válido
- Relaciones: Relacionado con Portfolio (portfolioId) y Asset (assetId)

FUNCIONALIDAD ESPECÍFICA:
- CRUD Operations: Crear trades, editar notes, eliminar trades, obtener por portfolio
- Real-time Subscriptions: Lista de trades por portfolio, total P&L en tiempo real
- Pagination: SÍ con load more de 50 trades por página
- Search/Filter: SÍ por símbolo, fecha range, tipo de trade, P&L positivo/negativo

CONFIGURACIÓN:
- Environment: development con mocks, production con Firebase
- Mock Data: 20 trades de ejemplo con BTC, ETH, AAPL con P&L variado
- Error Scenarios: Market closed validation, duplicate trade detection, invalid symbol

Implementa usando BaseRepository y optimistic updates para trades."
```

## ✅ **BENEFICIOS DEL PATRÓN MEJORADO:**

### **🎯 MEJORAS SOBRE EL PATRÓN ANTERIOR:**

1. **🏗️ Repository Pattern**: Abstracción completa de la capa de datos
2. **🔒 Type Safety Avanzada**: ServiceResult<T> elimina errores de runtime
3. **⚡ Optimistic Updates**: UX inmediata con rollback automático
4. **🔄 Error Handling Robusto**: Códigos específicos y manejo centralizado
5. **💾 Cache Inteligente**: Invalidación automática y refresh manual
6. **� Loading States Granulares**: UI específica para cada operación
7. **🧪 Testing Completo**: Dependency injection facilita unit testing
8. **⚙️ Configuration Driven**: Environment variables para diferentes entornos
9. **🔁 Retry Logic**: Reintentos automáticos para operaciones fallidas
10. **📱 Real-time con Async Generators**: Mejor gestión de subscripciones

### **🚀 MIGRATION STRATEGY:**

1. **Fase 1**: Mantener servicios actuales funcionando
2. **Fase 2**: Crear nuevos repositories con interfaces
3. **Fase 3**: Migrar hooks uno por uno manteniendo compatibilidad
4. **Fase 4**: Deprecar servicios antiguos gradualmente
5. **Fase 5**: Cleanup final de código legacy

### **🎯 IMPLEMENTACIÓN PRIORITARIA:**

1. **✅ Portfolio**: Ya implementado - usar como referencia
2. **⏳ Financial Plans**: Migrar a nuevo patrón
3. **⏳ Trading Journal**: Implementar desde cero con nuevo patrón
4. **⏳ Assets/Market Data**: Implementar con cache y real-time
5. **⏳ User Settings**: Migrar con optimistic updates

## 🎯 **PORTFOLIO IMPLEMENTATION STATUS:**

✅ **COMPLETADO (Patrón v1.0):**

- `portfolioService` con factory pattern básico
- `usePortfolio` hook con subscripciones simples
- Integración básica con Firebase paths

🚧 **PENDIENTE MIGRACIÓN (Patrón v2.0):**

- Repository pattern con interfaces
- Error handling con ServiceResult<T>
- Optimistic updates con rollback
- Cache management con invalidación
- Loading states granulares
- Testing strategy completa

**🎯 SIGUIENTE PASO:** Usar la plantilla mejorada para implementaciones futuras y migrar portfolio gradualmente al patrón v2.0
