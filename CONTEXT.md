# LiFELiNE - Contexto del Proyecto

## 📋 Información Global
- **Nombre**: LiFELiNE
- **Tipo**: Progressive Web App (PWA) de gestión de plazos y tareas.
- **Objetivo**: Ayudar a los usuarios a gestionar sus fechas límite, tareas y enfoque de manera visual y eficiente.
- **Estado Actual**: PWA desplegada en GitHub Pages. Arquitectura Híbrida (Local vs Cloud) funcional y verificada.

## 🛠 Tech Stack
- **Core**: React 18, TypeScript, Vite.
- **Estilos**: Tailwind CSS, CSS Modules (App.css, index.css).
- **UI Components**: Shadcn/ui (basado en Radix UI), Lucide React (iconos).
- **Animación**: Framer Motion.
- **Estado/Data**: TanStack Query (React Query), Context API.
- **Routing**: React Router DOM v6.
- **Backend/BaaS**: Supabase (`qohehkmfsyhgucwaqqev`).
- **PWA**: vite-plugin-pwa, manifest estático en `public/`.
- **Validación**: Zod, React Hook Form.
- **Utils**: date-fns, clsx, tailwind-merge.

## 📂 Estructura del Proyecto
- `src/pages`: Vistas principales (Home, Auth, Calendar, Focus, etc.).
- `src/components`: Componentes reutilizables.
  - `ui`: Componentes base de shadcn/ui.
  - `layout`: Layout principal de la app (AppLayout).
  - `pwa`: Componentes específicos de PWA (Splash components).
- `src/hooks`: Hooks personalizados (`useAuth`, `useDeadlines` [Pivot], `useLocalDeadlines`, `useCloudDeadlines`).
- `src/providers`: `AuthProvider` (Manejo de estado global de auth y modo híbrido).
- `src/integrations`: Integraciones externas (Supabase).
- `public`: Assets estáticos + manifest.webmanifest.
- `.github/workflows`: GitHub Actions para deploy a GH Pages.

## 🌐 Producción
- **URL**: https://imlegendco55.github.io/LiFELiNE/
- **Deploy**: GitHub Actions (automático en push a main)
- **Supabase**: Proyecto `qohehkmfsyhgucwaqqev`

## 🐛 Defectos Pendientes
- [x] **Modo Nube**: Corregido error de UUID en categorías (Auto-seeding implementado).
- [x] Error de consola: `<line> attribute x1/x2` (Corregido deshabilitando cursor en charts).

## 🚀 Next Steps
- [x] Debuggear modo Nube (crear usuario, crear deadlines).
- [x] Revisar error de atributos SVG en gráficos.
- [ ] Pulir UI/UX (Animaciones, transiciones).

## 📜 Reglas de Desarrollo (User Rules)
1. **Modo Flow**: Respuestas concisas. Edición directa de archivos.
2. **Scope**: Enfoque MVP. Iterar rápido.
3. **Rendimiento**: Optimizado para Desktop i5-2500k y Android gama media.
4. **Documentación**: `CONTEXT.md` es la fuente de la verdad.
