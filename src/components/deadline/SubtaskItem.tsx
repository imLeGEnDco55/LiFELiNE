import { useState, memo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Trash2, Target } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLongPress } from '@/hooks/useLongPress';
import { Subtask } from '@/types/deadline';
import { cn } from '@/lib/utils';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
  onConvertToDeadline: () => void;
}

// Memoized to prevent re-renders during drag
export const SubtaskItem = memo(function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
  onConvertToDeadline
}: SubtaskItemProps) {
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const { isPressed, handlers } = useLongPress({
    onLongPress: () => setShowConvertDialog(true),
    delay: 600,
  });

  return (
    <>
      <Reorder.Item
        value={subtask}
        layoutId={subtask.id}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing transition-colors",
          subtask.completed && "opacity-60",
          isPressed && "scale-[0.98] bg-accent/50 border-primary/50"
        )}
        {...handlers}
        // Reduce layout animation overhead
        layout="position"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        <Checkbox
          checked={subtask.completed}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
        <span className={cn(
          "flex-1",
          subtask.completed && "line-through text-muted-foreground"
        )}>
          {subtask.title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </Reorder.Item>

      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Convertir a Deadline
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Convertir "{subtask.title}" en un deadline anidado?
              Esto te permitirá agregar sus propias subtareas y mantenerlo como parte del deadline padre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConvertToDeadline}
              className="gradient-primary"
            >
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
