# 16 - Soporte Offline

## 1. Contexto

El módulo de incidentes (SAI-Móvil) debe funcionar en condiciones de conectividad limitada, según el requerimiento RF-IN-03 y RNF-03.

## 2. Estrategia

### 2.1 Firestore Offline (nativo)

Firestore tiene soporte offline incorporado en el SDK web. Cuando se habilita:

1. Los datos leídos se cachean automáticamente.
2. Las escrituras se realizan localmente y se sincronizan cuando hay conexión.
3. No se necesita implementar nada adicional.

### 2.2 Habilitar offline

```typescript
// src/services/firebase.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Habilitar persistencia offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Múltiples pestañas abiertas
    console.warn('Persistencia offline no disponible');
  } else if (err.code === 'unimplemented') {
    // Navegador no soporta IndexedDB
    console.warn('Navegador no soporta offline');
  }
});
```

## 3. Comportamiento esperado

### 3.1 Con conexión

```
Usuario crea incidente
        │
        ▼
Firestore guarda localmente + envía al servidor
        │
        ▼
Datos disponibles en tiempo real
```

### 3.2 Sin conexión

```
Usuario crea incidente
        │
        ▼
Firestore guarda localmente (IndexedDB)
        │
        ▼
App muestra "Guardado localmente"
        │
        │  (cuando se restablece la conexión)
        ▼
Firestore sincroniza automáticamente
        │
        ▼
App muestra "Sincronizado"
```

## 4. UI para estado de conexión

### 4.1 Indicador de conexión

```
┌─────────────────────────────────────┐
│  ⚠ Sin conexión — Los cambios se    │
│  sincronizarán cuando haya internet │
└─────────────────────────────────────┘
```

- Posición: Debajo del navbar, ancho completo.
- Color de fondo: Amarillo (`#ca8a04`)
- Color de texto: Blanco
- Se oculta cuando hay conexión.

### 4.2 Mensaje de sincronización

```
┌─────────────────────────────────────┐
│  ✅ Sincronizado correctamente      │
└─────────────────────────────────────┘
```

- Aparece brevemente cuando se sincroniza.
- Se oculta después de 3 segundos.

## 5. Limitaciones

| Funcionalidad | Offline | Online |
|---|---|---|
| Crear incidente | Sí | Sí |
| Ver incidentes propios | Sí (cacheados) | Sí |
| Ver todos los incidentes | No | Sí |
| Cambiar estado de incidente | No | Sí |
| Crear asistencia | Sí | Sí |
| Ver asistencias | Sí (cacheadas) | Sí |
| Crear novedad | Sí | Sí |
| Ver novedades | Sí (cacheadas) | Sí |

## 6. Detección de conexión

```typescript
// src/hooks/custom/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```
