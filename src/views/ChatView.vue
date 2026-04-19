<template>
  <div class="chat-view">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <span class="brand-icon">◈</span>
          <span class="brand-name">QuantAgent</span>
        </div>
        <button class="new-chat-btn" @click="handleNewChat">
          <span class="btn-icon">+</span>
          <span>新对话</span>
        </button>
      </div>

      <!-- Session List -->
      <div class="session-section">
        <div class="section-header">
          <span class="section-title">历史记录</span>
          <button class="refresh-btn" @click="chatStore.loadSessions" :disabled="chatStore.isLoadingSessions">
            <span :class="{ 'spin': chatStore.isLoadingSessions }">↻</span>
          </button>
        </div>
        <div class="session-list">
          <button
            v-for="session in chatStore.sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: session.id === chatStore.sessionId }"
            @click="handleSwitchSession(session.id)"
          >
            <span class="session-icon">◉</span>
            <span class="session-title">{{ getSessionTitle(session) }}</span>
            <span class="session-count">{{ session.message_count }}</span>
          </button>
          <div v-if="chatStore.sessions.length === 0" class="empty-sessions">
            暂无历史记录
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="theme-btn" @click="themeStore.toggleTheme" :title="themeStore.theme === 'dark' ? '切换到白天模式' : '切换到夜间模式'">
          <span class="theme-icon">{{ themeStore.theme === 'dark' ? '☀' : '☾' }}</span>
          <span>{{ themeStore.theme === 'dark' ? '白天模式' : '夜间模式' }}</span>
        </button>
        <button class="clear-btn" @click="handleClear" :disabled="chatStore.isLoading || chatStore.messages.length === 0">
          <span class="clear-icon">↺</span>
          <span>清空对话</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <ChatContainer />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useThemeStore } from '@/stores/theme'
import ChatContainer from '@/components/ChatContainer.vue'
import type { ChatSession } from '@/types/chat'

const chatStore = useChatStore()
const themeStore = useThemeStore()

// 加载会话列表
onMounted(() => {
  chatStore.loadSessions()
})

function handleNewChat() {
  chatStore.createNewSession()
}

async function handleSwitchSession(sessionId: string) {
  await chatStore.switchSession(sessionId)
}

async function handleClear() {
  if (confirm('确定要清空当前对话吗？')) {
    await chatStore.clearCurrentSession()
  }
}

function getSessionTitle(session: ChatSession): string {
  if (session.title) return session.title
  // 使用日期作为默认标题
  const date = new Date(session.last_activity)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.chat-view {
  display: flex;
  height: 100vh;
  padding: var(--space-4);
  gap: var(--space-4);
}

/* Sidebar */
.sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  flex-shrink: 0;
}

.sidebar-header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: var(--space-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-accent-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  color: var(--color-text-inverse);
}

.brand-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-accent-primary);
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.new-chat-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  border-style: solid;
}

.btn-icon {
  font-size: var(--text-base);
  font-weight: 600;
}

/* Session Section */
.session-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.refresh-btn:hover:not(:disabled) {
  color: var(--color-accent-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.session-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.session-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: left;
  transition: all var(--transition-fast);
}

.session-item:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

.session-item.active {
  background: var(--color-border-accent);
  color: var(--color-accent-primary);
}

.session-icon {
  font-size: var(--text-xs);
  opacity: 0.6;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  padding: var(--space-1);
  background: var(--color-bg-surface);
  border-radius: var(--radius-sm);
  min-width: 20px;
  text-align: center;
}

.empty-sessions {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* Footer */
.sidebar-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.theme-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.theme-icon {
  font-size: var(--text-base);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.clear-btn:hover:not(:disabled) {
  background: rgba(255, 82, 82, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clear-icon {
  font-size: var(--text-base);
}

/* Main Content */
.main-content {
  flex: 1;
  min-width: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-view {
    padding: var(--space-2);
  }

  .sidebar {
    display: none;
  }
}
</style>
