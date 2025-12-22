import { useState, useRef, useEffect } from 'react';
import { Camera, Save, Share2, Sparkles, Loader2, X, Download, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategorySidebar } from '@/components/clothing/CategorySidebar';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { TryOnCanvas } from '@/components/tryOn/TryOnCanvas';
import { SelectedClothingList } from '@/components/tryOn/SelectedClothingList';
import { sampleClothing } from '@/data/sampleClothing';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useAITryOn } from '@/hooks/useAITryOn';
import { useTryOnHistory } from '@/hooks/useTryOnHistory';
import { useUserClothing } from '@/hooks/useUserClothing';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClothingValidation } from '@/hooks/useClothingValidation';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BODY_IMAGE_STORAGE_KEY = 'tryon_body_image';

interface TryOnPageProps {
  initialItem?: ClothingItem;
}

export const TryOnPage = ({ initialItem }: TryOnPageProps) => {
  const [bodyImage, setBodyImage] = useState<string | undefined>(() => {
    // Load saved body image from localStorage on init
    try {
      return localStorage.getItem(BODY_IMAGE_STORAGE_KEY) || undefined;
    } catch {
      return undefined;
    }
  });
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>(() => 
    initialItem ? [initialItem] : []
  );
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('top');
  const [clothingSource, setClothingSource] = useState<'sample' | 'saved'>('sample');
  const [clothing] = useState(sampleClothing);
  const [aiResultImage, setAiResultImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingClothingToSave, setPendingClothingToSave] = useState<ClothingItem | null>(null);
  
  const { processVirtualTryOn, isProcessing, clearResult } = useAITryOn();
  const { saveTryOnResult } = useTryOnHistory();
  const { userClothing, saveClothingItem, deleteClothingItem, isSaving: isSavingClothing } = useUserClothing();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { 
    validateAndProcessClothing, 
    isValidating: isValidatingClothing, 
    progress: clothingProgress,
    mapToAppCategory,
    issueTranslationMap
  } = useClothingValidation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  // Save body image to localStorage when it changes
  useEffect(() => {
    if (bodyImage) {
      try {
        localStorage.setItem(BODY_IMAGE_STORAGE_KEY, bodyImage);
      } catch (e) {
        console.warn('Could not save body image to localStorage:', e);
      }
    }
  }, [bodyImage]);

  // Get clothing based on source
  const displayedClothing = clothingSource === 'saved' ? userClothing : clothing;
  const filteredClothing = activeCategory === 'all'
    ? displayedClothing 
    : displayedClothing.filter(c => c.category === activeCategory);

  const handleAddBodyImage = () => {
    fileInputRef.current?.click();
  };

  const handleAddClothingFromDevice = () => {
    clothingInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBodyImage(event.target?.result as string);
        setAiResultImage(null);
        clearResult();
        toast.success(t('msg_upload_success'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      
      // Validate clothing image with AI
      const result = await validateAndProcessClothing(imageDataUrl, { 
        removeBackground: true, 
        language 
      });
      
      if (!result.isValid) {
        // Show errors with suggestions
        const errorMessages = result.errors.map(err => {
          const translationKey = issueTranslationMap[err];
          if (translationKey && t(translationKey as any) !== translationKey) {
            return t(translationKey as any);
          }
          return err;
        });
        
        toast.error(
          <div className="space-y-2">
            <p className="font-medium">{t('msg_not_clothing')}</p>
            <ul className="text-sm list-disc pl-4 space-y-1">
              {errorMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
            {result.suggestions.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {result.suggestions[0]}
              </div>
            )}
          </div>
        );
        return;
      }
      
      // Get category from AI analysis
      const aiCategory = result.analysis?.category || 'top';
      const appCategory = mapToAppCategory(aiCategory);
      
      // Create clothing item with AI-detected info
      const newItem: ClothingItem = {
        id: Date.now().toString(),
        name: result.analysis?.subcategory || file.name.replace(/\.[^/.]+$/, ''),
        category: appCategory,
        imageUrl: result.processedImageUrl || imageDataUrl,
        color: result.analysis?.color,
        gender: result.analysis?.gender,
        style: result.analysis?.style,
        pattern: result.analysis?.pattern,
      };
      
      handleAddClothing(newItem);
      
      // Store pending item and ask if user wants to save
      if (user) {
        setPendingClothingToSave(newItem);
      }
      
      // Show success toast with detected info
      const genderLabel = result.analysis?.gender === 'male' 
        ? t('msg_gender_male') 
        : result.analysis?.gender === 'female' 
          ? t('msg_gender_female') 
          : '';
          
      const categoryLabel = t(`msg_clothing_category_${appCategory}` as any) || appCategory;
      
      toast.success(
        <div className="space-y-1">
          <p>{t('msg_clothing_detected')} {categoryLabel}</p>
          <p className="text-xs text-muted-foreground">
            {result.analysis?.color && `${t('msg_clothing_color')} ${result.analysis.color}`}
            {genderLabel && ` • ${genderLabel}`}
          </p>
        </div>
      );
    };
    reader.readAsDataURL(file);
    
    // Clear input for re-upload
    e.target.value = '';
  };

  const handleAddClothing = (item: ClothingItem) => {
    // Replace item of same category or add new
    setSelectedItems(prev => {
      const filtered = prev.filter(i => i.category !== item.category);
      return [...filtered, item];
    });
    toast.success(`${t('msg_item_selected')} ${item.name}`);
  };

  const handleRemoveClothing = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
    toast.success(t('msg_item_removed'));
  };

  const handleSaveClothingToCollection = async () => {
    if (!pendingClothingToSave) return;
    await saveClothingItem(pendingClothingToSave);
    setPendingClothingToSave(null);
  };

  const handleDeleteSavedClothing = async (id: string) => {
    await deleteClothingItem(id);
  };

  const handleAITryOn = async () => {
    if (!bodyImage) {
      toast.error(t('msg_upload_body_first'));
      return;
    }

    if (selectedItems.length === 0) {
      toast.error(t('msg_select_clothing'));
      return;
    }

    // Convert all selected items to base64 if needed
    const clothingItemsData: Array<{ imageUrl: string; name: string }> = [];
    
    for (const item of selectedItems) {
      let imageData = item.imageUrl;
      
      if (item.imageUrl.startsWith('http')) {
        try {
          const response = await fetch(item.imageUrl);
          const blob = await response.blob();
          imageData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error converting image:', error);
          toast.error(`${t('msg_image_load_error')} ${item.name}`);
          return;
        }
      }
      
      clothingItemsData.push({ imageUrl: imageData, name: item.name });
    }

    const result = await processVirtualTryOn(bodyImage, clothingItemsData);
    
    if (result?.success && result.generatedImage) {
      setAiResultImage(result.generatedImage);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error(t('msg_login_required'));
      return;
    }
    
    if (!bodyImage || !aiResultImage) {
      toast.info(t('msg_no_result'));
      return;
    }
    
    setIsSaving(true);
    const clothingItemsData = selectedItems.map(item => ({
      name: item.name,
      imageUrl: item.imageUrl,
    }));
    
    await saveTryOnResult(user.id, bodyImage, aiResultImage, clothingItemsData);
    setIsSaving(false);
  };

  const handleShare = () => {
    toast.success(t('msg_shared'));
  };

  const handleDownloadResult = () => {
    if (aiResultImage) {
      const link = document.createElement('a');
      link.href = aiResultImage;
      link.download = 'virtual-try-on-result.png';
      link.click();
      toast.success(t('msg_downloaded'));
    }
  };

  const handleCloseResult = () => {
    setAiResultImage(null);
    clearResult();
  };

  const getClothingProgressMessage = () => {
    if (!clothingProgress) return '';
    switch (clothingProgress.stage) {
      case 'checking_size': return t('msg_checking_size');
      case 'analyzing': return t('msg_analyzing_clothing');
      case 'removing_background': return t('msg_removing_background');
      case 'complete': return t('msg_validation_complete');
      case 'error': return '';
      default: return t('msg_validating_image');
    }
  };

  return (
    <div className="pb-24 pt-16 max-w-md mx-auto">
      {/* Clothing Validation Overlay */}
      {isValidatingClothing && clothingProgress && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl p-6 max-w-xs w-full shadow-medium space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium text-foreground">{t('msg_analyzing_clothing')}</p>
              <p className="text-sm text-muted-foreground">{getClothingProgressMessage()}</p>
            </div>
            <Progress value={clothingProgress.progress} className="h-2" />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={clothingInputRef}
        type="file"
        accept="image/*"
        onChange={handleClothingFileChange}
        className="hidden"
      />

      {/* AI Result Modal */}
      {aiResultImage && (
        <div className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-card rounded-2xl shadow-medium max-w-sm w-full overflow-hidden max-h-[85vh] flex flex-col">
            <div className="relative flex-1 min-h-0 bg-muted flex items-center justify-center">
              <img 
                src={aiResultImage} 
                alt="AI Try-On Result" 
                className="w-full h-full max-h-[65vh] object-contain"
              />
              <Button
                variant="ghost"
                size="iconSm"
                onClick={handleCloseResult}
                className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-bold text-lg text-center">
                {t('tryon_result_title')}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadResult}
                >
                  <Download size={16} />
                  {t('download')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? t('tryon_saving') : t('save')}
                </Button>
                <Button
                  variant="accent"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Clothing Dialog */}
      {pendingClothingToSave && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl p-5 max-w-xs w-full shadow-medium space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={pendingClothingToSave.imageUrl} 
                  alt={pendingClothingToSave.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{pendingClothingToSave.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingClothingToSave.color && `${pendingClothingToSave.color}`}
                  {pendingClothingToSave.gender && pendingClothingToSave.gender !== 'unknown' && ` • ${
                    pendingClothingToSave.gender === 'male' ? t('msg_gender_male') : 
                    pendingClothingToSave.gender === 'female' ? t('msg_gender_female') : 'Unisex'
                  }`}
                </p>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {t('msg_save_clothing_question')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPendingClothingToSave(null)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSaveClothingToCollection}
                disabled={isSavingClothing}
              >
                {isSavingClothing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Heart size={16} />
                )}
                {t('save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-2 px-2">
        {/* Left sidebar - Categories */}
        <div className="flex-shrink-0">
          <CategorySidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onAddClothing={handleAddClothingFromDevice}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 min-w-0">
          <TryOnCanvas
            bodyImageUrl={bodyImage}
            onBodyImageChange={(imageUrl) => {
              setBodyImage(imageUrl);
              setAiResultImage(null);
              clearResult();
              toast.success(t('msg_upload_success'));
            }}
          />
        </div>

        {/* Right sidebar - Clothing items with tabs */}
        <div className="flex-shrink-0 w-24 space-y-2">
          {/* Source tabs */}
          {user && (
            <Tabs value={clothingSource} onValueChange={(v) => setClothingSource(v as 'sample' | 'saved')} className="w-full">
              <TabsList className="w-full h-7 p-0.5">
                <TabsTrigger value="sample" className="flex-1 text-[10px] h-6 px-1">
                  {t('clothing_sample')}
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex-1 text-[10px] h-6 px-1">
                  {t('clothing_saved')} ({userClothing.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {/* Clothing list */}
          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {filteredClothing.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  {clothingSource === 'saved' ? t('no_saved_clothing') : t('no_clothing')}
                </p>
              </div>
            ) : (
              filteredClothing.map((item) => (
                <div key={item.id} className="relative group">
                  <ClothingCard
                    item={item}
                    size="sm"
                    onSelect={handleAddClothing}
                    isSelected={selectedItems.some(i => i.id === item.id)}
                  />
                  {/* Delete button for saved clothing */}
                  {clothingSource === 'saved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedClothing(item.id);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Clothing List */}
      <div className="px-4 mt-4">
        <SelectedClothingList 
          items={selectedItems} 
          onRemove={handleRemoveClothing}
        />
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 space-y-4">
        {/* AI Try-On Button */}
        <Button
          variant="default"
          className="w-full h-12 text-base"
          onClick={handleAITryOn}
          disabled={isProcessing || !bodyImage || selectedItems.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t('tryon_processing')}
            </>
          ) : (
            <>
              <Sparkles size={20} />
              {t('tryon_ai_button')}
            </>
          )}
        </Button>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAddBodyImage}
          >
            <Camera size={18} />
            {bodyImage ? t('tryon_change_photo') : t('tryon_upload_photo')}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleSave}
          >
            <Save size={18} />
            {t('save')}
          </Button>
          <Button
            variant="accent"
            size="icon"
            onClick={handleShare}
          >
            <Share2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
