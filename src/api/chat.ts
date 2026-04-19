/**
 * 聊天 API 封装
 */

import type { StreamChunk, ChatSession, HistoryMessage } from '@/types/chat'

const API_BASE = import.meta.env.VITE_CHAT_API_URL || ''

/**
 * 流式聊天请求
 * @param message 用户消息
 * @param sessionId 会话ID（可选）
 * @yields StreamChunk 流式响应块
 */
export async function* streamChat(
  message: string,
  sessionId?: string
): AsyncGenerator<StreamChunk> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }

  const response = await fetch(`${API_BASE}/api/chat/chat-stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim()
        if (jsonStr) {
          try {
            yield JSON.parse(jsonStr) as StreamChunk
          } catch {
            console.warn('Failed to parse SSE data:', jsonStr)
          }
        }
      }
    }
  }
}

/**
 * 非流式聊天请求（备用）
 */
export async function chat(
  message: string,
  sessionId?: string
): Promise<{ reply: string; session_id: string }> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }

  const response = await fetch(`${API_BASE}/api/chat/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  return response.json()
}

/**
 * 清空会话
 */
export async function clearSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat/clear-session`, {
    method: 'POST',
    headers: {
      'X-Session-Id': sessionId,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
}

/**
 * 获取会话列表
 */
export async function listSessions(limit: number = 20): Promise<ChatSession[]> {
  const response = await fetch(`${API_BASE}/api/chat/sessions?limit=${limit}`)

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const data = await response.json()
  return data.sessions
}

/**
 * 获取会话历史消息
 */
export async function getSessionMessages(sessionId: string): Promise<HistoryMessage[]> {
  const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`)

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  const data = await response.json()
  return data.messages
}
