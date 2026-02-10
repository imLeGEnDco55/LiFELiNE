import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Palette, GripVertical, ChevronRight, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeadlines } from '@/hooks/useDeadlines';
import { Category } from '@/types/deadline';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  'hsl(280, 100%, 70%)', // Purple
  'hsl(200, 100%, 60%)', // Blue
  'hsl(340, 100%, 65%)', // Pink
  'hsl(150, 80%, 50%)',  // Green
  'hsl(45, 100%, 55%)',  // Yellow
  'hsl(10, 100%, 60%)',  // Red/Orange
  'hsl(180, 70%, 50%)',  // Cyan
  'hsl(320, 80%, 60%)',  // Magenta
];

const COLOR_LABELS: Record<string, string> = {
  'hsl(280, 100%, 70%)': 'Púrpura',
  'hsl(200, 100%, 60%)': 'Azul',
  'hsl(340, 100%, 65%)': 'Rosa',
  'hsl(150, 80%, 50%)':  'Verde',
  'hsl(45, 100%, 55%)':  'Amarillo',
  'hsl(10, 100%, 60%)':  'Rojo',
  'hsl(180, 70%, 50%)':  'Cian',
  'hsl(320, 80%, 60%)':  'Magenta',
};

export function CategoryManager() {
  const { categories, createCategory, deleteCategory, reorderCategories } = useDeadlines();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Ingresa un nombre para la categoría');
      return;
    }
    if (name.length > 30) {
      toast.error('El nombre debe tener máximo 30 caracteres');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }

    createCategory({ name, color: selectedColor });
    setNewCategoryName('');
    setShowForm(false);
    toast.success('Categoría creada');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    deleteCategory(id);
    toast.success(`Categoría "${name}" eliminada`);
  };

  return (
    <div className="space-y-0">
      {/* Header - Collapsible trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className={cn(
          "w-full flex items-center gap-3 p-0 transition-colors",
          "hover:opacity-80"
        )}
      >
        <Tags className="w-5 h-5 text-primary" />
        <div className="flex-1 text-left">
          <h3 className="font-semibold">Categorías</h3>
          <p className="text-xs text-muted-foreground">
            {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview of category colors */}
          <div className="flex -space-x-1">
            {categories.slice(0, 4).map((cat) => (
              <span
                key={cat.id}
                className="w-4 h-4 rounded-full border-2 border-card"
                style={{ backgroundColor: cat.color }}
              />
            ))}
            {categories.length > 4 && (
              <span className="w-4 h-4 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] text-muted-foreground">
                +{categories.length - 4}
              </span>
            )}
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Add button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nueva Categoría
              </Button>

              {/* Add Category Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-4 bg-secondary/50 rounded-xl overflow-hidden"
                  >
                    <Input
                      placeholder="Nombre de la categoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      maxLength={30}
                      className="bg-card"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            aria-label={`Color ${COLOR_LABELS[color] || 'Personalizado'}`}
                            aria-pressed={selectedColor === color}
                            className={cn(
                              "w-8 h-8 rounded-full transition-all",
                              selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-white scale-110"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddCategory}
                        className="flex-1 gradient-primary"
                      >
                        Crear
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Categories List with Drag & Drop */}
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay categorías
                </p>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={categories} 
                  onReorder={(newOrder: Category[]) => reorderCategories(newOrder)}
                  className="space-y-2"
                >
                  {categories.map((category) => (
                    <Reorder.Item
                      key={category.id}
                      value={category}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span 
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            aria-label={`Eliminar categoría ${category.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar categoría</p>
                        </TooltipContent>
                      </Tooltip>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
