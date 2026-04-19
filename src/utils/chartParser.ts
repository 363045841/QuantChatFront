/**
 * Chart 配置解析工具
 */

import type { ChartConfig, SemanticChartConfig } from '@/types/chat'

/**
 * 解析消息内容中的 <chart> 标签，提取 JSON 配置
 * @param content 消息内容
 * @returns 解析后的 chart 配置数组
 */
export function parseChartConfigs(content: string): ChartConfig[] {
  const pattern = /<chart>\s*([\s\S]*?)\s*<\/chart>/g
  const configs: ChartConfig[] = []

  let match
  while ((match = pattern.exec(content)) !== null) {
    const jsonStr = match[1]?.trim() ?? ''
    try {
      const config = JSON.parse(jsonStr) as SemanticChartConfig
      // 基本验证
      if (config.version && config.data && config.data.symbol) {
        configs.push({
          id: crypto.randomUUID(),
          config,
          rawJson: jsonStr,
        })
      }
    } catch (e) {
      console.warn('Invalid chart JSON:', e)
    }
  }
  return configs
}

/**
 * 从消息内容中移除 <chart> 标签（用于显示）
 * @param content 消息内容
 * @returns 清理后的内容
 */
export function removeChartTags(content: string): string {
  return content.replace(/<chart>[\s\S]*?<\/chart>/g, '').trim()
}

/**
 * 验证股票代码格式
 * @param code 股票代码
 * @returns 是否有效
 */
export function validateStockCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}
