import { useState, useRef } from 'react';
import { Upload, ImagePlus, Sparkles, X, RotateCcw, Save, Share2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIProgressBar } from './AIProgressBar';
import { LoginRequiredDialog } from '@/components/auth/LoginRequiredDialog';
import { ShareOutfitDialog } from '@/components/outfit/ShareOutfitDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAITryOn } from '@/hooks/useAITryOn';
import { useTryOnHistory } from '@/hooks/useTryOnHistory';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BODY_IMAGE_STORAGE_KEY = 'tryon_body_image';

export const OutfitTransferMode = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { processOutfitTransfer, isProcessing, progress, updateProgress, cancelProcessing, clearResult } = useOutfitTransferAI();
  const { saveTryOnResult } = useTryOnHistory();

  const [bodyImage, setBodyImage] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(BODY_IMAGE_STORAGE_KEY) || undefined;
    } catch {
      return undefined;
    }
  });
  const [modelImage, setModelImage] = useState<string | undefined>();
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isResultSaved, setIsResultSaved] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const bodyInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    setter: (v: string) => void,
    storageKey?: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setter(result);
      if (storageKey) {
        try { localStorage.setItem(storageKey, result); } catch {}
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTransfer = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    if (!bodyImage || !modelImage) {
      toast.error('Vui lòng upload cả ảnh người mẫu và ảnh của bạn');
      return;
    }

    updateProgress('compressing', 5, 'Đang nén hình ảnh...');
    const { compressImageForAI } = await import('@/utils/imageCompression');

    const [compressedBody, compressedModel] = await Promise.all([
      compressImageForAI(bodyImage, 1024, 1024, 0.85),
      compressImageForAI(modelImage, 1024, 1024, 0.85),
    ]);

    const result = await processOutfitTransfer(compressedBody, compressedModel);

    if (result?.success && result.generatedImage) {
      setResultImage(result.generatedImage);
      setIsResultSaved(false);

      if (user) {
        const saved = await saveTryOnResult(
          user.id,
          bodyImage,
          result.generatedImage,
          [{ name: 'Outfit từ người mẫu', imageUrl: modelImage }]
        );
        if (saved) setIsResultSaved(true);
      }
    }
  };

  const handleReset = () => {
    setResultImage(null);
    setIsResultSaved(false);
    clearResult();
  };

  const handleSave = async () => {
    if (!user) { setShowLoginDialog(true); return; }
    if (!bodyImage || !resultImage || !modelImage) return;
    if (isResultSaved) { toast.info('Đã lưu rồi!'); return; }

    const saved = await saveTryOnResult(
      user.id,
      bodyImage,
      resultImage,
      [{ name: 'Outfit từ người mẫu', imageUrl: modelImage }]
    );
    if (saved) setIsResultSaved(true);
  };

  // Result view
  if (resultImage) {
    return (
      <div className="relative w-full max-w-md mx-auto animate-fade-in">
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border">
          <img src={resultImage} alt="Result" className="w-full object-contain max-h-[70vh]" />
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-30">
          <button onClick={handleReset} className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-card transition-colors">
            <RotateCcw size={20} />
          </button>
          <button onClick={handleSave} className={cn("w-12 h-12 rounded-full backdrop-blur-md border shadow-lg flex items-center justify-center transition-colors", isResultSaved ? "bg-primary/20 border-primary text-primary" : "bg-card/80 border-border text-foreground hover:bg-card")}>
            <Save size={20} />
          </button>
          <button onClick={() => setShowShareDialog(true)} className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-card transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {resultImage && (
          <ShareOutfitDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            resultImage={resultImage}
          />
        )}
      </div>
    );
  }

  // Processing view
  if (isProcessing) {
    return (
      <div className="w-full max-w-md mx-auto">
        <AIProgressBar progress={progress} onCancel={cancelProcessing} />
      </div>
    );
  }

  // Upload view
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="font-display font-bold text-lg text-foreground">
          Thử nguyên outfit từ người mẫu
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload ảnh người mẫu và ảnh bạn, AI sẽ chuyển outfit sang
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Model image */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ảnh người mẫu
          </label>
          <div
            onClick={() => modelInputRef.current?.click()}
            className={cn(
              "aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden flex items-center justify-center",
              modelImage
                ? "border-primary/50 hover:border-primary"
                : "border-border hover:border-primary/50 bg-muted/30"
            )}
          >
            {modelImage ? (
              <div className="relative w-full h-full group">
                <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 p-4">
                <ImagePlus size={32} className="mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Ảnh mặc outfit</p>
              </div>
            )}
          </div>
          <input ref={modelInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload(setModelImage)} />
        </div>

        {/* Body image */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ảnh của bạn
          </label>
          <div
            onClick={() => bodyInputRef.current?.click()}
            className={cn(
              "aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden flex items-center justify-center",
              bodyImage
                ? "border-primary/50 hover:border-primary"
                : "border-border hover:border-primary/50 bg-muted/30"
            )}
          >
            {bodyImage ? (
              <div className="relative w-full h-full group">
                <img src={bodyImage} alt="You" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 p-4">
                <Upload size={32} className="mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Ảnh toàn thân</p>
              </div>
            )}
          </div>
          <input ref={bodyInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload(setBodyImage, BODY_IMAGE_STORAGE_KEY)} />
        </div>
      </div>

      {/* Transfer button */}
      <Button
        onClick={handleTransfer}
        disabled={!bodyImage || !modelImage || isProcessing}
        className="w-full h-12 text-base gap-2"
        variant="default"
      >
        <Sparkles size={20} />
        Thử outfit này
      </Button>

      <LoginRequiredDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </div>
  );
};

// Custom hook for outfit transfer AI call
function useOutfitTransferAI() {
  const { isProcessing, progress, updateProgress, cancelProcessing, clearResult } = useAITryOn();
  const [isTransferring, setIsTransferring] = useState(false);

  const processOutfitTransfer = async (
    bodyImage: string,
    modelImage: string
  ) => {
    setIsTransferring(true);
    updateProgress('uploading', 10, 'Đang gửi dữ liệu...');

    try {
      updateProgress('processing', 30, 'AI đang phân tích outfit...');

      const progressInterval = setInterval(() => {
        // Progress simulation handled by parent
      }, 800);

      updateProgress('generating', 50, 'Đang chuyển outfit...');

      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('outfit-transfer', {
        body: { bodyImage, modelImage },
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Function error:', error);
        updateProgress('error', 0, 'Lỗi kết nối');
        toast.error(error.message || 'Không thể xử lý');
        return null;
      }

      if (data.error) {
        updateProgress('error', 0, data.error);
        toast.error(data.error);
        return { success: false, error: data.error };
      }

      updateProgress('complete', 100, 'Hoàn thành!');
      toast.success('Đã chuyển outfit thành công!');
      return {
        success: true,
        generatedImage: data.generatedImage,
        message: data.message,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      updateProgress('error', 0, msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    processOutfitTransfer,
    isProcessing: isProcessing || isTransferring,
    progress,
    updateProgress,
    cancelProcessing,
    clearResult,
  };
}
