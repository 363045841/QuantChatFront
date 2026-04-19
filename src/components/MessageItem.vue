<template>
  <div class="message" :class="[message.role, { streaming: message.isStreaming }]">
    <!-- Avatar -->
    <div class="avatar" :class="message.role">
      <span v-if="message.role === 'user'">You</span>
      <span v-else class="ai-avatar">AI</span>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- User Message -->
      <template v-if="message.role === 'user'">
        <div class="message-bubble user">
          <div class="message-text" v-html="formattedContent"></div>
          <div v-if="message.slots?.length" class="user-slots">
            <span v-for="slot in message.slots" :key="slot.value" class="slot-mini">
              {{ slot.label }}: <span class="font-mono">{{ slot.value }}</span>
            </span>
          </div>
        </div>
      </template>

      <!-- Assistant Message -->
      <template v-else>
        <div class="message-bubble assistant">
          <div class="message-text" v-html="formattedContent"></div>

          <!-- Streaming Cursor -->
          <span v-if="message.isStreaming" class="typing-cursor"></span>
        </div>

        <!-- Chart Cards -->
        <TransitionGroup
          v-if="message.charts.length > 0"
          name="chart-list"
          tag="div"
          class="chart-cards"
        >
          <ChartCard
            v-for="(chart, index) in message.charts"
            :key="chart.id"
            :chart="chart"
            :index="index"
            @click="$emit('showChart', chart)"
          />
        </TransitionGroup>
      </template>

      <!-- Timestamp -->
      <div class="timestamp">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message, ChartConfig } from '@/types/chat'
import { removeChartTags } from '@/utils/chartParser'
import ChartCard from './ChartCard.vue'

const props = defineProps<{ message: Message }>()

defineEmits<{
  showChart: [chart: ChartConfig]
}>()

const formattedContent = computed(() => {
  let content = props.message.content
  content = removeChartTags(content)

  // Markdown conversion
  content = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `<p>${content}</p>`
})

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.message {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  animation: slideUp var(--transition-base) ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

/* Avatar */
.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.avatar.user {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
}

.avatar.assistant {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  color: var(--color-accent-primary);
}

.ai-avatar {
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-mono);
}

/* Content */
.content {
  flex: 1;
  min-width: 0;
  max-width: 85%;
}

.message.user .content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* Message Bubble */
.message-bubble {
  display: inline-block;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.message-bubble.user {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  border-bottom-right-radius: var(--radius-sm);
}

.message-bubble.assistant {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  border-bottom-left-radius: var(--radius-sm);
}

.message-text {
  word-break: break-word;
}

.message-text :deep(h1) {
  font-size: var(--text-xl);
  font-weight: 700;
  margin: var(--space-4) 0 var(--space-2);
  color: var(--color-text-primary);
}

.message-text :deep(h2) {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: var(--space-3) 0 var(--space-2);
  color: var(--color-text-primary);
}

.message-text :deep(h3) {
  font-size: var(--text-base);
  font-weight: 600;
  margin: var(--space-2) 0 var(--space-1);
  color: var(--color-text-primary);
}

.message-text :deep(li) {
  margin-left: var(--space-4);
  padding-left: var(--space-1);
}

.message-text :deep(strong) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.message-text :deep(code.inline-code) {
  display: inline;
  padding: 0.1em 0.4em;
  background: rgba(0, 212, 170, 0.1);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--color-accent-primary);
}

/* User Slots */
.user-slots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.slot-mini {
  font-size: var(--text-xs);
  opacity: 0.9;
}

.slot-mini .font-mono {
  font-weight: 600;
}

/* Typing Cursor */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--color-accent-primary);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Timestamp */
.timestamp {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-mono);
}

/* Chart Cards */
.chart-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

/* Chart List Transitions */
.chart-list-enter-active {
  transition: all var(--transition-slow);
}

.chart-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.chart-list-leave-active {
  transition: all var(--transition-fast);
}

.chart-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
