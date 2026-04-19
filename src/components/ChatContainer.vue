<template>
  <div class="chat-container">
    <MessageList
      :messages="chatStore.messages"
      @showChart="handleShowChart"
      @sendSuggestion="handleSendSuggestion"
    />
    <ChatInput
      ref="inputRef"
      :isLoading="chatStore.isLoading"
      @send="handleSend"
    />
    <ChartModal
      :visible="!!activeChart"
      :config="activeChart?.config || null"
      @close="activeChart = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { Slot, ChartConfig } from '@/types/chat'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import ChartModal from './ChartModal.vue'

const chatStore = useChatStore()
const inputRef = ref<InstanceType<typeof ChatInput> | null>(null)
const activeChart = ref<ChartConfig | null>(null)

async function handleSend(content: string, slots: Slot[]) {
  await chatStore.sendMessage(content, slots)
}

function handleSendSuggestion(suggestion: string) {
  chatStore.sendMessage(suggestion, [])
}

function handleShowChart(chart: ChartConfig) {
  activeChart.value = chart
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
</style>
