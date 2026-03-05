import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Tag, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Deadline, Category } from '@/types/deadline';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditDeadlineModalProps {
  deadline: Deadline;
  parentDeadline: Deadline | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Deadline>) => void;
}

export function EditDeadlineModal({
  deadline,
  parentDeadline,
  categories,
  open,
  onOpenChange,
  onSave,
}: EditDeadlineModalProps) {
  const [title, setTitle] = useState(deadline.title);
  const [selectedDate, setSelectedDate] = useState<Date>(parseISO(deadline.deadline_at));
  const [selectedTime, setSelectedTime] = useState(format(parseISO(deadline.deadline_at), 'HH:mm'));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(deadline.category_id);

  // Reset form when deadline changes
  useEffect(() => {
    setTitle(deadline.title);
    setSelectedDate(parseISO(deadline.deadline_at));
    setSelectedTime(format(parseISO(deadline.deadline_at), 'HH:mm'));
    setSelectedCategory(deadline.category_id);
  }, [deadline]);

  const parentDeadlineDate = parentDeadline ? parseISO(parentDeadline.deadline_at) : null;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('El título no puede estar vacío');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const newDeadlineAt = new Date(selectedDate);
    newDeadlineAt.setHours(hours, minutes, 0, 0);

    // Validate against parent deadline
    if (parentDeadlineDate && isAfter(newDeadlineAt, parentDeadlineDate)) {
      toast.error('La fecha no puede superar la del deadline padre');
      return;
    }

    onSave({
      title: title.trim(),
      deadline_at: newDeadlineAt.toISOString(),
      category_id: selectedCategory,
    });

    onOpenChange(false);
    toast.success('Deadline actualizado');
  };

  // Disable dates after parent deadline
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) return true;
    if (parentDeadlineDate && isAfter(date, parentDeadlineDate)) return true;
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Deadline</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Parent constraint warning */}
          {parentDeadline && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Límite del padre</p>
                <p className="text-muted-foreground text-xs">
                  No puede superar: {format(parentDeadlineDate!, "d MMM yyyy, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-medium text-muted-foreground">Título</label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 bg-card"
              placeholder="Nombre del deadline"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoría
            </label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  "rounded-full",
                  selectedCategory === null && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedCategory(null)}
              >
                Sin categoría
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full gap-1.5"
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : undefined,
                    borderColor: category.color,
                    color: selectedCategory === category.id ? 'white' : undefined,
                    boxShadow: selectedCategory === category.id ? `0 0 12px ${category.color}40` : undefined,
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: selectedCategory === category.id ? 'white' : category.color }}
                  />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Fecha límite</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  disabled={isDateDisabled}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label htmlFor="edit-time" className="text-sm font-medium text-muted-foreground">Hora límite</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="pl-10 h-12 bg-card"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gradient-primary"
              onClick={handleSave}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
