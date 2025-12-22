import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClothingItemData {
  id?: string;
  name: string;
  imageUrl: string;
  category?: string;
  purchaseUrl?: string;
}

export interface SharedOutfit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  result_image_url: string;
  clothing_items: ClothingItemData[];
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useSharedOutfits = () => {
  const { user } = useAuth();
  const [sharedOutfits, setSharedOutfits] = useState<SharedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSharedOutfits = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('shared_outfits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      const typedData = data.map(item => ({
        ...item,
        clothing_items: (item.clothing_items || []) as unknown as ClothingItemData[],
      }));
      setSharedOutfits(typedData);
    }
    setIsLoading(false);
  }, []);

  const shareOutfit = async (
    title: string,
    resultImageUrl: string,
    clothingItems: ClothingItemData[],
    description?: string
  ) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để chia sẻ outfit');
      return false;
    }

    const { error } = await supabase.from('shared_outfits').insert({
      user_id: user.id,
      title,
      description: description || null,
      result_image_url: resultImageUrl,
      clothing_items: clothingItems as any,
    });

    if (error) {
      toast.error('Không thể chia sẻ outfit');
      return false;
    }

    toast.success('Đã chia sẻ outfit thành công!');
    await fetchSharedOutfits();
    return true;
  };

  const deleteOutfit = async (outfitId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('shared_outfits')
      .delete()
      .eq('id', outfitId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Không thể xóa outfit');
      return false;
    }

    setSharedOutfits(prev => prev.filter(o => o.id !== outfitId));
    toast.success('Đã xóa outfit');
    return true;
  };

  useEffect(() => {
    fetchSharedOutfits();
  }, [fetchSharedOutfits]);

  return {
    sharedOutfits,
    isLoading,
    shareOutfit,
    deleteOutfit,
    refetch: fetchSharedOutfits,
  };
};
