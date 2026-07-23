# 10 - Configuración del Proyecto

## 1. Requisitos previos

| Herramienta | Versión mínima | Versión recomendada |
|---|---|---|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.x | Última versión |

## 2. Clonar el repositorio

```bash
git clone https://github.com/usuario/sipnam-proyecto.git
cd sipnam-proyecto
```

## 3. Instalar dependencias

```bash
npm install
```

Esto instalará:
- React 19 + React DOM
- React Router v7
- Firebase SDK
- Vite 8
- TypeScript 6
- ESLint + Prettier

## 4. Configurar variables de entorno

1. Copiar el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Completar las variables en `.env` con los valores de Firebase Console.
   Ver `09_setup_firebase.md` para más detalles.

## 5. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 6. Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y empaqueta para producción |
| `npm run lint` | Ejecuta ESLint en todo el proyecto |
| `npm run preview` | Vista previa de la build de producción |

## 7. Estructura de configuración

### 7.1 TypeScript

- `tsconfig.json` — Configuración raíz (project references)
- `tsconfig.app.json` — Configuración del código de la app (src/)
- `tsconfig.node.json` — Configuración de herramientas (vite.config.ts)

### 7.2 Vite

- `vite.config.ts` — Plugin de React + alias `@/` → `./src`

### 7.3 ESLint

- `eslint.config.js` — Flat config con TypeScript + React Hooks + Prettier

### 7.4 Prettier

- `.prettierrc` — Formato: single quotes, trailing comma es5, printWidth 100
- `.prettierignore` — Ignora node_modules, dist, coverage

## 8. Solución de problemas

### Error: "Cannot find module '@/'"
Verificar que `vite.config.ts` y `tsconfig.app.json` tengan el alias configurado.

### Error: "Firebase: No Firebase App"
Verificar que `.env` esté completo y que `firebase.ts` esté inicializado.

### Error: "Invalid login credentials"
Verificar que el usuario exista en Firebase Authentication y en la colección `usuarios` de Firestore.

### Error: TypeScript no detecta cambios
Reiniciar el servidor de desarrollo (`Ctrl + C` y `npm run dev`).

## 9. Extensionses recomendadas (VS Code)

| Extensión | Propósito |
|---|---|
| ESLint | Análisis estático en tiempo real |
| Prettier | Formateo automático al guardar |
| Firebase | Explorar Firestore y Authentication |
| Tailwind CSS IntelliSense | Autocompletado de clases (si se usa Tailwind en el futuro) |
| Error Lens | Errores inline en el editor |
