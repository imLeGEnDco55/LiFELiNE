import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useDeadlines } from '@/hooks/useDeadlines';
import { startOfWeek } from 'date-fns';
import { calculateChartData } from './chartUtils';

export function DailyActivityChart() {
  const { deadlines, focusSessions } = useDeadlines();

  const chartData = useMemo(() => {
    // Optimization: Calculate chart data in O(N+M) instead of O(7*(N+M))
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return calculateChartData(deadlines, focusSessions, weekStart);
  }, [deadlines, focusSessions]);

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.deadlines, d.focus)),
    1
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Actividad Diaria
      </h3>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis
              hide
              domain={[0, maxValue + 1]}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium capitalize">{data.fullDay}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.deadlines} deadline{data.deadlines !== 1 ? 's' : ''} • {data.focus} sesión{data.focus !== 1 ? 'es' : ''}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="deadlines"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="focus"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-success" />
          <span className="text-muted-foreground">Completados</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">Sesiones Focus</span>
        </div>
      </div>
    </div>
  );
}
