<template>
  <div
    class="chart-card"
    :style="{ animationDelay: `${(index ?? 0) * 100}ms` }"
    @click="$emit('click')"
  >
    <!-- Visual Accent -->
    <div class="card-accent"></div>

    <!-- Icon Section -->
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 16l4-4 4 4 5-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Info Section -->
    <div class="card-info">
      <div class="card-label">K线图</div>
      <div class="card-symbol font-mono">{{ symbol }}</div>
      <div class="card-meta">
        <span class="meta-item">
          <span class="meta-dot"></span>
          {{ period }}
        </span>
        <span class="meta-item">
          <span class="meta-dot"></span>
          {{ dateRange }}
        </span>
      </div>
    </div>

    <!-- Action Hint -->
    <div class="card-action">
      <span class="action-text">查看</span>
      <span class="action-arrow">→</span>
    </div>

    <!-- Hover Glow -->
    <div class="card-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChartConfig } from '@/types/chat'

const props = defineProps<{
  chart: ChartConfig
  index?: number
}>()

defineEmits<{ click: [] }>()

const symbol = computed(() => props.chart.config.data.symbol)

const period = computed(() => {
  const periodMap: Record<string, string> = {
    daily: '日K',
    weekly: '周K',
    monthly: '月K',
    '5min': '5分',
    '15min': '15分',
    '30min': '30分',
    '60min': '60分',
  }
  return periodMap[props.chart.config.data.period] || props.chart.config.data.period
})

const dateRange = computed(() => {
  const { startDate, endDate } = props.chart.config.data
  return `${startDate.slice(5)} ~ ${endDate.slice(5)}`
})
</script>

<style scoped>
.chart-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-base);
  animation: slideUp var(--transition-base) ease-out backwards;
}

.chart-card:hover {
  border-color: var(--color-accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.chart-card:active {
  transform: translateY(0);
}

/* Accent Line */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent-primary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.chart-card:hover .card-accent {
  opacity: 1;
}

/* Icon */
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(0, 212, 170, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

/* Info */
.card-info {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.card-symbol {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-top: var(--space-1);
  letter-spacing: var(--tracking-mono);
}

.card-meta {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-dot {
  width: 4px;
  height: 4px;
  background: var(--color-accent-primary);
  border-radius: 50%;
}

/* Action */
.card-action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-hover);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-accent-primary);
  transition: all var(--transition-fast);
}

.chart-card:hover .card-action {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
}

.action-arrow {
  transition: transform var(--transition-fast);
}

.chart-card:hover .action-arrow {
  transform: translateX(4px);
}

/* Glow Effect */
.card-glow {
  position: absolute;
  inset: 0;
  background: rgba(0, 212, 170, 0.05);
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.chart-card:hover .card-glow {
  opacity: 1;
}
</style>
