import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Category, CategoryId } from '@/types/expense';

const EMOJI_OPTIONS = [
  '💼', '🎯', '🏋️', '✈️', '🎁', '💡', '🎨', '🐕', '🌱', '💊',
  '🎓', '🎪', '🍿', '🎵', '📷', '⚽', '🏖️', '☕', '🍺', '🎂',
  '💇', '🛒', '🔧', '📞', '💻', '🎮', '📺', '🚌', '⛽', '🏥'
];

interface CreateCategoryModalProps {
  onCreateCategory: (category: Category) => void;
  existingCategories: CategoryId[];
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ onCreateCategory, existingCategories }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleCreate = () => {
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

    onCreateCategory(newCategory);
    toast({ title: 'Éxito', description: `Categoría "${name}" creada correctamente` });
    setName('');
    setSelectedEmoji('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="category-card flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-primary/30 hover:border-primary/60">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <p className="font-semibold text-sm">Crear Categoría</p>
          <p className="text-xs text-muted-foreground">Personaliza tus gastos</p>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Nombre de la categoría
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mascotas, Gimnasio, etc."
              className="bg-secondary/50 border-border"
              maxLength={20}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Selecciona un emoji
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-2 bg-secondary/30 rounded-lg">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`
                    text-2xl p-2 rounded-lg transition-all duration-200 hover:scale-110
                    ${selectedEmoji === emoji 
                      ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                      : 'hover:bg-secondary'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {(name || selectedEmoji) && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedEmoji || '❓'}</span>
                <span className="font-semibold">{name || 'Nueva Categoría'}</span>
              </div>
            </div>
          )}

          <Button onClick={handleCreate} className="w-full btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Crear Categoría
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;