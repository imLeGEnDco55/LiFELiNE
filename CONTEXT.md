# LiFELiNE - Contexto del Proyecto

## 📋 Información Global
- **Nombre**: LiFELiNE
- **Tipo**: Progressive Web App (PWA) de gestión de plazos y tareas.
- **Objetivo**: Ayudar a los usuarios a gestionar sus fechas límite, tareas y enfoque de manera visual y eficiente.
- **Estado Actual**: Desarrollo activo. Arquitectura Híbrida (Local vs Cloud). Autenticación implementada con soporte dual.

## 🛠 Tech Stack
- **Core**: React 18, TypeScript, Vite.
- **Estilos**: Tailwind CSS, CSS Modules (App.css, index.css).
- **UI Components**: Shadcn/ui (basado en Radix UI), Lucide React (iconos).
- **Animación**: Framer Motion.
- **Estado/Data**: TanStack Query (React Query), Zustand (posible, a confirmar), Context API.
- **Routing**: React Router DOM v6.
- **Backend/Baas**: Supabase (integrado, configuración en `src/integrations/supabase`).
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
- `src/lib`: Utilidades de librería (utils.ts).
- `public`: Assets estáticos.

## 📜 Reglas de Desarrollo (User Rules)
1. **Modo Flow**: Tú eres el arquitecto/realizador. El usuario define el "QUÉ", tú el "CÓMO".
2. **Abstracción**: Respuestas concisas ("✅ Listo"). No explicar código salvo petición.
3. **Archivos**: Edición directa. Gestión de Git autónoma (preparar commits).
4. **Scope**: Enfoque MVP. Iterar rápido. Evitar over-engineering.
5. **Documentación**: `CONTEXT.md` es la fuente de la verdad. Mantener actualizado.
6. **Rendimiento**: Optimizado para Desktop i5-2500k y Android gama media.
7. **Diseño**: "Premium", visualmente impactante. Usar `generate_image` si se necesitan assets nuevos, o buscar en `assets/`.

## 🚀 Next Steps
- [ ] Completar documentación (README.md, AGENTS.md).
- [ ] Verificar integración con Supabase vs Auth Local.
- [ ] Pulir UI/UX (Animaciones, transiciones).
- [ ] Verificar funcionalidad PWA (Service Workers, Manifest).
