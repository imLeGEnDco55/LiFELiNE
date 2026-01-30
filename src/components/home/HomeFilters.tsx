import { ChevronDown, FolderOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category } from '@/types/deadline';

type FilterType = 'all' | 'urgent' | 'week' | 'later';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'later', label: 'Más Tarde' },
];

interface HomeFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: Category[];
}

export function HomeFilters({
  filter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  categories,
}: HomeFiltersProps) {
  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const selectedFilterLabel = filterOptions.find(f => f.value === filter)?.label || 'Todo';

  return (
    <div className="flex gap-2 mb-4">
      {/* Category Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 flex-1 justify-between"
            style={{
              borderColor: selectedCategoryData?.color || undefined,
              color: selectedCategoryData?.color || undefined,
            }}
          >
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              {selectedCategoryData?.name || 'Todas'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Todas las categorías
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filter !== 'all' ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full gap-1.5 flex-1 justify-between ${filter !== 'all' ? 'gradient-primary' : ''}`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {selectedFilterLabel}
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {filterOptions.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setFilter(value)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export type { FilterType };
