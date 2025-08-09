# 📚 PATRÓN ESTÁNDAR MEJORADO PARA SERVICIOS Y HOOKS

## 🎯 **MEJOR PRÁCTICA - PATRÓN ESTANDARIZADO v2.0**

### **🚀 MEJORAS IMPLEMENTADAS:**

1. **Repository Pattern** con interfaces
2. **Error Handling** con tipos específicos
3. **Loading States** granulares
4. **Optimistic Updates** para mejor UX
5. **Cache Management** con invalidación
6. **Type Safety** mejorada
7. **Dependency Injection** para testing

### **1. ESTRUCTURA DEL SERVICIO MEJORADA**

```typescript
// shared/types/[feature].types.ts
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

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

// shared/interfaces/[feature].interface.ts
export interface I[Feature]Repository {
  // Subscripciones tipadas
  subscribe(userId: string): AsyncGenerator<IModel[], void, unknown>;
  subscribeToItem(userId: string, id: string): AsyncGenerator<IModel | null, void, unknown>;

  // CRUD con mejor tipado
  get(userId: string, id: string): Promise<ServiceResult<IModel>>;
  getAll(userId: string, options?: PaginationOptions): Promise<ServiceResult<IModel[]>>;
  create(userId: string, data: Omit<IModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<string>>;
  update(userId: string, id: string, data: Partial<IModel>): Promise<ServiceResult<void>>;
  delete(userId: string, id: string): Promise<ServiceResult<void>>;

  // Validaciones y utilidades
  validate(data: Partial<IModel>): Promise<ServiceResult<IModel>>;
  exists(userId: string, id: string): Promise<boolean>;
}

// src/services/finances/[feature]Service.ts
class [Feature]FirebaseRepository implements I[Feature]Repository {
  private readonly collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  private getCollection(userId: string) {
    return collection(firestore, FIRESTORE_PATHS[this.collectionPath](userId));
  }

  async *subscribe(userId: string): AsyncGenerator<IModel[], void, unknown> {
    const collectionRef = this.getCollection(userId);
    const q = query(collectionRef, orderBy('updatedAt', 'desc'));

    yield* this.createSubscription(q);
  }

  private async *createSubscription<T>(query: Query): AsyncGenerator<T[], void, unknown> {
    let unsubscribe: (() => void) | null = null;

    try {
      const channel = new BroadcastChannel(`firestore-${query.toString()}`);

      unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const data = snapshot.docs.map(doc =>
            normalizeObjectDates({ id: doc.id, ...doc.data() }, toDayjs)
          ) as T[];
          channel.postMessage({ type: 'data', data });
        },
        (error) => {
          channel.postMessage({ type: 'error', error: getError(error) });
        }
      );

      // Listen for updates
      while (true) {
        const message = await new Promise<{ type: string; data?: T[]; error?: string }>(
          resolve => {
            const handler = (event: MessageEvent) => {
              channel.removeEventListener('message', handler);
              resolve(event.data);
            };
            channel.addEventListener('message', handler);
          }
        );

        if (message.type === 'error') {
          throw new Error(message.error);
        }

        if (message.data) {
          yield message.data;
        }
      }
    } finally {
      unsubscribe?.();
    }
  }

  async get(userId: string, id: string): Promise<ServiceResult<IModel>> {
    try {
      const docRef = doc(this.getCollection(userId), id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return {
          error: {
            code: 'NOT_FOUND',
            message: `${this.collectionPath} with id ${id} not found`,
          },
        };
      }

      const data = normalizeObjectDates<IModel>(
        { id: snapshot.id, ...snapshot.data() },
        toDayjs
      );

      return { data };
    } catch (error) {
      return {
        error: {
          code: 'FETCH_ERROR',
          message: getError(error),
          details: error,
        },
      };
    }
  }

  async create(
    userId: string,
    data: Omit<IModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<string>> {
    try {
      // Validación previa
      const validation = await this.validate({ ...data, userId });
      if (validation.error) {
        return validation as ServiceResult<string>;
      }

      const now = new Date();
      const docData = {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const collectionRef = this.getCollection(userId);
      const docRef = await addDoc(collectionRef, normalizeObjectDates(docData, toTimestamp));

      return { data: docRef.id };
    } catch (error) {
      return {
        error: {
          code: 'CREATE_ERROR',
          message: getError(error),
          details: error,
        },
      };
    }
  }

  async validate(data: Partial<IModel>): Promise<ServiceResult<IModel>> {
    const errors: string[] = [];

    // Validaciones específicas del modelo
    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    if (errors.length > 0) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join(', '),
          details: errors,
        },
      };
    }

    return { data: data as IModel };
  }
}

// Mock Repository
class [Feature]MockRepository implements I[Feature]Repository {
  private mockData: IModel[] = MOCK_DATA;
  private delay = 1000;

  async *subscribe(userId: string): AsyncGenerator<IModel[], void, unknown> {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
      yield this.mockData.filter(item => item.userId === userId);
    }
  }

  async get(userId: string, id: string): Promise<ServiceResult<IModel>> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    const item = this.mockData.find(item => item.id === id && item.userId === userId);

    if (!item) {
      return {
        error: {
          code: 'NOT_FOUND',
          message: `Item with id ${id} not found`,
        },
      };
    }

    return { data: item };
  }

  async create(
    userId: string,
    data: Omit<IModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<string>> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    const newId = `mock_${Date.now()}`;
    const now = new Date();

    const newItem: IModel = {
      ...data,
      id: newId,
      userId,
      createdAt: now,
      updatedAt: now,
    } as IModel;

    this.mockData.push(newItem);

    return { data: newId };
  }

  async validate(data: Partial<IModel>): Promise<ServiceResult<IModel>> {
    // Misma validación que el servicio real
    return new [Feature]FirebaseRepository('').validate(data);
  }
}

// Factory con Dependency Injection
export const create[Feature]Repository = (
  options: {
    forceMock?: boolean;
    config?: {
      collectionPath?: string;
      mockDelay?: number;
    };
  } = {}
): I[Feature]Repository => {
  const { forceMock = false, config = {} } = options;

  if (ENV.USE_MOCKED_DATA || forceMock) {
    const mockRepo = new [Feature]MockRepository();
    if (config.mockDelay) {
      (mockRepo as any).delay = config.mockDelay;
    }
    return mockRepo;
  }

  return new [Feature]FirebaseRepository(
    config.collectionPath || 'DEFAULT_COLLECTION_PATH'
  );
};

// Exportaciones para compatibilidad
export const [feature]Service = create[Feature]Repository();
export const mock[Feature]Service = create[Feature]Repository({ forceMock: true });
export const create[Feature]Service = create[Feature]Repository; // Alias
```

### **2. ESTRUCTURA DEL HOOK MEJORADA**

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
