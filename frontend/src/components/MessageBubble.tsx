import { User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LoadingIndicator } from './LoadingIndicator';
import type { NormalizedMessage } from '@/api/message';

interface MessageBubbleProps {
  message: NormalizedMessage | { role: 'assistant'; content: ''; loading?: boolean };
  isLast?: boolean;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isLoading = 'loading' in message && message.loading;

  const handleCopy = () => {
    if (!message.content) return;

    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="group flex gap-4 px-4 py-5 animate-fade-in sm:px-6">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.08)] ring-1 ring-gray-200/60 dark:bg-gray-100 dark:ring-white/10">
          <img
            src="/logo.png"
            alt="Sova AI"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="flex flex-col gap-1.5 pt-0.5">
          <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
            Sova AI
          </span>

          <div className="rounded-2xl rounded-tl-md border border-gray-200/70 bg-white px-4 py-2.5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.035]">
            <LoadingIndicator />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-4 px-4 py-5 animate-slide-up sm:px-6 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ${
          isUser
            ? 'bg-gray-100 text-gray-600 ring-gray-200/70 dark:bg-gray-700 dark:text-gray-300 dark:ring-white/[0.08]'
            : 'overflow-hidden bg-white ring-gray-200/70 dark:bg-gray-100 dark:ring-white/10'
        }`}
      >
        {isUser ? (
          <User className="h-[17px] w-[17px]" />
        ) : (
          <img
            src="/logo.png"
            alt="Sova AI"
            className="h-full w-full object-cover object-center"
          />
        )}
      </div>

      {/* Message */}
      <div
        className={`flex min-w-0 max-w-[80%] flex-col gap-1.5 sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <span className="px-1 text-[12px] font-semibold tracking-wide text-gray-500 dark:text-gray-400">
          {isUser ? 'You' : 'Sova AI'}
        </span>

        <div
          className={`rounded-[20px] px-4 py-3 text-[0.95rem] leading-[1.75] transition-all duration-200 ${
            isUser
              ? 'rounded-tr-md bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-[0_5px_18px_rgba(37,99,235,0.16)]'
              : 'rounded-tl-md border border-gray-200/70 bg-white text-gray-800 shadow-[0_3px_14px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-[#181e2d] dark:text-gray-200 dark:shadow-none'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Copy */}
        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="mt-0.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-400 opacity-0 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
            aria-label="Copy message"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success-500" />
                <span className="text-success-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}