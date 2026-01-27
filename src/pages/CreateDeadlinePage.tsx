import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Flag, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDeadlines } from '@/hooks/useDeadlines';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Priority } from '@/types/deadline';

const quickDates = [
  { label: 'Hoy', getValue: () => new Date() },
  { label: 'Mañana', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
  { label: 'Esta Semana', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Baja', color: 'bg-success' },
  { value: 'medium', label: 'Media', color: 'bg-warning' },
  { value: 'high', label: 'Alta', color: 'bg-urgent' },
];

export function CreateDeadlinePage() {
  const navigate = useNavigate();
  const { createDeadline, categories } = useDeadlines();
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Ingresa un nombre para el deadline');
      return;
    }
    if (!selectedDate) {
      toast.error('Selecciona una fecha');
      return;
    }

    setIsSubmitting(true);

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const deadlineAt = new Date(selectedDate);
    deadlineAt.setHours(hours, minutes, 0, 0);

    try {
      createDeadline({
        title: title.trim(),
        description: null,
        deadline_at: deadlineAt.toISOString(),
        priority,
        category_id: selectedCategory,
      });

      toast.success('¡Deadline creado!');
      navigate('/');
    } catch (error) {
      toast.error('Error al crear el deadline');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Nuevo Deadline</h1>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            ¿Cuál es tu misión?
          </label>
          <Input
            placeholder="Ej: Entregar proyecto final"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg h-14 bg-card border-border"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categoría
          </label>
          <div className="flex gap-2 flex-wrap">
            <Button
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

        {/* Quick Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Fecha límite
          </label>
          <div className="flex gap-2">
            {quickDates.map(({ label, getValue }) => (
              <Button
                key={label}
                variant="secondary"
                size="sm"
                className={cn(
                  "flex-1 rounded-full",
                  selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(getValue(), 'yyyy-MM-dd') && 
                  "gradient-primary text-primary-foreground"
                )}
                onClick={() => setSelectedDate(getValue())}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {/* Custom Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Elegir fecha personalizada</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Hora límite
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
        </div>

        {/* Priority Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Prioridad
          </label>
          <div className="flex gap-2">
            {priorities.map(({ value, label, color }) => (
              <Button
                key={value}
                variant="secondary"
                className={cn(
                  "flex-1 h-12 relative overflow-hidden",
                  priority === value && "ring-2 ring-primary"
                )}
                onClick={() => setPriority(value)}
              >
                <span className={cn("w-2 h-2 rounded-full mr-2", color)} />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-14 text-lg font-semibold gradient-primary glow-primary"
          disabled={!title.trim() || !selectedDate || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Creando...' : 'Iniciar Countdown 🚀'}
        </Button>
      </motion.div>
    </div>
  );
}
