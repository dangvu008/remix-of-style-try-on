import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { X, Shirt, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedClothingListProps {
  items: ClothingItem[];
  onRemove: (id: string) => void;
}

type OutfitCategory = 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory';

const outfitSlots: { category: OutfitCategory; label: string; icon: string }[] = [
  { category: 'top', label: 'Áo', icon: '👕' },
  { category: 'bottom', label: 'Quần', icon: '👖' },
  { category: 'dress', label: 'Đầm', icon: '👗' },
  { category: 'shoes', label: 'Giày', icon: '👟' },
  { category: 'accessory', label: 'Phụ kiện', icon: '👜' },
];

export const SelectedClothingList = ({ items, onRemove }: SelectedClothingListProps) => {
  // Group items by category (only first item per category matters due to 1-per-category rule)
  const itemsByCategory = items.reduce((acc, item) => {
    if (item.category !== 'all') {
      acc[item.category as OutfitCategory] = item;
    }
    return acc;
  }, {} as Record<OutfitCategory, ClothingItem | undefined>);

  const selectedCount = Object.values(itemsByCategory).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">
          Outfit đã chọn
        </p>
        <span className="text-xs font-bold text-primary">
          {selectedCount}/{outfitSlots.length} items
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {outfitSlots.map((slot) => {
          const item = itemsByCategory[slot.category];
          
          return (
            <div key={slot.category} className="flex flex-col items-center gap-1">
              {/* Slot container */}
              <div
                className={cn(
                  "relative w-full aspect-square rounded-xl overflow-hidden transition-all",
                  item 
                    ? "ring-2 ring-primary shadow-glow" 
                    : "border-2 border-dashed border-muted-foreground/30 bg-muted/30"
                )}
              >
                {item ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onRemove(item.id)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <X size={10} />
                    </button>
                    {/* Overlay with name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-1">
                      <p className="text-[8px] text-background truncate font-medium text-center">
                        {item.name}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl opacity-40">
                    {slot.icon}
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium",
                item ? "text-primary" : "text-muted-foreground"
              )}>
                {slot.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedCount === 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">
          Chọn quần áo để tạo outfit thử đồ với AI
        </p>
      )}
    </div>
  );
};
