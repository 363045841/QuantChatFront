<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <!-- Backdrop Grain -->
        <div class="backdrop-grain"></div>

        <!-- Modal Container -->
        <div class="modal-container">
          <!-- Header -->
          <header class="modal-header">
            <div class="header-left">
              <span class="header-label">K线图</span>
              <span v-if="safeConfig" class="header-symbol font-mono">{{ safeConfig.data.symbol }}</span>
            </div>
            <button class="close-btn" @click="$emit('close')" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </header>

          <!-- Chart Area -->
          <div class="modal-body">
            <div v-if="safeConfig" class="chart-wrapper">
              <KLineChart
                :semanticConfig="safeConfig"
                :kWidth="8"
                :kGap="2"
                :yPaddingPx="24"
              />
            </div>
          </div>

          <!-- Footer -->
          <footer class="modal-footer">
            <div v-if="safeConfig" class="footer-info">
              <span class="info-item">
                <span class="info-label">周期</span>
                <span class="info-value">{{ safeConfig.data.period }}</span>
              </span>
              <span class="info-divider">|</span>
              <span class="info-item">
                <span class="info-label">复权</span>
                <span class="info-value">{{ adjustLabel }}</span>
              </span>
              <span class="info-divider">|</span>
              <span class="info-item">
                <span class="info-label">数据源</span>
                <span class="info-value">{{ safeConfig.data.source }}</span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { KLineChart } from '@363045841yyt/klinechart'
import type { SemanticChartConfig } from '@/types/chat'

const props = defineProps<{
  visible: boolean
  config: SemanticChartConfig | null
}>()

defineEmits<{ close: [] }>()

// 副图指标允许的 params 字段
const ALLOWED_SUB_PARAMS: Record<string, Set<string>> = {
  VOLUME: new Set(),
  MACD: new Set(['fast', 'slow', 'signal']),
  RSI: new Set(['period1', 'period2', 'period3']),
  CCI: new Set(['period']),
  STOCH: new Set(['n', 'm']),
  MOM: new Set(['period']),
  WMSR: new Set(['period']),
  KST: new Set(['roc1', 'roc2', 'roc3', 'roc4', 'signal']),
  FASTK: new Set(['period']),
}

// 允许的 marker shape
const ALLOWED_SHAPES = new Set(['arrow_up', 'arrow_down', 'flag', 'circle', 'rectangle', 'diamond'])

/**
 * 清洗配置，移除无效字段
 */
function sanitizeConfig(config: SemanticChartConfig): SemanticChartConfig {
  const sanitized = JSON.parse(JSON.stringify(config))

  // 清洗副图指标
  if (sanitized.indicators?.sub) {
    sanitized.indicators.sub = sanitized.indicators.sub
      .filter((indicator: { type: string }) => ALLOWED_SUB_PARAMS.hasOwnProperty(indicator.type))
      .map((indicator: { type: string; params?: Record<string, unknown> }) => {
        if (indicator.params) {
          const allowed = ALLOWED_SUB_PARAMS[indicator.type]
          if (!allowed || allowed.size === 0) {
            delete indicator.params
          } else {
            const cleanParams: Record<string, unknown> = {}
            for (const key of Object.keys(indicator.params)) {
              if (allowed.has(key)) {
                cleanParams[key] = indicator.params[key]
              }
            }
            indicator.params = Object.keys(cleanParams).length > 0 ? cleanParams : undefined
          }
        }
        return indicator
      })
  }

  // 清洗主图指标
  if (sanitized.indicators?.main) {
    const allowedMain = new Set(['MA', 'BOLL'])
    sanitized.indicators.main = sanitized.indicators.main
      .filter((indicator: { type: string }) => allowedMain.has(indicator.type))
      .map((indicator: { type: string; params?: Record<string, unknown> }) => {
        if (indicator.params) {
          if (indicator.type === 'MA') {
            indicator.params = { periods: indicator.params.periods || [5, 10, 20, 60] }
          } else if (indicator.type === 'BOLL') {
            const cleanParams: Record<string, unknown> = {}
            if (typeof indicator.params.period === 'number') cleanParams.period = indicator.params.period
            if (typeof indicator.params.multiplier === 'number') cleanParams.multiplier = indicator.params.multiplier
            indicator.params = Object.keys(cleanParams).length > 0 ? cleanParams : undefined
          }
        }
        return indicator
      })
  }

  // 清洗 markers
  if (sanitized.markers?.customMarkers) {
    sanitized.markers.customMarkers = sanitized.markers.customMarkers
      .filter((marker: { shape: string }) => ALLOWED_SHAPES.has(marker.shape))
  }

  return sanitized
}

// 清洗后的配置
const safeConfig = computed(() => {
  if (!props.config) return null
  return sanitizeConfig(props.config)
})

// 输出图表配置到控制台
watch(
  () => props.config,
  (config) => {
    if (config) {
      console.log('📊 Original Config:', JSON.stringify(config, null, 2))
      console.log('📊 Sanitized Config:', JSON.stringify(safeConfig.value, null, 2))
    }
  },
  { immediate: true }
)

const adjustLabel = computed(() => {
  if (!props.config) return ''
  const map: Record<string, string> = {
    qfq: '前复权',
    hfq: '后复权',
    none: '不复权',
  }
  return map[props.config.data.adjust] || props.config.data.adjust
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
}

.backdrop-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: var(--noise-opacity);
  pointer-events: none;
}

.modal-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.header-symbol {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-accent-primary);
  letter-spacing: var(--tracking-mono);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}

/* Body */
.modal-body {
  flex: 1;
  overflow: hidden;
  background: var(--color-bg-base);
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  /* 使用组件库 CSS 变量设置尺寸 */
  --kmap-chart-height: 100%;
  --kmap-chart-width: 100%;
}


/* Footer */
.modal-footer {
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.info-label {
  color: var(--color-text-muted);
}

.info-value {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-mono);
}

.info-divider {
  color: var(--color-border-default);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-slow);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform var(--transition-slow), opacity var(--transition-slow);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>
