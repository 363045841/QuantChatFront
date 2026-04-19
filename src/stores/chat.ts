/**
 * 聊天状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Slot, ChatSession } from '@/types/chat'
import { streamChat, clearSession as apiClearSession, listSessions, getSessionMessages } from '@/api/chat'
import { parseChartConfigs } from '@/utils/chartParser'

export const useChatStore = defineStore('chat', () => {
  /** 消息列表 */
  const messages = ref<Message[]>([])

  /** 当前会话ID */
  const sessionId = ref<string>('')

  /** 是否正在加载 */
  const isLoading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  /** 会话列表 */
  const sessions = ref<ChatSession[]>([])

  /** 是否正在加载会话列表 */
  const isLoadingSessions = ref(false)

  /** 当前会话标题 */
  const currentTitle = computed(() => {
    if (!sessionId.value) return null
    const session = sessions.value.find(s => s.id === sessionId.value)
    return session?.title
  })

  /**
   * 加载会话列表
   */
  async function loadSessions() {
    isLoadingSessions.value = true
    try {
      sessions.value = await listSessions()
    } catch (e) {
      console.error('Failed to load sessions:', e)
    } finally {
      isLoadingSessions.value = false
    }
  }

  /**
   * 切换到指定会话
   */
  async function switchSession(id: string) {
    if (id === sessionId.value) return

    sessionId.value = id
    messages.value = []
    error.value = null

    try {
      const historyMessages = await getSessionMessages(id)
      messages.value = historyMessages.map((m, index) => ({
        id: `${id}-${index}`,
        role: m.role,
        content: m.content,
        charts: m.role === 'assistant' ? parseChartConfigs(m.content) : [],
        timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
      }))
    } catch (e) {
      console.error('Failed to load session messages:', e)
    }
  }

  /**
   * 创建新会话
   */
  function createNewSession() {
    sessionId.value = ''
    messages.value = []
    error.value = null
  }

  /**
   * 发送消息
   * @param content 消息内容
   * @param slots 词槽数据
   */
  async function sendMessage(content: string, slots: Slot[] = []) {
    if (!content.trim() || isLoading.value) return

    error.value = null

    // 添加用户消息
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      slots,
      charts: [],
      timestamp: Date.now(),
    }
    messages.value.push(userMsg)

    // 创建助手消息占位
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      charts: [],
      timestamp: Date.now(),
      isStreaming: true,
    }
    messages.value.push(assistantMsg)
    isLoading.value = true

    try {
      // 流式请求
      for await (const chunk of streamChat(content, sessionId.value)) {
        // 更新会话ID
        if (chunk.session_id) {
          sessionId.value = chunk.session_id
        }
        // 追加内容
        if (chunk.content && chunk.content !== '[DONE]' && !chunk.content.startsWith('[ERROR]')) {
          assistantMsg.content += chunk.content
        }
      }

      // 流结束
      assistantMsg.isStreaming = false
      // 解析 chart 配置
      assistantMsg.charts = parseChartConfigs(assistantMsg.content)

      // 刷新会话列表
      await loadSessions()
    } catch (e) {
      assistantMsg.content = '请求失败，请稍后重试'
      assistantMsg.isStreaming = false
      error.value = e instanceof Error ? e.message : '未知错误'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清空当前会话
   */
  async function clearCurrentSession() {
    if (sessionId.value) {
      try {
        await apiClearSession(sessionId.value)
      } catch {
        // 忽略清空错误
      }
    }
    messages.value = []
    sessionId.value = ''
    error.value = null

    // 刷新会话列表
    await loadSessions()
  }

  /**
   * 删除指定会话
   */
  async function deleteSession(id: string) {
    if (id === sessionId.value) {
      // 如果删除的是当前会话，清空消息
      messages.value = []
      sessionId.value = ''
    }

    // 从列表中移除
    sessions.value = sessions.value.filter(s => s.id !== id)

    // TODO: 调用后端删除API（如果后端支持）
  }

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sessions,
    isLoadingSessions,
    currentTitle,
    loadSessions,
    switchSession,
    createNewSession,
    sendMessage,
    clearCurrentSession,
    deleteSession,
  }
})
