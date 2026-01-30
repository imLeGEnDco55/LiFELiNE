import { Deadline, Subtask, FocusSession, Category, DEFAULT_CATEGORIES } from '@/types/deadline';
import { addDays, addHours, subHours } from 'date-fns';

const MOCK_USER_ID = 'local-test-user';

export function generateDummyData() {
  const now = new Date();
  
  // Categories - use defaults
  const categories: Category[] = [...DEFAULT_CATEGORIES];
  
  // Generate deadlines spread across the next 7 days
  const deadlines: Deadline[] = [
    {
      id: 'demo-1',
      user_id: MOCK_USER_ID,
      title: 'Entregar diseño de landing page',
      description: 'Diseño completo en Figma con responsive y dark mode',
      deadline_at: addHours(now, 6).toISOString(),
      priority: 'high',
      category_id: 'design',
      parent_id: null,
      created_at: subHours(now, 48).toISOString(),
      updated_at: subHours(now, 24).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-2',
      user_id: MOCK_USER_ID,
      title: 'Implementar autenticación OAuth',
      description: 'Integrar login con Google y GitHub',
      deadline_at: addDays(now, 2).toISOString(),
      priority: 'high',
      category_id: 'programming',
      parent_id: null,
      created_at: subHours(now, 72).toISOString(),
      updated_at: subHours(now, 12).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-3',
      user_id: MOCK_USER_ID,
      title: 'Revisar propuesta de campaña',
      description: 'Análisis de métricas y ajuste de copy',
      deadline_at: addDays(now, 3).toISOString(),
      priority: 'medium',
      category_id: 'marketing',
      parent_id: null,
      created_at: subHours(now, 96).toISOString(),
      updated_at: subHours(now, 48).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-4',
      user_id: MOCK_USER_ID,
      title: 'Cita con el dentista',
      description: 'Limpieza semestral',
      deadline_at: addDays(now, 5).toISOString(),
      priority: 'low',
      category_id: 'personal',
      parent_id: null,
      created_at: subHours(now, 120).toISOString(),
      updated_at: subHours(now, 120).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-5',
      user_id: MOCK_USER_ID,
      title: 'Presentación trimestral',
      description: 'Informe de resultados Q4',
      deadline_at: addDays(now, 7).toISOString(),
      priority: 'high',
      category_id: 'work',
      parent_id: null,
      created_at: subHours(now, 168).toISOString(),
      updated_at: subHours(now, 24).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-6',
      user_id: MOCK_USER_ID,
      title: 'Actualizar portfolio',
      description: 'Añadir últimos 3 proyectos',
      deadline_at: addDays(now, 4).toISOString(),
      priority: 'medium',
      category_id: 'design',
      parent_id: null,
      created_at: subHours(now, 200).toISOString(),
      updated_at: subHours(now, 72).toISOString(),
      completed_at: null,
    },
    {
      id: 'demo-7',
      user_id: MOCK_USER_ID,
      title: 'Configurar CI/CD pipeline',
      description: 'GitHub Actions con deploy automático',
      deadline_at: subHours(now, 24).toISOString(),
      priority: 'high',
      category_id: 'programming',
      parent_id: null,
      created_at: subHours(now, 240).toISOString(),
      updated_at: subHours(now, 12).toISOString(),
      completed_at: subHours(now, 12).toISOString(),
    },
  ];

  // Subtasks for each deadline (without due_at - if needs date, convert to deadline)
  const subtasks: Subtask[] = [
    // Subtasks for demo-1 (Landing page)
    { id: 'sub-1-1', deadline_id: 'demo-1', user_id: MOCK_USER_ID, title: 'Wireframes móvil', completed: true, order_index: 0, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-1-2', deadline_id: 'demo-1', user_id: MOCK_USER_ID, title: 'Wireframes desktop', completed: true, order_index: 1, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-1-3', deadline_id: 'demo-1', user_id: MOCK_USER_ID, title: 'Diseño visual hero', completed: false, order_index: 2, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-1-4', deadline_id: 'demo-1', user_id: MOCK_USER_ID, title: 'Sección features', completed: false, order_index: 3, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-1-5', deadline_id: 'demo-1', user_id: MOCK_USER_ID, title: 'Footer y CTA final', completed: false, order_index: 4, created_at: now.toISOString(), updated_at: now.toISOString() },

    // Subtasks for demo-2 (OAuth)
    { id: 'sub-2-1', deadline_id: 'demo-2', user_id: MOCK_USER_ID, title: 'Configurar Google Cloud', completed: true, order_index: 0, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-2-2', deadline_id: 'demo-2', user_id: MOCK_USER_ID, title: 'Configurar GitHub OAuth App', completed: false, order_index: 1, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-2-3', deadline_id: 'demo-2', user_id: MOCK_USER_ID, title: 'Implementar flujo de login', completed: false, order_index: 2, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-2-4', deadline_id: 'demo-2', user_id: MOCK_USER_ID, title: 'Testing end-to-end', completed: false, order_index: 3, created_at: now.toISOString(), updated_at: now.toISOString() },

    // Subtasks for demo-3 (Campaign)
    { id: 'sub-3-1', deadline_id: 'demo-3', user_id: MOCK_USER_ID, title: 'Revisar métricas actuales', completed: true, order_index: 0, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-3-2', deadline_id: 'demo-3', user_id: MOCK_USER_ID, title: 'Propuesta de ajustes', completed: false, order_index: 1, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-3-3', deadline_id: 'demo-3', user_id: MOCK_USER_ID, title: 'Aprobación del cliente', completed: false, order_index: 2, created_at: now.toISOString(), updated_at: now.toISOString() },

    // Subtasks for demo-5 (Presentation)
    { id: 'sub-5-1', deadline_id: 'demo-5', user_id: MOCK_USER_ID, title: 'Recopilar datos de ventas', completed: false, order_index: 0, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-5-2', deadline_id: 'demo-5', user_id: MOCK_USER_ID, title: 'Crear gráficos', completed: false, order_index: 1, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-5-3', deadline_id: 'demo-5', user_id: MOCK_USER_ID, title: 'Diseñar slides', completed: false, order_index: 2, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-5-4', deadline_id: 'demo-5', user_id: MOCK_USER_ID, title: 'Ensayo presentación', completed: false, order_index: 3, created_at: now.toISOString(), updated_at: now.toISOString() },

    // Subtasks for demo-6 (Portfolio)
    { id: 'sub-6-1', deadline_id: 'demo-6', user_id: MOCK_USER_ID, title: 'Screenshots de proyectos', completed: true, order_index: 0, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-6-2', deadline_id: 'demo-6', user_id: MOCK_USER_ID, title: 'Escribir case studies', completed: false, order_index: 1, created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'sub-6-3', deadline_id: 'demo-6', user_id: MOCK_USER_ID, title: 'Actualizar bio', completed: false, order_index: 2, created_at: now.toISOString(), updated_at: now.toISOString() },
  ];

  // Focus sessions - some completed today and this week
  const focusSessions: FocusSession[] = [
    // Today's sessions
    { id: 'focus-1', user_id: MOCK_USER_ID, deadline_id: 'demo-1', duration_minutes: 25, started_at: subHours(now, 3).toISOString(), completed_at: subHours(now, 2.5).toISOString(), session_type: 'work' },
    { id: 'focus-2', user_id: MOCK_USER_ID, deadline_id: 'demo-1', duration_minutes: 5, started_at: subHours(now, 2.5).toISOString(), completed_at: subHours(now, 2.4).toISOString(), session_type: 'short_break' },
    { id: 'focus-3', user_id: MOCK_USER_ID, deadline_id: 'demo-1', duration_minutes: 25, started_at: subHours(now, 2.4).toISOString(), completed_at: subHours(now, 2).toISOString(), session_type: 'work' },
    { id: 'focus-4', user_id: MOCK_USER_ID, deadline_id: 'demo-2', duration_minutes: 25, started_at: subHours(now, 1).toISOString(), completed_at: subHours(now, 0.5).toISOString(), session_type: 'work' },
    
    // Yesterday's sessions
    { id: 'focus-5', user_id: MOCK_USER_ID, deadline_id: 'demo-7', duration_minutes: 25, started_at: subHours(now, 26).toISOString(), completed_at: subHours(now, 25.5).toISOString(), session_type: 'work' },
    { id: 'focus-6', user_id: MOCK_USER_ID, deadline_id: 'demo-7', duration_minutes: 25, started_at: subHours(now, 25).toISOString(), completed_at: subHours(now, 24.5).toISOString(), session_type: 'work' },
    { id: 'focus-7', user_id: MOCK_USER_ID, deadline_id: 'demo-2', duration_minutes: 25, started_at: subHours(now, 28).toISOString(), completed_at: subHours(now, 27.5).toISOString(), session_type: 'work' },

    // Earlier this week
    { id: 'focus-8', user_id: MOCK_USER_ID, deadline_id: 'demo-3', duration_minutes: 25, started_at: subHours(now, 72).toISOString(), completed_at: subHours(now, 71.5).toISOString(), session_type: 'work' },
    { id: 'focus-9', user_id: MOCK_USER_ID, deadline_id: 'demo-6', duration_minutes: 25, started_at: subHours(now, 96).toISOString(), completed_at: subHours(now, 95.5).toISOString(), session_type: 'work' },
    { id: 'focus-10', user_id: MOCK_USER_ID, deadline_id: 'demo-6', duration_minutes: 25, started_at: subHours(now, 95).toISOString(), completed_at: subHours(now, 94.5).toISOString(), session_type: 'work' },
  ];

  return { deadlines, subtasks, categories, focusSessions };
}

export function loadDummyData() {
  const { deadlines, subtasks, categories, focusSessions } = generateDummyData();
  
  localStorage.setItem('deadliner-deadlines', JSON.stringify(deadlines));
  localStorage.setItem('deadliner-subtasks', JSON.stringify(subtasks));
  localStorage.setItem('deadliner-categories', JSON.stringify(categories));
  localStorage.setItem('deadliner-focus-sessions', JSON.stringify(focusSessions));
}

export function clearAllData() {
  localStorage.removeItem('deadliner-deadlines');
  localStorage.removeItem('deadliner-subtasks');
  localStorage.removeItem('deadliner-categories');
  localStorage.removeItem('deadliner-focus-sessions');
}
