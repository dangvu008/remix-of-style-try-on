import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';

// Các animation Lottie vui nhộn
const lottieAnimations = {
  // Loading chung
  default: 'https://lottie.host/4db68bbd-31f6-4cd8-84eb-189571e2a7b2/VJVHHsqPJl.lottie', // cute loading
  // Quần áo
  clothing: 'https://lottie.host/0c5e8c0a-6af5-4b32-bdbd-25d0d04f7980/W8dWzCXoD9.lottie', // clothes hanger
  // Tìm kiếm
  search: 'https://lottie.host/e8c8c8c8-1234-5678-9abc-def012345678/search.lottie',
  // Trái tim
  heart: 'https://lottie.host/5be1e31c-5cb4-4c8e-bc69-ff456b4cc7c0/YmWTlWOYdM.lottie', // celebration
  // Xóa
  trash: 'https://lottie.host/77bd4b33-f8d0-4c08-9e4d-4a45d4e9e556/T5lmKhJlLP.lottie',
  // Tải lên
  upload: 'https://lottie.host/1d9c8fa8-1f07-4e26-a906-46a6f76c1c54/qGQNKNuMJM.lottie',
  // Xử lý
  processing: 'https://lottie.host/c2e8b9fc-c7ae-4eab-9b54-5f0f67e9c548/GWEqPF1Tza.lottie',
  // Magic
  magic: 'https://lottie.host/d10e8b97-a4d3-4f9e-b0f8-7e9cdef05ec8/5EF3wJWe17.lottie',
};

type AnimationType = keyof typeof lottieAnimations;

interface FunLoadingProps {
  type?: AnimationType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  subMessage?: string;
  className?: string;
  showEmoji?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

// Các emoji loading vui nhộn
const loadingEmojis = ['👗', '👔', '👠', '👜', '🎀', '✨', '💫', '🌟'];

export const FunLoading = ({
  type = 'default',
  size = 'md',
  message,
  subMessage,
  className,
  showEmoji = true,
}: FunLoadingProps) => {
  const lottieUrl = lottieAnimations[type];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <DotLottieReact
          src={lottieUrl}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
        {showEmoji && (
          <div className="absolute -top-1 -right-1 text-lg animate-bounce">
            {loadingEmojis[Math.floor(Math.random() * loadingEmojis.length)]}
          </div>
        )}
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-pulse">{message}</p>
      )}
      {subMessage && (
        <p className="text-xs text-muted-foreground">{subMessage}</p>
      )}
    </div>
  );
};

// Component spinner đơn giản với animation vui
interface FunSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FunSpinner = ({ size = 'md', className }: FunSpinnerProps) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('relative', sizeMap[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      {/* Spinning ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
    </div>
  );
};

// Component loading overlay với animation vui
interface FunLoadingOverlayProps {
  isVisible: boolean;
  type?: AnimationType;
  message?: string;
  subMessage?: string;
}

export const FunLoadingOverlay = ({
  isVisible,
  type = 'clothing',
  message = 'Đang xử lý...',
  subMessage,
}: FunLoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-xl p-6 max-w-xs w-full shadow-medium space-y-4 border border-border">
        <FunLoading type={type} size="lg" message={message} subMessage={subMessage} />
        
        {/* Animated dots */}
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: 'bounce 1s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress bar vui nhộn
interface FunProgressBarProps {
  progress: number;
  message?: string;
  className?: string;
}

export const FunProgressBar = ({ progress, message, className }: FunProgressBarProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {message && (
        <p className="text-sm text-center text-muted-foreground">{message}</p>
      )}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
        
        {/* Cute emoji at progress end */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-sm transition-all duration-500"
          style={{ left: `calc(${Math.max(5, progress)}% - 8px)` }}
        >
          {progress < 100 ? '🏃' : '🎉'}
        </div>
      </div>
      
      {/* Percentage */}
      <p className="text-xs text-center text-muted-foreground font-medium">
        {progress}% {progress === 100 ? '✨ Hoàn thành!' : ''}
      </p>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
