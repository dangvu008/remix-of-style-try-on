import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { HomePage } from './HomePage';
import { TryOnPage } from './TryOnPage';
import { ComparePage } from './ComparePage';
import { FavoritesPage } from './FavoritesPage';
import { ProfilePage } from './ProfilePage';
import { CompareProvider } from '@/contexts/CompareContext';
import { ClothingItem } from '@/types/clothing';
import { toast } from 'sonner';

const pageTitles: Record<string, string> = {
  home: 'Virtual Try-On',
  tryOn: 'Phòng thử đồ',
  compare: 'So sánh Outfit',
  favorites: 'Yêu thích',
  profile: 'Tài khoản',
};

const IndexContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | undefined>();

  const handleNavigateToTryOn = () => {
    setActiveTab('tryOn');
  };

  const handleNavigateToCompare = () => {
    setActiveTab('compare');
  };

  const handleSelectItem = (item: ClothingItem) => {
    setSelectedItem(item);
    setActiveTab('tryOn');
    toast.success(`Đã chọn ${item.name} để thử`);
  };

  const handleShare = () => {
    toast.success('Đã sao chép link chia sẻ!');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigateToTryOn={handleNavigateToTryOn}
            onNavigateToCompare={handleNavigateToCompare}
            onSelectItem={handleSelectItem}
          />
        );
      case 'tryOn':
        return <TryOnPage initialItem={selectedItem} />;
      case 'compare':
        return <ComparePage onBack={() => setActiveTab('home')} />;
      case 'favorites':
        return <FavoritesPage onSelectItem={handleSelectItem} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <div className="mobile-viewport bg-background">
      <Header
        title={pageTitles[activeTab]}
        showBack={activeTab !== 'home'}
        showShare={activeTab === 'tryOn' || activeTab === 'compare'}
        showNotification={activeTab === 'home'}
        onBack={() => setActiveTab('home')}
        onShare={handleShare}
      />

      <main className="min-h-screen">
        {renderPage()}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const Index = () => {
  return (
    <CompareProvider>
      <IndexContent />
    </CompareProvider>
  );
};

export default Index;
