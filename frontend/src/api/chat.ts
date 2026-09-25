import { apiRequest } from './client';
import { DEFAULT_MODEL } from './config';

export interface RawChat {
  _id?: string;
  id?: string;
  chatId?: string;
  title?: string;
  topic?: string;
  name?: string;
  model?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: string;
  messages?: unknown[];
  [key: string]: unknown;
}

export interface NormalizedChat {
  id: string;
  title: string;
  model: string;
  createdAt?: string;
  updatedAt?: string;
}

function extractArray(data: unknown): RawChat[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data as RawChat[];
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.chats)) {
      return obj.chats as RawChat[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as RawChat[];
    }

    if (Array.isArray(obj.result)) {
      return obj.result as RawChat[];
    }
  }

  return [];
}

function normalizeChat(raw: RawChat): NormalizedChat {
  const id = String(raw.chatId || raw._id || raw.id || '');

  let title =
    raw.topic ||
    raw.title ||
    raw.name ||
    '';

  if (!title) {
    if (raw.lastMessage) {
      title = String(raw.lastMessage).slice(0, 40);
    } else if (
      raw.messages &&
      Array.isArray(raw.messages) &&
      raw.messages.length > 0
    ) {
      const first = raw.messages[0] as Record<string, unknown>;

      title = String(
        first.content || first.text || ''
      ).slice(0, 40);
    }
  }

  return {
    id,
    title: title || 'New Conversation',
    model: raw.model || DEFAULT_MODEL,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function getRecentChats() {
  return apiRequest<unknown>('/api/chat/getRecentChats').then((data) =>
    extractArray(data).map(normalizeChat),
  );
}

export function createChat(model = DEFAULT_MODEL) {
  return apiRequest<unknown>('/api/chat/createChat', {
    method: 'POST',
    body: {
      model,
    },
  }).then((data) => {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      // Backend returns:
      // {
      //   message,
      //   chatId,
      //   userId,
      //   model,
      //   topic,
      //   createdAt
      // }

      if (obj.chatId) {
        return normalizeChat({
          chatId: String(obj.chatId),
          model: obj.model
            ? String(obj.model)
            : model,
          topic: obj.topic
            ? String(obj.topic)
            : 'New Conversation',
          createdAt: obj.createdAt
            ? String(obj.createdAt)
            : undefined,
        });
      }

      if (obj.chat) {
        return normalizeChat(obj.chat as RawChat);
      }

      if (obj._id || obj.id) {
        return normalizeChat(obj as RawChat);
      }

      if (obj.data && typeof obj.data === 'object') {
        return normalizeChat(obj.data as RawChat);
      }
    }

    return normalizeChat(data as RawChat);
  });
}

export function getChat(chatId: string) {
  return apiRequest<unknown>(`/api/chat/${chatId}`).then((data) => {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      if (obj.chat) {
        return normalizeChat(obj.chat as RawChat);
      }

      if (obj.chatId || obj._id || obj.id) {
        return normalizeChat(obj as RawChat);
      }
    }

    return normalizeChat(data as RawChat);
  });
}

export function deleteChat(chatId: string) {
  return apiRequest<unknown>(`/api/chat/${chatId}`, {
    method: 'DELETE',
  });
}