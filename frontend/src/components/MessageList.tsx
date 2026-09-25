import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { NormalizedMessage } from '@/api/message';

interface MessageListProps {
  messages: NormalizedMessage[];
  isLoadingResponse: boolean;
  errorMessage: string | null;
}

export function MessageList({ messages, isLoadingResponse, errorMessage }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoadingResponse]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoadingResponse && (
          <MessageBubble message={{ role: 'assistant', content: '', loading: true }} />
        )}
        {errorMessage && (
          <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            <span>{errorMessage}</span>
          </div>
        )}
        <div ref={endRef} className="h-4" />
      </div>
    </div>
  );
}
