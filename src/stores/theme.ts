/**
 * 主题状态管理
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'quantagent-theme'

function getInitialTheme(): Theme {
  // 1. 读取本地存储
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  // 2. 跟随系统
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

export const useThemeStore = defineStore('theme', () => {
  /** 当前主题 */
  const theme = ref<Theme>(getInitialTheme())

  /** 应用主题到 DOM */
  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
  }

  /** 切换主题 */
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  /** 设置主题 */
  function setTheme(t: Theme) {
    theme.value = t
  }

  // 监听变化，同步到 DOM 和 localStorage
  watch(
    theme,
    (t) => {
      applyTheme(t)
      localStorage.setItem(THEME_KEY, t)
    },
    { immediate: true }
  )

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
})
