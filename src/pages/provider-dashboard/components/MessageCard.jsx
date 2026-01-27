import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MessageCard = ({ message, onReply, onViewThread }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`bg-card rounded-xl p-4 md:p-5 border smooth-transition hover:shadow-md cursor-pointer ${
      message?.unread ? 'border-primary bg-primary/5' : 'border-border'
    }`} onClick={() => onViewThread(message?.id)}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={message?.customerImage}
            alt={message?.customerImageAlt}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
          />
          {message?.unread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h4 className="font-semibold text-sm md:text-base text-foreground">{message?.customerName}</h4>
              <p className="text-xs text-muted-foreground">{message?.serviceType}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(message?.timestamp)}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{message?.lastMessage}</p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              iconName="Reply"
              iconPosition="left"
              onClick={(e) => {
                e?.stopPropagation();
                onReply(message?.id);
              }}
            >
              Reply
            </Button>
            {message?.hasAttachment && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="Paperclip" size={14} />
                <span>Attachment</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;