import { useState } from 'react';
import { Shirt, Square, Crown, Footprints, Glasses, Plus, ShoppingBag, Check, ExternalLink } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CategoryClothingSliderProps {
  clothing: ClothingItem[];
  userClothing: ClothingItem[];
  onSelectItem: (item: ClothingItem) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

type OwnershipFilter = 'all' | 'owned' | 'not_owned';

interface CategoryOption {
  id: ClothingCategory;
  label: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  { id: 'top', label: 'Áo', icon: <Shirt size={20} /> },
  { id: 'bottom', label: 'Quần', icon: <Square size={20} /> },
  { id: 'dress', label: 'Váy', icon: <Crown size={20} /> },
  { id: 'shoes', label: 'Giày', icon: <Footprints size={20} /> },
  { id: 'accessory', label: 'Phụ kiện', icon: <Glasses size={20} /> },
];

export const CategoryClothingSlider = ({
  clothing,
  userClothing,
  onSelectItem,
  onAddNew,
  isLoading = false,
}: CategoryClothingSliderProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('top');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');

  // Get user clothing IDs for quick lookup
  const userClothingIds = new Set(userClothing.map(item => item.id));

  // Filter items by category and ownership
  const filteredItems = clothing.filter(item => {
    if (item.category !== selectedCategory) return false;
    
    const isOwned = userClothingIds.has(item.id);
    
    if (ownershipFilter === 'owned') return isOwned;
    if (ownershipFilter === 'not_owned') return !isOwned;
    return true;
  });

  return (
    <section className="animate-fade-in border-b border-border">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {/* Add new button */}
        <button
          onClick={onAddNew}
          className="flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-colors min-w-[70px]"
        >
          <Plus size={20} />
          <span className="text-[10px] font-medium">Thêm</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all",
              selectedCategory === cat.id
                ? "bg-foreground text-background shadow-md"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {cat.icon}
            <span className="text-[10px] font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Ownership filter */}
      <div className="flex gap-2 px-4 pb-3">
        <Button
          variant={ownershipFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs rounded-full"
          onClick={() => setOwnershipFilter('all')}
        >
          Tất cả
        </Button>
        <Button
          variant={ownershipFilter === 'owned' ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs rounded-full gap-1"
          onClick={() => setOwnershipFilter('owned')}
        >
          <Check size={12} />
          Có trong tủ
        </Button>
        <Button
          variant={ownershipFilter === 'not_owned' ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs rounded-full gap-1"
          onClick={() => setOwnershipFilter('not_owned')}
        >
          <ShoppingBag size={12} />
          Chưa mua
        </Button>
      </div>

      {/* Items slider */}
      <div className="pb-4">
        {isLoading ? (
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-28 aspect-[3/4] rounded-xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {ownershipFilter === 'owned' 
                ? 'Chưa có món đồ nào trong tủ'
                : ownershipFilter === 'not_owned'
                ? 'Không có món đồ nào chưa mua'
                : 'Không có món đồ nào'}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={onAddNew}
            >
              Thêm món đồ mới
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
            {filteredItems.map((item, index) => {
              const isOwned = userClothingIds.has(item.id);
              
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="flex-shrink-0 w-28 group cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Ownership badge */}
                    {isOwned ? (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : item.shopUrl ? (
                      <a
                        href={item.shopUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center gap-1 hover:bg-primary/90"
                      >
                        Mua
                        <ExternalLink size={10} />
                      </a>
                    ) : null}

                    {/* Price badge */}
                    {item.price && !isOwned && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-bold text-foreground">
                        {item.price}
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  
                  {/* Item name */}
                  <p className="mt-1.5 text-xs text-foreground font-medium truncate">
                    {item.name}
                  </p>
                  {item.shopName && !isOwned && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.shopName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
