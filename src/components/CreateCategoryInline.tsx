import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Category, CategoryId } from '@/types/expense';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = [
  '💼', '🎯', '🏋️', '✈️', '🎁', '💡', '🎨', '🐕', '🌱', '💊',
  '🎓', '🎪', '🍿', '🎵', '📷', '⚽', '🏖️', '☕', '🍺', '🎂',
  '💇', '🛒', '🔧', '📞', '💻', '🎮', '📺', '🚌', '⛽', '🏥'
];

interface CreateCategoryInlineProps {
  onCreateCategory: (category: Category) => Promise<void>;
  onCategoryCreated: (categoryId: CategoryId) => void;
  existingCategories: string[];
  isSelected?: boolean;
}

const CreateCategoryInline: React.FC<CreateCategoryInlineProps> = ({ 
  onCreateCategory, 
  onCategoryCreated,
  existingCategories,
  isSelected = false
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Ingresa un nombre para la categoría', variant: 'destructive' });
      return;
    }
    if (!selectedEmoji) {
      toast({ title: 'Error', description: 'Selecciona un emoji para la categoría', variant: 'destructive' });
      return;
    }

    // Generate a unique ID
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') as CategoryId;
    
    if (existingCategories.includes(id)) {
      toast({ title: 'Error', description: 'Ya existe una categoría con ese nombre', variant: 'destructive' });
      return;
    }

    const newCategory: Category = {
      id,
      name: name.trim(),
      icon: selectedEmoji,
      color: `hsl(${Math.floor(Math.random() * 360)} 70% 50%)`,
    };

    setIsCreating(true);
    try {
      await onCreateCategory(newCategory);
      // Auto-select the new category
      onCategoryCreated(id);
      setName('');
      setSelectedEmoji('');
      setIsOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 border-2 border-dashed",
            isSelected
              ? "bg-primary/20 border-primary"
              : "bg-secondary/30 border-primary/30 hover:border-primary/60 hover:bg-secondary/50"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium">Crear</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Nombre
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mascotas, Gym..."
              className="bg-secondary/50 border-border"
              maxLength={15}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Emoji
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-[150px] overflow-y-auto p-2 bg-secondary/30 rounded-lg">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    "text-xl p-2 rounded-lg transition-all duration-200 hover:scale-110",
                    selectedEmoji === emoji 
                      ? "bg-primary/20 ring-2 ring-primary scale-110" 
                      : "hover:bg-secondary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {(name || selectedEmoji) && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEmoji || '❓'}</span>
                <span className="font-semibold text-sm">{name || 'Nueva'}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleCreate} 
            className="w-full btn-primary"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Creando...' : 'Crear y Seleccionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryInline;