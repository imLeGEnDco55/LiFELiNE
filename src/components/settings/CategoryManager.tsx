import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeadlines } from '@/hooks/useDeadlines';
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

export function CategoryManager() {
  const { categories, createCategory, deleteCategory } = useDeadlines();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showForm, setShowForm] = useState(false);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Categorías</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva
        </Button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 p-4 bg-secondary/50 rounded-xl"
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

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay categorías
          </p>
        ) : (
          categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteCategory(category.id, category.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
