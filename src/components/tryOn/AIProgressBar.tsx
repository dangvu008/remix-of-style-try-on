import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { TryOnProgress } from '@/hooks/useAITryOn';
import { cn } from '@/lib/utils';

interface AIProgressBarProps {
  progress: TryOnProgress;
  isVisible: boolean;
  onCancel?: () => void;
}

// Cute animated character SVG components
const UploadingCharacter = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    {/* Cloud with upload arrow */}
    <g className="animate-bounce" style={{ animationDuration: '1.5s' }}>
      <ellipse cx="60" cy="70" rx="35" ry="20" fill="hsl(var(--primary) / 0.2)" />
      <ellipse cx="45" cy="55" rx="20" ry="15" fill="hsl(var(--primary) / 0.3)" />
      <ellipse cx="75" cy="55" rx="18" ry="14" fill="hsl(var(--primary) / 0.3)" />
      <ellipse cx="60" cy="50" rx="25" ry="18" fill="hsl(var(--primary) / 0.4)" />
      {/* Cute face */}
      <circle cx="52" cy="52" r="3" fill="hsl(var(--foreground))" />
      <circle cx="68" cy="52" r="3" fill="hsl(var(--foreground))" />
      <path d="M55 60 Q60 65 65 60" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
    {/* Upload arrow */}
    <g className="animate-pulse">
      <path d="M60 85 L60 95" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 90 L60 82 L68 90" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    {/* Sparkles */}
    <circle cx="30" cy="40" r="2" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="90" cy="45" r="2" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
  </svg>
);

const ProcessingCharacter = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    {/* Brain/Robot character */}
    <g>
      {/* Body */}
      <rect x="40" y="50" width="40" height="45" rx="8" fill="hsl(var(--primary) / 0.3)" />
      {/* Head */}
      <rect x="35" y="20" width="50" height="35" rx="10" fill="hsl(var(--primary) / 0.4)" />
      {/* Antenna */}
      <line x1="60" y1="20" x2="60" y2="10" stroke="hsl(var(--primary))" strokeWidth="3" />
      <circle cx="60" cy="8" r="5" fill="hsl(var(--primary))" className="animate-pulse" />
      {/* Eyes - blinking */}
      <g className="animate-pulse" style={{ animationDuration: '1s' }}>
        <rect x="45" y="32" width="8" height="8" rx="2" fill="hsl(var(--background))" />
        <rect x="67" y="32" width="8" height="8" rx="2" fill="hsl(var(--background))" />
        <circle cx="49" cy="36" r="2" fill="hsl(var(--primary))" />
        <circle cx="71" cy="36" r="2" fill="hsl(var(--primary))" />
      </g>
      {/* Mouth - processing */}
      <rect x="52" y="45" width="16" height="3" rx="1" fill="hsl(var(--foreground))" className="animate-pulse" />
      {/* Arms moving */}
      <g className="origin-center" style={{ animation: 'wiggle 0.5s ease-in-out infinite' }}>
        <rect x="25" y="55" width="15" height="8" rx="4" fill="hsl(var(--primary) / 0.4)" />
        <rect x="80" y="55" width="15" height="8" rx="4" fill="hsl(var(--primary) / 0.4)" />
      </g>
      {/* Processing circles around */}
      <circle cx="25" cy="35" r="4" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '1s' }} />
      <circle cx="95" cy="40" r="3" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
      <circle cx="20" cy="70" r="3" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
    </g>
  </svg>
);

