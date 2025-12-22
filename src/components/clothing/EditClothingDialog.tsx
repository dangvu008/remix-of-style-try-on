import { useState, useRef, KeyboardEvent } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClothingItem } from '@/types/clothing';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditClothingDialogProps {
  item: ClothingItem;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; tags: string[] }) => Promise<boolean>;
}

const SUGGESTED_TAGS = [
  'công sở', 'đi chơi', 'thể thao', 'dự tiệc', 'hàng ngày', 
  'mùa hè', 'mùa đông', 'vintage', 'casual', 'formal'
];

export const EditClothingDialog = ({ 
  item, 
  isOpen, 
  isSaving,
  onClose, 
  onSave 
}: EditClothingDialogProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState(item.name);
  const [tags, setTags] = useState<string[]>(item.tags || []);
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = async () => {
    const success = await onSave(item.id, { name: name.trim() || item.name, tags });
    if (success) {
      onClose();
    }
  };

  const availableSuggestions = SUGGESTED_TAGS.filter(s => !tags.includes(s));

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl max-w-sm w-full shadow-medium overflow-hidden">
        {/* Header with image */}
        <div className="relative h-32 bg-muted flex items-center justify-center">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="h-full w-auto object-contain"
          />
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('clothing_name')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={item.name}
              className="h-10"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Tag size={14} />
              {t('clothing_tags')}
            </label>
            
            {/* Current tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 hover:bg-muted rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Tag input */}
            <Input
              ref={inputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('clothing_tags_hint')}
              className="h-9 text-sm"
            />

            {/* Suggested tags */}
            {availableSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t('suggested_tags')}</span>
                <div className="flex flex-wrap gap-1">
                  {availableSuggestions.slice(0, 6).map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleAddTag(suggestion)}
                      className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
