import { ArrowLeft, Share2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
      <div className="flex items-center justify-end px-4 py-3 max-w-md mx-auto">
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
