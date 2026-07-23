# 08 - Tareas Pendientes

> Este archivo se actualizará automáticamente al finalizar cada sección o tarea de desarrollo.
> Las tareas se agregarán aquí según lo indicado en `AGENTS.md`.

---

## Antes de empezar a codear

### Reemplazar credenciales de Firebase

1. Abrir **Firebase Console** → tu proyecto → **Project Settings** → **General** → **Your apps**
2. Copiar los valores y reemplazar en `.env`:

```
VITE_FIREBASE_API_KEY=reemplazar
VITE_FIREBASE_AUTH_DOMAIN=reemplazar
VITE_FIREBASE_PROJECT_ID=reemplazar
VITE_FIREBASE_STORAGE_BUCKET=reemplazar
VITE_FIREBASE_MESSAGING_SENDER_ID=reemplazar
VITE_FIREBASE_APP_ID=reemplazar
```

3. Habilitar **Authentication** → método **Email/Password** en Firebase Console
4. Habilitar **Firestore Database** en Firebase Console
5. Crear usuario de prueba en **Authentication** → **Users** → **Add user**

### Verificar que compila

```bash
npm run dev
```

Abrir `http://localhost:5173` y verificar que carga el login.

---

## Tareas futuras (post-MVP)

- [ ] Foto diaria de preceptores (vista independiente, vacía por ahora)
- [ ] Vista de docentes (futura)
- [ ] Code splitting para reducir bundle (Firebase pesa ~850KB)
