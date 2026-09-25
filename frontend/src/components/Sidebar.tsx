import { useState } from 'react';
import {
  MessageSquare,
  Trash2,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  X,
  User as UserIcon,
  LogIn,
  PenSquare,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { NormalizedChat } from '@/api/chat';

interface SidebarProps {
  chats: NormalizedChat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onLogin: () => void;
  onSignup: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  loadingChats: boolean;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLogout,
  onDeleteAccount,
  onLogin,
  onSignup,
  isMobileOpen,
  onCloseMobile,
  loadingChats,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-gray-200/80 bg-[#f8f9fc] shadow-[4px_0_24px_rgba(15,23,42,0.03)] transition-transform duration-300 dark:border-white/[0.06] dark:bg-[#0d111c] dark:shadow-none lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-[64px] items-center justify-between border-b border-gray-200/70 px-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-gray-200/70 dark:bg-white/10 dark:ring-white/10">
              {!logoError && (
                <img
                  src="/logo.png"
                  alt="Sova AI"
                  className="h-full w-full object-cover object-center"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>

            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">
                Sova AI
              </p>
              <p className="text-[10px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
                AI ASSISTANT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-200/70 hover:text-gray-800 active:scale-95 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-[17px] w-[17px]" />
              ) : (
                <Moon className="h-[17px] w-[17px]" />
              )}
            </button>

            <button
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-gray-200/70 hover:text-gray-800 active:scale-95 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-200 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4">
          <button
            onClick={onNewChat}
            className="group flex w-full items-center gap-2.5 rounded-2xl border border-gray-200/70 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary-200 hover:shadow-[0_8px_22px_rgba(37,99,235,0.10)] active:translate-y-0 active:scale-[0.99] dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-gray-100 dark:shadow-none dark:hover:border-primary-500/30 dark:hover:bg-white/[0.07]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-transform duration-200 group-hover:scale-105 dark:bg-primary-500/10 dark:text-primary-300">
              <PenSquare className="h-[15px] w-[15px]" />
            </div>

            <span>New Chat</span>
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-5">
          <div className="mb-2.5 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
              Recent
            </span>
          </div>

          <div className="space-y-1">
            {loadingChats &&
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-xl bg-gray-200/60 dark:bg-white/[0.045]"
                />
              ))}

            {!isAuthenticated && !loadingChats && (
              <div className="rounded-xl border border-dashed border-gray-300/80 bg-white/40 px-3 py-4 text-xs leading-relaxed text-gray-400 dark:border-white/[0.09] dark:bg-white/[0.02] dark:text-gray-500">
                Sign in to save and view your conversations.
              </div>
            )}

            {isAuthenticated && !loadingChats && chats.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300/80 bg-white/40 px-3 py-4 text-xs leading-relaxed text-gray-400 dark:border-white/[0.09] dark:bg-white/[0.02] dark:text-gray-500">
                No conversations yet. Start a new chat to begin.
              </div>
            )}

            {isAuthenticated &&
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                    activeChatId === chat.id
                      ? 'border-primary-200/60 bg-primary-50 font-medium text-primary-700 shadow-sm dark:border-primary-500/15 dark:bg-primary-500/[0.09] dark:text-primary-300'
                      : 'border-transparent text-gray-600 hover:border-gray-200/60 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:border-white/[0.05] dark:hover:bg-white/[0.045]'
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onSelectChat(chat.id);
                  }}
                >
                  <MessageSquare
                    className={`h-4 w-4 flex-shrink-0 transition-colors ${
                      activeChatId === chat.id
                        ? 'text-primary-500'
                        : 'opacity-50'
                    }`}
                  />

                  <span className="flex-1 truncate">{chat.title}</span>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Account */}
        <div className="border-t border-gray-200/70 bg-white/30 p-3 dark:border-white/[0.06] dark:bg-transparent">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-gray-200/60 hover:bg-white hover:shadow-sm dark:hover:border-white/[0.05] dark:hover:bg-white/[0.045]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm">
                  <UserIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 overflow-hidden text-left">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                    {user?.email || 'Account'}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)] dark:border-white/[0.08] dark:bg-[#171c2b] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06]"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Log out
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-white/[0.07]" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteAccount();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-error-600 transition-colors hover:bg-red-50 dark:text-error-400 dark:hover:bg-red-500/[0.08]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                onClick={onLogin}
                className="flex w-full items-center gap-2.5 rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/20 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </button>

              <button
                onClick={onSignup}
                className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}