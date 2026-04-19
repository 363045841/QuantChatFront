<template>
  <div class="message-list" ref="listRef">
    <!-- Empty State -->
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-visual">
        <div class="visual-ring"></div>
        <div class="visual-ring"></div>
        <div class="visual-ring"></div>
        <div class="visual-core">
          <span class="core-icon">◈</span>
        </div>
      </div>
      <h2 class="empty-title">开始对话</h2>
      <p class="empty-subtitle">探索市场洞察，获取投研分析</p>
      <div class="empty-suggestions">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          class="suggestion-chip"
          @click="$emit('sendSuggestion', suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <TransitionGroup name="message-list" tag="div" class="messages-container">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @showChart="$emit('showChart', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message, ChartConfig } from '@/types/chat'
import MessageItem from './MessageItem.vue'

const props = defineProps<{ messages: Message[] }>()

const emit = defineEmits<{
  showChart: [chart: ChartConfig]
  sendSuggestion: [suggestion: string]
}>()

const listRef = ref<HTMLElement | null>(null)

const suggestions = [
  '分析贵州茅台最近的走势',
  '查询三六零的AI业务进展',
  '比亚迪目标价位分析',
]

// Auto-scroll to bottom
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight
      }
    })
  },
  { deep: true }
)
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.messages-container {
  display: flex;
  flex-direction: column;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-visual {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-8);
}

.visual-ring {
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
  animation: pulse-ring 3s ease-in-out infinite;
}

.visual-ring:nth-child(2) {
  inset: 15px;
  animation-delay: 0.5s;
}

.visual-ring:nth-child(3) {
  inset: 30px;
  animation-delay: 1s;
}

.visual-core {
  position: absolute;
  inset: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-primary);
  border-radius: 50%;
  box-shadow: var(--shadow-glow-strong);
}

.core-icon {
  font-size: var(--text-2xl);
  color: var(--color-text-inverse);
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.empty-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
}

.empty-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
  max-width: 500px;
}

.suggestion-chip {
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.suggestion-chip:hover {
  background: var(--color-bg-card);
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

/* Message List Transitions */
.message-list-enter-active {
  transition: all var(--transition-base);
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
</style>
