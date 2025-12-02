/**
 * Activity Comments
 *
 * Comment thread component for activities.
 */

'use client';

import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Send, MoreHorizontal, Edit, Trash2, Reply, Lock, Globe, Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
  internal: boolean;
  parentId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface ActivityCommentsProps {
  /** Comments list */
  comments: Comment[];

  /** Current user ID for edit/delete permissions */
  currentUserId: string;

  /** Loading state */
  isLoading?: boolean;

  /** Allow internal/external toggle */
  showVisibilityToggle?: boolean;

  /** Support @mentions */
  supportMentions?: boolean;

  /** Mention suggestions callback */
  onMentionSearch?: (query: string) => Array<{ id: string; name: string }>;

  /** Add comment handler */
  onAddComment?: (content: string, internal: boolean, parentId?: string) => void;

  /** Edit comment handler */
  onEditComment?: (commentId: string, content: string) => void;

  /** Delete comment handler */
  onDeleteComment?: (commentId: string) => void;

  /** Edit time limit in minutes (0 = no limit) */
  editTimeLimit?: number;

  /** Additional className */
  className?: string;
}

function CommentItem({
  comment,
  currentUserId,
  editTimeLimit = 0,
  onEdit,
  onDelete,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  currentUserId: string;
  editTimeLimit?: number;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  isReply?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = comment.author.id === currentUserId;
  const createdAt = new Date(comment.createdAt);
  const canEdit = isOwner && (
    editTimeLimit === 0 ||
    Date.now() - createdAt.getTime() < editTimeLimit * 60 * 1000
  );

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={cn('flex gap-3', isReply && 'ml-10')}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatarUrl} />
        <AvatarFallback className="text-xs">
          {comment.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
          {comment.internal && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Internal
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Only visible to team members</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditContent(comment.content);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
        )}

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {comment.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80"
              >
                <Paperclip className="h-3 w-3" />
                {attachment.name}
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2 mt-2">
            {onReply && !isReply && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onReply}>
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {(canEdit || isOwner) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwner && onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityComments({
  comments,
  currentUserId,
  isLoading = false,
  showVisibilityToggle = true,
  supportMentions = false,
  onMentionSearch,
  onAddComment,
  onEditComment,
  onDeleteComment,
  editTimeLimit = 15, // 15 minutes default
  className,
}: ActivityCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group comments by parent
  const topLevelComments = comments.filter(c => !c.parentId);
  const repliesMap = new Map<string, Comment[]>();
  comments.filter(c => c.parentId).forEach(c => {
    const replies = repliesMap.get(c.parentId!) || [];
    replies.push(c);
    repliesMap.set(c.parentId!, replies);
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment.trim(), isInternal, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Comments ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Be the first to add one.
          </p>
        )}

        {topLevelComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              editTimeLimit={editTimeLimit}
              onEdit={(content) => onEditComment?.(comment.id, content)}
              onDelete={() => onDeleteComment?.(comment.id)}
              onReply={() => setReplyingTo(comment.id)}
            />

            {/* Replies */}
            {repliesMap.get(comment.id)?.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                editTimeLimit={editTimeLimit}
                onEdit={(content) => onEditComment?.(reply.id, content)}
                onDelete={() => onDeleteComment?.(reply.id)}
                isReply
              />
            ))}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="ml-10 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px]"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim() || isSubmitting}>
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      {!replyingTo && (
        <div className="border-t pt-4 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showVisibilityToggle && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsInternal(!isInternal)}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md text-sm font-medium gap-1 px-2.5 h-9",
                          "ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isInternal ? "bg-accent text-accent-foreground" : "bg-transparent"
                        )}
                      >
                        {isInternal ? (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Internal
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5" />
                            External
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isInternal
                        ? 'Only visible to team members'
                        : 'Visible to clients if shared'
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityComments;
