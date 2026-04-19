<template>
  <div class="skill-selector">
    <button
      v-for="skill in skills"
      :key="skill.id"
      class="skill-btn"
      :class="{ active: activeSkill === skill.id }"
      @click="handleSelect(skill.id)"
      :title="skill.label"
    >
      <span class="skill-icon">{{ skill.icon }}</span>
      <span class="skill-label">{{ skill.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SkillType, Skill } from '@/types/chat'

const skills: Skill[] = [
  { id: 'hotspot', label: '热点', icon: '◉' },
  { id: 'target_price', label: '目标价', icon: '◎' },
  { id: 'news', label: '新闻', icon: '◈' },
  { id: 'announcement', label: '公告', icon: '◆' },
  { id: 'buy_sell', label: '买卖点', icon: '△' },
]

const activeSkill = ref<SkillType | null>(null)

const emit = defineEmits<{
  select: [skill: SkillType | null]
}>()

function handleSelect(skillId: SkillType) {
  if (activeSkill.value === skillId) {
    activeSkill.value = null
  } else {
    activeSkill.value = skillId
  }
  emit('select', activeSkill.value)
}
</script>

<style scoped>
.skill-selector {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.skill-selector::-webkit-scrollbar {
  display: none;
}

.skill-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  white-space: nowrap;
}

.skill-btn:hover {
  background: var(--color-bg-card);
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
}

.skill-btn.active {
  background: rgba(245, 166, 35, 0.1);
  border-color: var(--color-accent-secondary);
  color: var(--color-accent-secondary);
}

.skill-icon {
  font-size: var(--text-base);
  width: 16px;
  text-align: center;
}

.skill-label {
  font-weight: 500;
}
</style>