const GeneratingCharacter = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    {/* Magic wand character */}
    <g>
      {/* Cute star character */}
      <g className="animate-bounce" style={{ animationDuration: '1s' }}>
        <path d="M60 15 L65 35 L85 35 L70 48 L75 68 L60 55 L45 68 L50 48 L35 35 L55 35 Z" 
              fill="hsl(var(--primary))" />
        {/* Face on star */}
        <circle cx="52" cy="40" r="3" fill="hsl(var(--background))" />
        <circle cx="68" cy="40" r="3" fill="hsl(var(--background))" />
        <path d="M55 48 Q60 53 65 48" stroke="hsl(var(--background))" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* Magic wand */}
      <g style={{ transformOrigin: '60px 90px', animation: 'wand 1s ease-in-out infinite' }}>
        <rect x="55" y="75" width="10" height="35" rx="3" fill="hsl(var(--foreground) / 0.6)" />
        <rect x="52" y="72" width="16" height="8" rx="2" fill="hsl(var(--primary))" />
      </g>
      {/* Magic sparkles */}
      <g className="animate-pulse">
        <circle cx="30" cy="50" r="3" fill="hsl(var(--primary) / 0.8)" />
        <circle cx="90" cy="45" r="4" fill="hsl(var(--primary) / 0.6)" />
        <circle cx="25" cy="80" r="2" fill="hsl(var(--primary) / 0.7)" />
        <circle cx="95" cy="75" r="3" fill="hsl(var(--primary) / 0.5)" />
      </g>
      {/* Floating stars */}
      <path d="M20 30 L22 35 L27 35 L23 38 L25 43 L20 40 L15 43 L17 38 L13 35 L18 35 Z" 
            fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '2s' }} />
      <path d="M100 55 L101 58 L104 58 L102 60 L103 63 L100 61 L97 63 L98 60 L96 58 L99 58 Z" 
            fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
    </g>
  </svg>
);

const CompleteCharacter = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    {/* Happy celebrating character */}
    <g>
      {/* Body */}
      <ellipse cx="60" cy="85" rx="25" ry="20" fill="hsl(142.1 76.2% 36.3% / 0.3)" />
      {/* Head */}
      <circle cx="60" cy="50" r="28" fill="hsl(142.1 76.2% 36.3% / 0.4)" />
      {/* Happy eyes */}
      <path d="M48 45 Q52 40 56 45" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M64 45 Q68 40 72 45" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Big smile */}
      <path d="M45 58 Q60 75 75 58" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="40" cy="55" rx="6" ry="4" fill="hsl(0 80% 80% / 0.5)" />
      <ellipse cx="80" cy="55" rx="6" ry="4" fill="hsl(0 80% 80% / 0.5)" />
      {/* Arms up celebrating */}
      <g className="animate-bounce" style={{ animationDuration: '0.5s' }}>
        <path d="M35 70 Q20 50 25 35" stroke="hsl(142.1 76.2% 36.3% / 0.5)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M85 70 Q100 50 95 35" stroke="hsl(142.1 76.2% 36.3% / 0.5)" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
      {/* Confetti */}
      <circle cx="20" cy="30" r="4" fill="hsl(var(--primary))" className="animate-ping" />
      <circle cx="100" cy="25" r="3" fill="#f59e0b" className="animate-ping" style={{ animationDelay: '0.2s' }} />
      <circle cx="30" cy="15" r="3" fill="#ec4899" className="animate-ping" style={{ animationDelay: '0.4s' }} />
      <circle cx="90" cy="40" r="4" fill="#8b5cf6" className="animate-ping" style={{ animationDelay: '0.6s' }} />
      {/* Check mark */}
      <circle cx="60" cy="50" r="12" fill="hsl(142.1 76.2% 36.3%)" className="animate-scale-in" />
      <path d="M54 50 L58 54 L66 46" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const ErrorCharacter = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    {/* Sad character */}
    <g>
      {/* Body */}
      <ellipse cx="60" cy="85" rx="25" ry="20" fill="hsl(var(--destructive) / 0.2)" />
      {/* Head */}
      <circle cx="60" cy="50" r="28" fill="hsl(var(--destructive) / 0.3)" />
      {/* Sad eyes */}
      <circle cx="50" cy="45" r="5" fill="hsl(var(--foreground))" />
      <circle cx="70" cy="45" r="5" fill="hsl(var(--foreground))" />
      {/* Tears */}
      <ellipse cx="45" cy="55" rx="3" ry="5" fill="hsl(200 80% 70%)" className="animate-pulse" />
      <ellipse cx="75" cy="55" rx="3" ry="5" fill="hsl(200 80% 70%)" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
      {/* Sad mouth */}
      <path d="M48 65 Q60 55 72 65" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* X marks */}
      <g className="animate-pulse">
        <path d="M20 25 L30 35 M30 25 L20 35" stroke="hsl(var(--destructive))" strokeWidth="3" strokeLinecap="round" />
        <path d="M90 30 L100 40 M100 30 L90 40" stroke="hsl(var(--destructive))" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const stageCharacters = {
  idle: null,
  compressing: UploadingCharacter,
  uploading: UploadingCharacter,
  processing: ProcessingCharacter,
  generating: GeneratingCharacter,
  complete: CompleteCharacter,
  error: ErrorCharacter,
  cancelled: ErrorCharacter,
};

