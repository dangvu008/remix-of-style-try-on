import { Heart, ExternalLink } from 'lucide-react';
import { SharedOutfit } from '@/hooks/useSharedOutfits';

interface SharedOutfitCardProps {
  outfit: SharedOutfit;
  onClick?: () => void;
}

export const SharedOutfitCard = ({ outfit, onClick }: SharedOutfitCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:border-primary/50 transition-all group"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={outfit.result_image_url}
          alt={outfit.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Featured badge */}
        {outfit.is_featured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            Nổi bật
          </div>
        )}

        {/* Likes count */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1 text-xs">
          <Heart size={12} className="text-destructive" />
          <span className="text-foreground">{outfit.likes_count}</span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Title */}
        <div className="absolute bottom-2 left-2 right-2">
          <h4 className="text-primary-foreground font-medium text-sm truncate">
            {outfit.title}
          </h4>
          <p className="text-primary-foreground/80 text-xs">
            {outfit.clothing_items?.length || 0} món đồ
          </p>
        </div>
      </div>
    </button>
  );
};
