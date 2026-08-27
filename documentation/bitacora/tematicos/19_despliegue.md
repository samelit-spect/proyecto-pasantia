# 19 - Despliegue

> Este documento de la bitácora recopila la **estrategia de despliegue** de la app (una PWA en React/Vite) y la configuración real utilizada en el repositorio.

---

## 1. Visión general

- La app es una **SPA estática** (React + Vite): el build genera archivos estáticos en `dist/` que se sirven desde un hosting.
- Las **reglas e índices de Firestore** se despliegan por separado con la CLI de Firebase.
- Se usa **Netlify** como hosting, con **deploy continuo desde Git**.

---

## 2. Build

- Script: **`npm run build`** → `tsc -b && vite build`.
- Genera la carpeta **`dist/`** lista para servir.
- El build incluye el **Service Worker (PWA)** generado por `vite-plugin-pwa`.

---

## 3. Configuración efectiva: Netlify (`netlify.toml`)

```
[build]
  command = "npm run build"
  publish = "dist"
```

### Redirects (SPA)
- Se redirige **`/*` → `/index.html`** con status 200, de modo que el **routing del lado del cliente** (React Router) funcione al recargar cualquier ruta (p. ej. `/historial`).

### Headers / caché
- **`/assets/*`**, **`*.js`** y **`*.css`**: `Cache-Control: public, max-age=31536000, immutable` (cacheo de largo plazo de archivos con hash).
- **`/index.html`**: `Cache-Control: no-cache` (siempre se revalida para obtener la última versión de la app).

---

## 4. Configuración de Firebase (`firebase.json`)

- Solo se despliegan las **reglas** (`firestore.rules`) y los **índices** (`firestore.indexes.json`) de Firestore.
- Deploy: `firebase deploy --only firestore:rules` (y `:indexes` cuando cambian).

---

## 5. Variables de entorno

- Las credenciales de Firebase se leen de variables `import.meta.env.VITE_*` en `src/services/firebase.ts`.
- Se definen en el archivo `.env` local y como **variables de entorno en Netlify** (producción) (no se suben al repo).

| Variable | Valor |
|---|---|
| `VITE_FIREBASE_API_KEY` | API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

> `.env.example` documenta las variables requeridas; `.env` no se versiona.

---

## 6. Flujo de deploy

1. `npm run build` (genera `dist/`).
2. Netlify publica `dist/` con los redirects y headers configurados.
3. Si cambian las reglas/índices de Firestore, se despliegan con la CLI de Firebase.
4. Verificación post-deploy: HTTPS activo, login de prueba, sincronización online/offline y comportamiento en móvil.

> Nota: la documentación original de despliegue recomendaba **Firebase Hosting**, pero la **implementación efectiva** en el repo usa **Netlify** (con `netlify.toml`). Ambos son válidos para una SPA estática.

---

## 7. Tiempo estimado por tarea

| Tarea | Cuándo | Tiempo estimado |
|---|---|---|
| Configurar Netlify (`netlify.toml`): build, publish, redirects | Semana 5 | ~2 h |
| Headers de caché (assets inmutables, index no-cache) | Semana 5 | ~1 h |
| Configurar variables de entorno de Firebase | Semana 5 | ~1 h |
| Despliegue de reglas/índices de Firestore | Semana 2 | ~1 h |
| Verificación post-deploy (HTTPS, login, offline, móvil) | Semana 5 | ~2 h |
| **Total aproximado** | - | **~0.5-1 día** |

---

## 8. Pendientes y observaciones

- Configurar **deploy continuo automático** desde la rama `main` de Git (Netlify lo soporta).
- Considerar rama de **preview** por PR antes de producción.
- Verificar el **Service Worker** (auto-update) en el dominio final de Netlify.
