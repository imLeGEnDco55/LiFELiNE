import { bench, describe } from 'vitest';

// Simulate data
interface Deadline {
  id: string;
  parent_id: string | null;
}

const generateDeadlines = (count: number, childProbability: number) => {
  const deadlines: Deadline[] = [];
  for (let i = 0; i < count; i++) {
    const id = `deadline-${i}`;
    // Assign parent roughly based on probability, pointing to a previous deadline
    const parent_id = i > 0 && Math.random() < childProbability
      ? `deadline-${Math.floor(Math.random() * i)}`
      : null;
    deadlines.push({ id, parent_id });
  }
  return deadlines;
};

// Simulate a realistic load.
// If users have hundreds of deadlines, 1000 is a good upper bound test.
const COUNT = 1000;
const allDeadlines = generateDeadlines(COUNT, 0.3);
const deadlines = [...allDeadlines];

describe('DeadlinesList Children Count', () => {

  bench('current_implementation (O(N*M))', () => {
     // The current implementation defines this function
     const getChildrenCount = (deadlineId: string) => {
        return allDeadlines.filter(d => d.parent_id === deadlineId).length;
     };

     // And calls it inside a map/loop
     deadlines.forEach(deadline => {
        getChildrenCount(deadline.id);
     });
  });

  bench('optimized_implementation (O(M) + O(N))', () => {
    // The optimized implementation pre-calculates the map
    const counts: Record<string, number> = {};
    allDeadlines.forEach(d => {
        if (d.parent_id) {
            counts[d.parent_id] = (counts[d.parent_id] || 0) + 1;
        }
    });

    // And does a lookup inside the map/loop
    deadlines.forEach(deadline => {
        const count = counts[deadline.id] || 0;
    });
  });
});
