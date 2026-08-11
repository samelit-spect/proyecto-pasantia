# 09 - Setup de Firebase

## 1. Crear proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre: `sipnam-proyecto` (o el que se defina)
4. Desactivar Google Analytics (no se necesita para MVP)
5. Click en "Crear proyecto"

## 2. Crear aplicaciones web

1. En el dashboard del proyecto, click en el ícono de web `</>`
2. Nombre de la app: `sipnam-web`
3. Marcar "Configurar Firebase Hosting" (opcional, para después)
4. Copiar el objeto de configuración

## 3. Habilitar servicios

### 3.1 Authentication
1. Ir a Build → Authentication
2. Click en "Get started"
3. Habilitar el método "Email/Password"
4. Ir a la pestaña "Users" para crear usuarios de prueba

### 3.2 Firestore Database
1. Ir a Build → Firestore Database
2. Click en "Create database"
3. Seleccionar "Start in test mode" (para desarrollo)
4. Elegir ubicación (usar la más cercana al usuario)
5. Ir a la pestaña "Rules" y pegar las reglas de `05_base_datos.md`

> **Nota:** no se usa Firebase Storage. Las fotos se guardan comprimidas como base64 dentro de Firestore (`dataUrl` / `fotoDataUrl`).

## 4. Variables de entorno

Crear el archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**IMPORTANTE:** Agregar `.env` al `.gitignore` para no subir credenciales al repositorio.

Crear también `.env.example` como referencia:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 5. Instalar SDK

```bash
npm install firebase
```

## 6. Inicializar Firebase

Crear el archivo `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 7. Reglas de Firestore (copia rápida)

Pegar en Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /escuelas/{schoolId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /asistencias/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    match /novedades/{newsId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    match /incidentes/{incidentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

## 8. Crear datos de prueba

### 8.1 Escuelas (Firestore Console)
```
colección: escuelas
documento: {nombre: "Escuela N° 123", turno: "mañana", activa: true}
documento: {nombre: "Escuela N° 456", turno: "tarde", activa: true}
```

### 8.2 Usuarios (Authentication + Firestore)
1. Crear usuario en Authentication (email/password)
2. Crear documento en Firestore `usuarios/{uid}` con rol y escuela

## 9. Verificar funcionamiento

1. Ejecutar `npm run dev`
2. Ir a la aplicación
3. Intentar login con el usuario de prueba
4. Verificar que el rol se carga correctamente
5. Probar el formulario de asistencia
