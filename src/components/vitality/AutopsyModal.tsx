import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Clock, ListTodo, AlertTriangle, Calendar, FileWarning } from 'lucide-react';
import { format, parseISO, differenceInHours, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Deadline, Subtask } from '@/types/deadline';
import { cn } from '@/lib/utils';

interface AutopsyModalProps {
  deadline: Deadline | null;
  subtasks: Subtask[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AutopsyFinding {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export function AutopsyModal({ deadline, subtasks, open, onOpenChange }: AutopsyModalProps) {
  if (!deadline) return null;

  const deadlineDate = parseISO(deadline.deadline_at);
  const createdDate = parseISO(deadline.created_at);
  const now = new Date();
  
  const hoursOverdue = differenceInHours(now, deadlineDate);
  const daysOverdue = differenceInDays(now, deadlineDate);
  const totalDaysGiven = differenceInDays(deadlineDate, createdDate);
  
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100)
    : 0;

  // Generate autopsy findings
  const findings: AutopsyFinding[] = [];

  // Time of death
  findings.push({
    icon: <Clock className="w-5 h-5" />,
    title: 'Hora de Expiración',
    description: format(deadlineDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es }),
    severity: 'info',
  });

  // Time since death
  if (daysOverdue > 0) {
    findings.push({
      icon: <Skull className="w-5 h-5" />,
      title: 'Tiempo Post-Mortem',
      description: daysOverdue === 1 
        ? `${hoursOverdue} horas sin atención`
        : `${daysOverdue} días abandonado`,
      severity: daysOverdue > 3 ? 'critical' : 'warning',
    });
  }

  // Subtask analysis
  if (totalSubtasks > 0) {
    if (completedSubtasks === 0) {
      findings.push({
        icon: <ListTodo className="w-5 h-5" />,
        title: 'Tratamiento No Iniciado',
        description: `${totalSubtasks} subtareas sin completar. El plan de acción nunca comenzó.`,
        severity: 'critical',
      });
    } else if (progressPercentage < 50) {
      findings.push({
        icon: <ListTodo className="w-5 h-5" />,
        title: 'Tratamiento Incompleto',
        description: `Solo ${progressPercentage}% completado (${completedSubtasks}/${totalSubtasks}). Abandono prematuro.`,
        severity: 'critical',
      });
    } else {
      findings.push({
        icon: <ListTodo className="w-5 h-5" />,
        title: 'Tratamiento Avanzado',
        description: `${progressPercentage}% completado. Casi lo logras (${completedSubtasks}/${totalSubtasks}).`,
        severity: 'warning',
      });
    }
  } else {
    findings.push({
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Sin Plan de Tratamiento',
      description: 'No se definieron subtareas. La falta de planificación contribuyó al fallo.',
      severity: 'warning',
    });
  }

  // Time allocation analysis
  if (totalDaysGiven <= 1) {
    findings.push({
      icon: <Calendar className="w-5 h-5" />,
      title: 'Plazo Insuficiente',
      description: `Solo ${totalDaysGiven === 0 ? 'horas' : '1 día'} de margen. Considera plazos más realistas.`,
      severity: 'warning',
    });
  } else if (totalDaysGiven > 7 && daysOverdue > 0) {
    findings.push({
      icon: <Calendar className="w-5 h-5" />,
      title: 'Procrastinación Detectada',
      description: `Tuviste ${totalDaysGiven} días para completarlo. El tiempo no fue el problema.`,
      severity: 'critical',
    });
  }

  // Priority analysis
  if (deadline.priority === 'high') {
    findings.push({
      icon: <FileWarning className="w-5 h-5" />,
      title: 'Alta Prioridad Ignorada',
      description: 'Este deadline estaba marcado como alta prioridad pero fue descuidado.',
      severity: 'critical',
    });
  }

  const severityColors = {
    info: 'border-info/30 bg-info/5 text-info',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    critical: 'border-urgent/30 bg-urgent/5 text-urgent',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-urgent/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-urgent">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Skull className="w-6 h-6" />
            </motion.div>
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                Reporte de Autopsia
              </span>
              Caso: {deadline.title}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ECG Flatline decoration */}
        <div className="relative h-8 overflow-hidden mb-4">
          <motion.svg 
            viewBox="0 0 200 20" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 0,10 L 200,10"
              fill="none"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, opacity: [1, 0.5, 1] }}
              transition={{ 
                pathLength: { duration: 1.5 },
                opacity: { duration: 2, repeat: Infinity }
              }}
            />
          </motion.svg>
        </div>

        {/* Findings */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Hallazgos del Análisis
          </h4>
          
          <AnimatePresence mode="popLayout">
            {findings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border",
                  severityColors[finding.severity]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {finding.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">{finding.title}</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {finding.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Conclusion */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
        >
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Conclusión Médica
          </h4>
          <p className="text-sm text-foreground">
            {getConclusionMessage(progressPercentage, daysOverdue, totalSubtasks)}
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function getConclusionMessage(progress: number, daysOverdue: number, hasSubtasks: number): string {
  if (progress === 0 && hasSubtasks > 0) {
    return "El paciente nunca recibió tratamiento. Para futuros casos, inicia las subtareas temprano y mantén un ritmo constante.";
  }
  if (progress > 75) {
    return "Estabas muy cerca. A veces un sprint final de enfoque puede salvar situaciones críticas. Considera usar sesiones Pomodoro intensivas.";
  }
  if (daysOverdue > 3) {
    return "El abandono prolongado sugiere pérdida de motivación. Revisa si este objetivo sigue siendo relevante o necesita replantarse.";
  }
  if (hasSubtasks === 0) {
    return "Sin subtareas definidas, es difícil medir el progreso. Divide tus próximos deadlines en pasos concretos y manejables.";
  }
  return "Cada fallo es información. Analiza qué obstáculos encontraste y ajusta tu estrategia para el próximo deadline.";
}
