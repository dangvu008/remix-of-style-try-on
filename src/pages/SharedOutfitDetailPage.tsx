import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ExternalLink, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClothingItemData {
  id?: string;
  name: string;
  imageUrl: string;
  category?: string;
  purchaseUrl?: string;
}

interface SharedOutfitDetail {
  id: string;
  title: string;
  description: string | null;
  result_image_url: string;
  clothing_items: ClothingItemData[];
  likes_count: number;
  is_featured: boolean;
  created_at: string;
}

export const SharedOutfitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState<SharedOutfitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOutfitDetail(id);
    }
  }, [id]);

  const fetchOutfitDetail = async (outfitId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shared_outfits')
      .select('*')
      .eq('id', outfitId)
      .single();

    if (error || !data) {
      toast.error('Không tìm thấy outfit');
      navigate('/');
      return;
    }

    setOutfit({
      ...data,
      clothing_items: (data.clothing_items || []) as unknown as ClothingItemData[],
    });
    setLoading(false);
  };

  const handleShare = async () => {
    if (!outfit) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: outfit.title,
          text: outfit.description || 'Xem outfit này!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép link!');
      }
    } catch (error) {
      // User cancelled
    }
  };

  const handleBuyItem = (item: ClothingItemData) => {
    if (item.purchaseUrl) {
      window.open(item.purchaseUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Chưa có link mua hàng cho sản phẩm này');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!outfit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-display font-bold text-base truncate max-w-[200px]">
            {outfit.title}
          </h1>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      <div className="pt-16 px-4 max-w-md mx-auto space-y-6">
        {/* Main outfit image */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
          <div className="aspect-[3/4] relative">
            <img
              src={outfit.result_image_url}
              alt={outfit.title}
              className="w-full h-full object-cover"
            />
            
            {/* Likes badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-2">
              <Heart size={16} className="text-destructive fill-destructive" />
              <span className="text-sm font-medium text-foreground">{outfit.likes_count}</span>
            </div>

            {outfit.is_featured && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                ⭐ Nổi bật
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {outfit.description && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-muted-foreground text-sm">{outfit.description}</p>
          </div>
        )}

        {/* Clothing items */}
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Các món đồ trong outfit ({outfit.clothing_items?.length || 0})
          </h2>

          <div className="space-y-3">
            {outfit.clothing_items?.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-card rounded-xl border border-border overflow-hidden flex"
              >
                {/* Item image */}
                <div className="w-24 h-24 flex-shrink-0 bg-secondary">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Item info */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">
                      {item.name}
                    </h3>
                    {item.category && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Buy button */}
                  <Button
                    size="sm"
                    variant={item.purchaseUrl ? 'default' : 'outline'}
                    className="w-full mt-2"
                    onClick={() => handleBuyItem(item)}
                  >
                    {item.purchaseUrl ? (
                      <>
                        <ExternalLink size={14} className="mr-1" />
                        Mua ngay
                      </>
                    ) : (
                      'Chưa có link'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
