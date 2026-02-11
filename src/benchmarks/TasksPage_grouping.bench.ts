import { bench, describe } from 'vitest';

interface Subtask {
  id: string;
  deadline_id: string;
  completed: boolean;
  title: string;
}

interface Deadline {
  id: string;
  title: string;
}

interface SubtaskWithDeadline extends Subtask {
  deadline: Deadline;
}

// Data generation
const NUM_DEADLINES = 50;
const SUBTASKS_PER_DEADLINE = 20; // 1000 subtasks total

const deadlines: Deadline[] = Array.from({ length: NUM_DEADLINES }, (_, i) => ({
  id: `deadline-${i}`,
  title: `Deadline ${i}`,
}));

const deadlineMap = new Map(deadlines.map(d => [d.id, d]));

const subtasks: Subtask[] = [];
deadlines.forEach(d => {
  for (let i = 0; i < SUBTASKS_PER_DEADLINE; i++) {
    subtasks.push({
      id: `subtask-${d.id}-${i}`,
      deadline_id: d.id,
      completed: Math.random() > 0.5,
      title: `Subtask ${i}`,
    });
  }
});

// Original Implementation logic
function originalImplementation() {
  // 1. Group
  const grouped: Record<string, SubtaskWithDeadline[]> = {};
  subtasks.forEach(subtask => {
    const deadline = deadlineMap.get(subtask.deadline_id);
    if (deadline) {
      if (!grouped[subtask.deadline_id]) {
        grouped[subtask.deadline_id] = [];
      }
      grouped[subtask.deadline_id].push({ ...subtask, deadline });
    }
  });

  // 2. Pending list
  const pendingSubtasks = subtasks.filter(s => !s.completed && deadlineMap.has(s.deadline_id));

  // 3. Completed list
  const completedSubtasks = subtasks.filter(s => s.completed && deadlineMap.has(s.deadline_id));

  // 4. Render simulation (filtering pending)
  let renderCount = 0;
  Object.values(grouped).forEach(tasks => {
    const pendingTasks = tasks.filter((t) => !t.completed);
    if (pendingTasks.length > 0) {
      renderCount++;
    }
  });

  return { pendingSubtasks, completedSubtasks, renderCount };
}

// Optimized Implementation logic
function optimizedImplementation() {
  const groupedPending: Record<string, SubtaskWithDeadline[]> = {};
  let pendingCount = 0;
  const completedList: SubtaskWithDeadline[] = [];

  subtasks.forEach(subtask => {
    const deadline = deadlineMap.get(subtask.deadline_id);
    if (deadline) {
      const enriched = { ...subtask, deadline };
      if (subtask.completed) {
        completedList.push(enriched);
      } else {
        pendingCount++;
        if (!groupedPending[subtask.deadline_id]) {
          groupedPending[subtask.deadline_id] = [];
        }
        groupedPending[subtask.deadline_id].push(enriched);
      }
    }
  });

  // Render simulation (no filtering)
  let renderCount = 0;
  Object.values(groupedPending).forEach(tasks => {
     // tasks are already pending
    if (tasks.length > 0) {
      renderCount++;
    }
  });

  return { pendingCount, completedList, renderCount };
}

describe('TasksPage Grouping Logic', () => {
  bench('Original (Multiple passes + Render Filter)', () => {
    originalImplementation();
  });

  bench('Optimized (Single pass)', () => {
    optimizedImplementation();
  });
});
