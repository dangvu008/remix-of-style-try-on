import { Share2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import logoImage from '@/assets/logo.png';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showShare?: boolean;
  showNotification?: boolean;
  showLanguageSwitcher?: boolean;
  onBack?: () => void;
  onShare?: () => void;
}

export const Header = ({ 
  title, 
  showBack, 
  showShare, 
  showNotification,
  showLanguageSwitcher = true,
  onBack,
  onShare 
}: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="flex items-center justify-between px-4 py-2 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img 
            src={logoImage} 
            alt="TryOn Logo" 
            className="w-9 h-9 object-contain"
          />
          <span className="font-display font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TryOn
          </span>
        </div>
        
        {/* Right actions */}
        <div className="flex items-center gap-1">
          {showLanguageSwitcher && <LanguageSwitcher />}
          {showNotification && (
            <Button variant="ghost" size="iconSm">
              <Bell size={18} />
            </Button>
          )}
          {showShare && (
            <Button variant="ghost" size="iconSm" onClick={onShare}>
              <Share2 size={18} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
