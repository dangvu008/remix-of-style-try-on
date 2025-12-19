import { Home, Shirt, Heart, User, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompare } from '@/contexts/CompareContext';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Trang chủ' },
  { id: 'tryOn', icon: Shirt, label: 'Thử đồ' },
  { id: 'compare', icon: Scale, label: 'So sánh' },
  { id: 'favorites', icon: Heart, label: 'Yêu thích' },
  { id: 'profile', icon: User, label: 'Tôi' },
];

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const { outfitsToCompare } = useCompare();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'compare' && outfitsToCompare.length > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "gradient-primary shadow-glow"
              )}>
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-colors duration-300",
                    isActive && "text-primary-foreground"
                  )} 
                />
                {/* Badge for compare count */}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full gradient-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
                    {outfitsToCompare.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
