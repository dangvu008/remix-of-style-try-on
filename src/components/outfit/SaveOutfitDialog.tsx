import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ClothingItemForSave {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  purchaseUrl?: string;
}

interface SaveOutfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultImageUrl: string;
  clothingItems: ClothingItemForSave[];
  onSuccess?: () => void;
}

export const SaveOutfitDialog = ({
  open,
  onOpenChange,
  resultImageUrl,
  clothingItems,
  onSuccess,
}: SaveOutfitDialogProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemLinks, setItemLinks] = useState<Record<string, string>>(() => {
    const links: Record<string, string> = {};
    clothingItems.forEach(item => {
      links[item.id] = item.purchaseUrl || '';
    });
    return links;
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error(t('login'));
      return;
    }

    if (!name.trim()) {
      toast.error(t('save_outfit_name_required'));
      return;
    }

    setIsSaving(true);

    try {
      // Prepare clothing items with purchase links
      const itemsWithLinks = clothingItems.map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.category,
        purchaseUrl: itemLinks[item.id] || null,
      }));

      // Save to user_collections as a private outfit collection
      const { error } = await supabase.from('user_collections').insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        cover_image_url: resultImageUrl,
        items: itemsWithLinks,
      });

      if (error) throw error;

      toast.success(t('save_outfit_success'));
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast.error(t('save_outfit_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateItemLink = (itemId: string, link: string) => {
    setItemLinks(prev => ({ ...prev, [itemId]: link }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('save_outfit_title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="aspect-[3/4] max-h-48 mx-auto rounded-lg overflow-hidden bg-secondary">
            <img
              src={resultImageUrl}
              alt="Outfit preview"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="outfit-name">{t('save_outfit_name')}</Label>
            <Input
              id="outfit-name"
              placeholder={t('save_outfit_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="outfit-desc">{t('save_outfit_desc')}</Label>
            <Textarea
              id="outfit-desc"
              placeholder={t('save_outfit_desc_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Clothing items with purchase links */}
          {clothingItems.length > 0 && (
            <div className="space-y-3">
              <Label>{t('save_outfit_links')}</Label>
              <div className="space-y-2">
                {clothingItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                      <div className="relative">
                        <ExternalLink size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="https://..."
                          value={itemLinks[item.id] || ''}
                          onChange={(e) => updateItemLink(item.id, e.target.value)}
                          className="h-8 text-xs pl-7"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="instagram"
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
