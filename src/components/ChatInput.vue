<template>
  <div class="input-container">
    <!-- Slot Tags Area -->
    <TransitionGroup
      v-if="slots.length > 0"
      name="slot-list"
      tag="div"
      class="slots-area"
    >
      <button
        v-for="slot in slots"
        :key="slot.value"
        class="slot-tag"
        :title="`点击移除: ${slot.value}`"
        @click="removeSlot(slot)"
      >
        <span class="slot-label">{{ slot.label }}</span>
        <span class="slot-value font-mono">{{ slot.value }}</span>
        <span class="slot-remove">×</span>
      </button>
    </TransitionGroup>

    <!-- Main Input Area -->
    <div class="input-main">
      <div class="input-wrapper">
        <div class="input-glow"></div>
        <input
          ref="inputRef"
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="isLoading"
          class="input-field"
          @keydown.enter.exact="handleSend"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <button
          class="send-button"
          :class="{ active: canSend }"
          :disabled="!canSend"
          @click="handleSend"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else class="send-icon">→</span>
        </button>
      </div>
    </div>

    <!-- Skill Selector -->
    <div class="skills-bar">
      <button
        v-for="skill in skills"
        :key="skill.id"
        class="skill-chip"
        :class="{ active: activeSkill === skill.id }"
        @click="toggleSkill(skill.id)"
      >
        <span class="skill-icon">{{ skill.icon }}</span>
        <span class="skill-name">{{ skill.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Slot, SkillType, Skill } from '@/types/chat'

const props = withDefaults(
  defineProps<{
    isLoading?: boolean
    placeholder?: string
  }>(),
  {
    isLoading: false,
    placeholder: '输入问题，探索市场洞察...',
  }
)

const emit = defineEmits<{
  send: [content: string, slots: Slot[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputText = ref('')
const slots = ref<Slot[]>([])
const isFocused = ref(false)
const activeSkill = ref<SkillType | null>(null)

const skills: Skill[] = [
  { id: 'hotspot', label: '热点', icon: '◉' },
  { id: 'target_price', label: '目标价', icon: '◎' },
  { id: 'news', label: '新闻', icon: '◈' },
  { id: 'announcement', label: '公告', icon: '◆' },
  { id: 'buy_sell', label: '买卖点', icon: '△' },
]

const canSend = computed(() => inputText.value.trim() && !props.isLoading)

function handleSend() {
  if (!canSend.value) return
  emit('send', inputText.value.trim(), [...slots.value])
  inputText.value = ''
  slots.value = []
}

function removeSlot(slot: Slot) {
  slots.value = slots.value.filter(s => s.value !== slot.value)
}

function toggleSkill(skillId: SkillType) {
  activeSkill.value = activeSkill.value === skillId ? null : skillId
}

function addSlot(slot: Slot) {
  if (!slots.value.some(s => s.value === slot.value)) {
    slots.value.push(slot)
  }
}

defineExpose({ addSlot, focus: () => inputRef.value?.focus() })
</script>

<style scoped>
.input-container {
  padding: var(--space-4) var(--space-6);
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border-subtle);
}

/* Slots Area */
.slots-area {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  min-height: 0;
}

.slot-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid var(--color-border-accent);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-accent-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.slot-tag:hover {
  background: rgba(0, 212, 170, 0.15);
  border-color: var(--color-accent-primary);
}

.slot-label {
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}

.slot-value {
  font-weight: 600;
  letter-spacing: var(--tracking-mono);
}

.slot-remove {
  margin-left: var(--space-1);
  font-size: var(--text-lg);
  line-height: 1;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.slot-tag:hover .slot-remove {
  opacity: 1;
}

/* Slot List Transitions */
.slot-list-enter-active,
.slot-list-leave-active {
  transition: all var(--transition-base);
}

.slot-list-enter-from,
.slot-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Input Main */
.input-main {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-glow);
}


.input-field {
  flex: 1;
  padding: var(--space-2) 0;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--text-lg);
  transition: all var(--transition-fast);
}

.send-button:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
}

.send-button.active {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
}

.send-button.active:hover {
  background: var(--color-accent-primary-dim);
}

.send-icon {
  display: block;
  transition: transform var(--transition-fast);
}

.send-button.active:hover .send-icon {
  transform: translateX(2px);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-text-muted);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skills Bar */
.skills-bar {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-subtle);
}

.skill-chip {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.skill-chip:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
}

.skill-chip.active {
  background: rgba(245, 166, 35, 0.1);
  border-color: var(--color-accent-secondary);
  color: var(--color-accent-secondary);
}

.skill-icon {
  font-size: var(--text-base);
}

.skill-name {
  font-weight: 500;
}
</style>
