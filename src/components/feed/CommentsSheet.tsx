import { useState, useEffect } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, zhCN, ko, ja, th } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface CommentsSheetProps {
  outfitId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentsSheet = ({ outfitId, isOpen, onClose, onCommentAdded }: CommentsSheetProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'vi': return vi;
      case 'zh': return zhCN;
      case 'ko': return ko;
      case 'ja': return ja;
      case 'th': return th;
      default: return enUS;
    }
  };

  useEffect(() => {
    if (isOpen && outfitId) {
      fetchComments();
    }
  }, [isOpen, outfitId]);

  const fetchComments = async () => {
    if (!outfitId) return;
    
    setIsLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('outfit_comments')
        .select('*')
        .eq('outfit_id', outfitId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        setComments(commentsData.map(comment => ({
          ...comment,
          user_profile: profileMap.get(comment.user_id) || undefined,
        })));
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(t('comments_cannot_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('comments_login_required'));
      return;
    }
    
    if (!newComment.trim() || !outfitId) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('outfit_comments')
        .insert({
          outfit_id: outfitId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user profile for the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      setComments(prev => [...prev, {
        ...data,
        user_profile: profile || undefined,
      }]);
      
      setNewComment('');
      onCommentAdded?.();
      toast.success(t('comments_added'));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(t('comments_cannot_add'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('outfit_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentAdded?.();
      toast.success(t('comments_deleted'));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(t('comments_cannot_delete'));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader className="text-center border-b border-border pb-3">
          <SheetTitle>{t('comments_title')}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100%-120px)] py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">{t('comments_no_comments')}</p>
              <p className="text-sm text-muted-foreground">{t('comments_be_first')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user_profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                      {comment.user_profile?.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold">
                          {comment.user_profile?.display_name || t('user')}
                        </span>
                        <span className="text-sm ml-2">{comment.content}</span>
                      </div>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: getLocale() 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            {user && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <Input
              placeholder={user ? t('comments_add_placeholder') : t('comments_login_to_comment')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user || isSubmitting}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!user || !newComment.trim() || isSubmitting}
              className="flex-shrink-0"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
