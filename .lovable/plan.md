
# 📱 Deadliner - Tu App de Cuenta Regresiva para Metas

Una aplicación móvil-first que transforma tus deadlines en countdowns visuales impactantes, manteniéndote enfocado y motivado hasta el último segundo.

---

## 🎨 Estilo Visual
- **Tema oscuro premium** con fondo azul muy oscuro (#0A0E1A)
- **Acentos vibrantes**: azul eléctrico para progreso, rojo/amarillo para urgencia, verde para completados
- **Tipografía bold** para los números del countdown
- **Animaciones fluidas** en los timers y transiciones
- **Tarjetas con borde lateral** de color según prioridad

---

## 🏠 Pantalla Principal (Home)
- **Header** con fecha actual, saludo personalizado y botón "+" para nuevo deadline
- **Filtros rápidos**: Todo, Urgente, Esta Semana, Más Tarde
- **Lista de Deadlines** como tarjetas con:
  - Nombre de la tarea
  - Countdown grande (días : horas : minutos)
  - Barra de progreso con porcentaje
  - Indicador de estado (INMEDIATO, ADVERTENCIA, EN CURSO)
  - Borde izquierdo de color según urgencia

---

## ➕ Crear Nuevo Deadline
- Campo para nombre/misión
- Selector de fecha: Hoy, Mañana, Personalizado (calendario)
- Selector de hora
- Prioridad: Baja, Media, Alta
- Botón "Iniciar Countdown"

---

## 📋 Vista de Detalle del Proyecto
- **Círculo de progreso grande** con tiempo restante
- Fecha y hora límite visible
- Estadísticas: % transcurrido, subtareas completadas
- **Roadmap de subtareas**:
  - Checkboxes para marcar completadas
  - Descripción y fecha límite de cada subtarea
  - Indicadores visuales (completado, pendiente, vence pronto)
- Botón destacado: "Siguiente: [subtarea más urgente]"

---

## ⏱️ Modo Focus (Pomodoro)
- Timer circular grande con minutos/segundos restantes
- Nombre de la tarea actual y tiempo hasta el deadline
- Botones: Pausar/Reanudar, Saltar descanso
- Indicador de sesiones diarias completadas
- Modo minimalista para concentración máxima

---

## 📅 Vista Calendario
- Calendario mensual con deadlines marcados
- Al tocar un día, muestra las tareas de ese día
- Navegación entre meses

---

## ⚙️ Configuración
- Perfil de usuario
- Cerrar sesión
- Preferencias de notificaciones (futuro)

---

## 🔐 Backend (Lovable Cloud + Supabase)
- **Autenticación**: Email/contraseña y Google
- **Base de datos**: Deadlines, subtareas, sesiones de focus
- **Sincronización**: Datos accesibles desde cualquier dispositivo

---

## 📲 Navegación
Barra inferior con 4 tabs:
1. **Home** - Lista de deadlines
2. **Calendario** - Vista mensual
3. **Tasks** - Gestión de subtareas
4. **Settings** - Configuración

