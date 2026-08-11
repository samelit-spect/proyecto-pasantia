# 15 - Despliegue

## 1. Opciones de despliegue

| Plataforma | Coste | Configuración | Recomendada |
|---|---|---|---|
| **Firebase Hosting** | Gratis (plan spark) | Fácil, integrada con el resto de Firebase | Sí |
| Vercel | Gratis (plan hobby) | Fácil, auto-deploy desde Git | Sí |
| Netlify | Gratis (plan free) | Fácil, auto-deploy desde Git | No |
| GitHub Pages | Gratis | Manual, requiere config | No |

**Recomendación:** Firebase Hosting (ya se usa Firebase para el backend).

## 2. Despliegue con Firebase Hosting

### 2.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2.2 Login

```bash
firebase login
```

### 2.3 Inicializar Hosting

```bash
firebase init hosting
```

Seleccionar:
- Proyecto existente (el creado en `09_setup_firebase.md`)
- Directorio de distribución: `dist`
- Configurar como app web单页: `Sí`
- Sobreescribir `index.html`: `No`

### 2.4 firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 2.5 Build y deploy

```bash
npm run build
firebase deploy --only hosting
```

## 3. Despliegue con Vercel

### 3.1 Configurar vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.2 Deploy

1. Conectar repositorio de GitHub a Vercel
2. Configurar:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Auto-deploy en cada push a `main`

## 4. Variables de entorno en producción

Agregar las variables de Firebase en la plataforma de despliegue:

| Variable | Valor |
|---|---|
| `VITE_FIREBASE_API_KEY` | Tu API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Tu auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Tu project ID |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Tu sender ID |
| `VITE_FIREBASE_APP_ID` | Tu app ID |

## 5. Post-despliegue

1. Verificar que la app carga correctamente
2. Probar login con usuario de prueba
3. Verificar que Firestore funciona
4. Probar en móvil (responsive)
5. Verificar HTTPS activo
