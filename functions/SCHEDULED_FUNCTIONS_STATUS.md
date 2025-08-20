# Funciones Programadas Temporalmente Desactivadas

## Estado Actual

Todas las funciones programadas (scheduled functions) han sido temporalmente desactivadas para permitir pruebas de los métodos getter sin interferencia automática.

## Funciones Desactivadas

### 1. `updatePortfolioPrices`

- **Programación**: Cada hora durante horas de mercado (9 AM - 4 PM EST, Lunes a Viernes)
- **Función**: Actualización automática de precios de portafolios
- **Estado**: ⚠️ DESACTIVADA - Retorna inmediatamente con mensaje de log

### 2. `onPortfolioChange`

- **Programación**: Cada 15 minutos
- **Función**: Monitoreo de cambios en portafolios y gestión de símbolos
- **Estado**: ⚠️ DESACTIVADA - Retorna inmediatamente con mensaje de log

### 3. `forceUpdatePrices`

- **Programación**: Manual (1 de enero anualmente)
- **Función**: Forzar actualización de precios manualmente
- **Estado**: ⚠️ DESACTIVADA - Retorna inmediatamente con mensaje de log

### 4. `cleanupOldPriceData`

- **Programación**: Diariamente a las 2 AM UTC
- **Función**: Limpieza de datos históricos antiguos
- **Estado**: ⚠️ DESACTIVADA - Retorna inmediatamente con mensaje de log

## Funciones Activas (Getter/Query)

Las siguientes funciones **SÍ están activas** para pruebas:

### En `marketDataFunctions.ts`:

- ✅ `searchTradableAssets` - Búsqueda de activos
- ✅ `getAssetDetails` - Detalles de activos específicos
- ✅ `getWatchlistPrices` - Precios de lista de seguimiento
- ✅ `refreshAssetPrices` - Actualización manual de precios
- ✅ `updatePortfolioWithCurrentPrices` - Actualización manual de portafolio

### En `portfolioFunctions.ts`:

- ✅ Todas las funciones de lectura y consulta de portafolios

## Para Reactivar las Funciones

1. Remover los `return` tempranos en cada función
2. Descomentar el código funcional
3. Recompilar con `npm run build`
4. Redesplegar las funciones

## Notas de Testing

- Los logs mostrarán mensajes indicando que las funciones están desactivadas
- La base de datos NO se actualizará automáticamente
- Ideal para probar métodos getter sin interferencia de procesos automáticos
- Permite observar el comportamiento de la DB sin modificaciones automáticas