const stageMessages = {
  compressing: '🗜️ Đang nén ảnh...',
  uploading: '☁️ Đang tải lên...',
  processing: '🧠 AI đang phân tích...',
  generating: '✨ Đang tạo phép màu...',
  complete: '🎉 Hoàn thành rồi!',
  error: '😢 Có lỗi xảy ra',
  cancelled: '⏹️ Đã hủy',
};

export const AIProgressBar = ({ progress, isVisible, onCancel }: AIProgressBarProps) => {
  if (!isVisible || progress.stage === 'idle' || progress.stage === 'cancelled') return null;

  const Character = stageCharacters[progress.stage];
  const canCancel = !['complete', 'error', 'cancelled'].includes(progress.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes wand {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
      `}</style>
      <div className="w-full max-w-sm mx-4 p-6 bg-card rounded-2xl border shadow-lg space-y-4">
        {/* Animated Character */}
        <div className="flex justify-center">
          {Character && <Character />}
        </div>

        {/* Message */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-lg text-foreground">
            {stageMessages[progress.stage as keyof typeof stageMessages] || progress.message}
          </h3>
          <p className="text-sm text-muted-foreground">{progress.message}</p>
        </div>

        {/* Cute progress indicator */}
        <div className="relative">
          {/* Background track */}
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            {/* Progress fill with gradient */}
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${progress.progress}%`,
                background: progress.stage === 'error' 
                  ? 'hsl(var(--destructive))' 
                  : progress.stage === 'complete'
                  ? 'hsl(142.1 76.2% 36.3%)'
                  : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
              }}
            >
              {/* Shimmer effect */}
              {!['complete', 'error'].includes(progress.stage) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>
          {/* Percentage badge */}
          <div 
            className={cn(
              "absolute -top-1 transform -translate-x-1/2 bg-card border-2 rounded-full px-2 py-0.5 text-xs font-bold shadow-sm transition-all duration-300",
              progress.stage === 'complete' ? 'border-green-500 text-green-500' :
              progress.stage === 'error' ? 'border-destructive text-destructive' :
              'border-primary text-primary'
            )}
            style={{ left: `${Math.max(10, Math.min(90, progress.progress))}%` }}
          >
            {progress.progress}%
          </div>
        </div>

        {/* Stage dots */}
        <div className="flex justify-center gap-2 pt-2">
          {['uploading', 'processing', 'generating', 'complete'].map((stage, index) => {
            const stages = ['uploading', 'processing', 'generating', 'complete'];
            const currentIndex = stages.indexOf(progress.stage);
            const isActive = progress.stage === stage;
            const isComplete = currentIndex > index || progress.stage === 'complete';
            
            return (
              <div key={stage} className="flex items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  isActive && "bg-primary scale-125 animate-pulse",
                  isComplete && "bg-green-500",
                  !isActive && !isComplete && "bg-muted"
                )} />
                {index < 3 && (
                  <div className={cn(
                    "w-6 h-0.5 mx-1",
                    isComplete ? "bg-green-500" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel button */}
        {canCancel && onCancel && (
          <Button 
            variant="outline" 
            className="w-full gap-2 mt-2"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
            Hủy xử lý
          </Button>
        )}
      </div>
    </div>
  );
};
