import { ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClothingItemInfo } from '@/hooks/useOutfitTryOn';

interface ClothingItemsGridProps {
  items: ClothingItemInfo[];
  onItemClick?: (item: ClothingItemInfo, index: number) => void;
  onItemRemove?: (index: number) => void;
  showShopLinks?: boolean;
  showRemoveButton?: boolean;
}

/**
 * Displays clothing items in a horizontal scrollable list
 * Shows thumbnail, name, and price for each item
 * 
 * Requirements: 2.1, 2.4
 */
export const ClothingItemsGrid = ({
  items,
  onItemClick,
  onItemRemove,
  showShopLinks = true,
  showRemoveButton = false,
}: ClothingItemsGridProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item, index) => (
        <div key={index} className="relative flex-shrink-0">
          {/* Remove button */}
          {showRemoveButton && onItemRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemRemove(index);
              }}
              className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => onItemClick?.(item, index)}
            className={cn(
              "w-24 bg-muted rounded-xl overflow-hidden",
              "transition-all duration-200 hover:ring-2 hover:ring-primary/50",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
          >
            <div className="aspect-square relative bg-background">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain"
              />
              {showShopLinks && item.shopUrl && (
                <div className="absolute top-1 right-1 p-1 rounded-full bg-primary text-primary-foreground">
                  <ExternalLink size={10} />
                </div>
              )}
            </div>
            <div className="p-2 space-y-0.5">
              <p className="text-xs font-medium truncate text-foreground">
                {item.name}
              </p>
              {item.price && (
                <p className="text-xs text-primary font-semibold">
                  {item.price}
                </p>
              )}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
