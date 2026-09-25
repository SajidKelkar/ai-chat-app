import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FullPageLoader } from '@/components/LoadingIndicator';
import { LoginDialog } from '@/components/LoginDialog';
import { SignupDialog } from '@/components/SignupDialog';
import { useAuth } from '@/context/AuthContext';
import {
  getRecentChats,
  createChat,
  deleteChat as apiDeleteChat,
  type NormalizedChat,
} from '@/api/chat';
import {
  getMessages,
  sendMessageToChat,
  type NormalizedMessage,
} from '@/api/message';
import { logout as apiLogout, deleteAccount as apiDeleteAccount } from '@/api/auth';
import { ApiError, isAuthError } from '@/api/client';

type AuthModal = 'login' | 'signup' | null;

export function ChatPage() {
  const { status, isAuthenticated, logoutFrontend } = useAuth();

  const [chats, setChats] = useState<NormalizedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<NormalizedMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [composerSeed, setComposerSeed] = useState<string | undefined>(undefined);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Confirm dialogs
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const activeChatRef = useRef<string | null>(null);
  activeChatRef.current = activeChatId;
  const wasAuthenticated = useRef(isAuthenticated);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (isAuthError(err)) {
        logoutFrontend();
      }
    },
    [logoutFrontend],
  );

  const loadChats = useCallback(async (showLoading = true) => {
  if (showLoading) {
    setLoadingChats(true);
  }

  try {
    const recent = await getRecentChats();
    setChats(recent);
    return recent;
  } catch (err) {
    if (!isAuthError(err)) {
      setError('Unable to load conversations. Please try again.');
    }
    handleAuthError(err);
    return [];
  } finally {
    if (showLoading) {
      setLoadingChats(false);
    }
  }
}, [handleAuthError]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      setLoadingMessages(true);
      setError(null);
      try {
        const msgs = await getMessages(chatId);
        setMessages(msgs);
      } catch (err) {
        if (isAuthError(err)) {
          handleAuthError(err);
          return;
        }
        setError('Unable to load messages. Please try again.');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [handleAuthError],
  );

  // Load chats when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      loadChats();
    }
  }, [status, loadChats]);

  // When user logs out, clear private state
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
      setError(null);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // After login via modal completes (isAuthenticated flips to true),
  // send the pending message if one was queued
  useEffect(() => {
    if (isAuthenticated && pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      handleSend(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pendingMessage]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      if (!isAuthenticated) {
        setAuthModal('login');
        return;
      }
      if (chatId === activeChatRef.current) {
        setSidebarOpen(false);
        return;
      }
      setActiveChatId(chatId);
      setMessages([]);
      setSidebarOpen(false);
      loadMessages(chatId);
    },
    [isAuthenticated, loadMessages],
  );

  const handleNewChat = useCallback(() => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }
    setSidebarOpen(false);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setComposerSeed(undefined);
  }, [isAuthenticated]);

  const handleDeleteChatClick = useCallback((chatId: string) => {
    setDeleteChatId(chatId);
  }, []);

  const confirmDeleteChat = useCallback(async () => {
    if (!deleteChatId) return;
    setDeletingChat(true);
    try {
      await apiDeleteChat(deleteChatId);
      setChats((prev) => prev.filter((c) => c.id !== deleteChatId));
      if (activeChatId === deleteChatId) {
        setActiveChatId(null);
        setMessages([]);
      }
      setDeleteChatId(null);
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError(err);
        return;
      }
      setError('Unable to delete conversation. Please try again.');
    } finally {
      setDeletingChat(false);
    }
  }, [deleteChatId, activeChatId, handleAuthError]);

  const handleSend = useCallback(
    async (content: string) => {
      if (isSending || !content.trim()) return;

      if (!isAuthenticated) {
        setPendingMessage(content);
        setAuthModal('login');
        return;
      }

      setError(null);
      setComposerSeed(undefined);

      const userMsg: NormalizedMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      };

      if (activeChatRef.current) {
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);
        try {
          const responseMsgs = await sendMessageToChat(activeChatRef.current!, content);
          if (responseMsgs.length > 0) {
            setMessages((prev) => [...prev, ...responseMsgs.filter((m) => m.role !== 'user' || !prev.some((p) => p.content === m.content && p.id === m.id))]);
          }
          loadChats(false);
        } catch (err) {
          if (isAuthError(err)) {
            handleAuthError(err);
            return;
          }
          const apiErr = err as ApiError;
          setError(apiErr.message || 'Something went wrong while sending your message.');
        } finally {
          setIsSending(false);
        }
      } else {
        // Create a chat first, then send the message
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);
        try {
          // Create chat
          const newChat = await createChat();
          setActiveChatId(newChat.id);
          // Send message to the new chat
          const responseMsgs = await sendMessageToChat(newChat.id, content);
          if (responseMsgs.length > 0) {
            setMessages((prev) => [...prev, ...responseMsgs.filter((m) => m.role !== 'user' || !prev.some((p) => p.content === m.content && p.id === m.id))]);
          }
          loadChats(false);
        } catch (err) {
          if (isAuthError(err)) {
            handleAuthError(err);
            return;
          }
          const apiErr = err as ApiError;
          setError(apiErr.message || 'Something went wrong while sending your message.');
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        } finally {
          setIsSending(false);
        }
      }
    },
    [isSending, isAuthenticated, loadChats, handleAuthError],
  );

  const handleExampleClick = useCallback((text: string) => {
    setComposerSeed(text + ' ');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // proceed regardless
    } finally {
      logoutFrontend();
    }
  }, [logoutFrontend]);

  const handleDeleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      await apiDeleteAccount();
      logoutFrontend();
      setShowDeleteAccount(false);
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError(err);
        return;
      }
      setError('Unable to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  }, [logoutFrontend, handleAuthError]);

  if (status === 'loading') {
    return <FullPageLoader label="Checking authentication…" />;
  }

  const activeChat = chats.find((c) => c.id === activeChatId);
  const headerTitle = activeChat?.title || 'New Chat';

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#101426]">
      <div className={`${sidebarCollapsed ? 'lg:hidden' : 'lg:flex'}`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChatClick}
          onLogout={handleLogout}
          onDeleteAccount={() => setShowDeleteAccount(true)}
          onLogin={() => setAuthModal('login')}
          onSignup={() => setAuthModal('signup')}
          isMobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          loadingChats={loadingChats}
        />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Sidebar toggle — fixed top-left of chat area */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1">
          <button onClick={() => setSidebarOpen(true)} className="icon-button bg-white/80 shadow-sm backdrop-blur-sm lg:hidden dark:bg-[#101426]/80" aria-label="Open sidebar"><Menu className="h-5 w-5" /></button>
          <button onClick={() => setSidebarCollapsed((v) => !v)} className="icon-button hidden bg-white/80 shadow-sm backdrop-blur-sm lg:flex dark:bg-[#101426]/80" aria-label="Toggle sidebar">{sidebarCollapsed ? <PanelLeft className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}</button>
        </div>

        {messages.length === 0 && !loadingMessages && !isSending ? (
          <EmptyState onExampleClick={handleExampleClick} />
        ) : (
          <MessageList
            messages={messages}
            isLoadingResponse={isSending}
            errorMessage={error}
          />
        )}

        {loadingMessages && messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <span className="text-sm">Loading messages…</span>
            </div>
          </div>
        )}

        <MessageInput
          onSend={handleSend}
          disabled={isSending}
          isSending={isSending}
          initialValue={composerSeed}
        />
      </div>

      {/* Auth modal */}
      {authModal === 'login' && (
        <LoginDialog
          onClose={() => {
            setAuthModal(null);
            setPendingMessage(null);
          }}
          onNavigate={(page) => setAuthModal(page)}
        />
      )}
      {authModal === 'signup' && (
        <SignupDialog
          onClose={() => {
            setAuthModal(null);
            setPendingMessage(null);
          }}
          onNavigate={(page) => setAuthModal(page)}
        />
      )}

      {/* Delete chat confirmation */}
      <ConfirmDialog
        open={deleteChatId !== null}
        title="Delete conversation?"
        message="This conversation and all its messages will be permanently deleted."
        confirmLabel="Delete"
        variant="danger"
        loading={deletingChat}
        onConfirm={confirmDeleteChat}
        onCancel={() => setDeleteChatId(null)}
      />

      {/* Delete account confirmation */}
      <ConfirmDialog
        open={showDeleteAccount}
        title="Delete account?"
        message="Are you sure you want to permanently delete your account and associated data? This action cannot be undone."
        confirmLabel="Delete account"
        variant="danger"
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />
    </div>
  );
}
