/**
 * 聊天相关类型定义
 */

/** 词槽数据结构 */
export interface Slot {
  type: 'stock'
  value: string    // 股票代码，如 "601360"
  label: string    // 显示标签，如 "证券代码"
}

/** 消息角色 */
export type MessageRole = 'user' | 'assistant'

/** 语义化图表配置（从 QuantKlineChart 导入的简化版本） */
export interface SemanticChartConfig {
  version: string
  data: {
    source: 'baostock' | 'dongcai'
    symbol: string
    exchange?: 'SH' | 'SZ' | 'BJ'
    startDate: string
    endDate: string
    period: 'daily' | 'weekly' | 'monthly' | '5min' | '15min' | '30min' | '60min'
    adjust: 'qfq' | 'hfq' | 'none'
  }
  indicators?: {
    main?: Array<{
      type: 'MA' | 'BOLL'
      enabled: boolean
      params?: Record<string, unknown>
    }>
    sub?: Array<{
      type: string
      enabled: boolean
      params?: Record<string, unknown>
    }>
  }
  markers?: {
    showVolumePriceMarkers?: boolean
    showExtremaMarkers?: boolean
    customMarkers?: Array<{
      id: string
      date: string
      shape: 'arrow_up' | 'arrow_down' | 'flag' | 'circle' | 'rectangle' | 'diamond'
      groupKey?: string
      style?: {
        fillColor?: string
        size?: number
      }
      label?: {
        text: string
      }
      metadata?: Record<string, unknown>
    }>
  }
}

/** 解析后的chart配置 */
export interface ChartConfig {
  id: string
  config: SemanticChartConfig
  rawJson: string
}

/** 消息 */
export interface Message {
  id: string
  role: MessageRole
  content: string
  slots?: Slot[]
  charts: ChartConfig[]
  timestamp: number
  isStreaming?: boolean
}

/** 流式响应chunk */
export interface StreamChunk {
  content?: string
  metadata?: Record<string, unknown>
  session_id?: string
  tool_calls?: unknown[]
  [key: string]: unknown
}

/** 技能类型 */
export type SkillType = 'hotspot' | 'target_price' | 'news' | 'announcement' | 'buy_sell'

/** 技能配置 */
export interface Skill {
  id: SkillType
  label: string
  icon: string
}

/** 会话信息 */
export interface ChatSession {
  id: string
  title: string | null
  message_count: number
  last_activity: string
  created_at: string
}

/** 历史消息 */
export interface HistoryMessage {
  role: MessageRole
  content: string
  created_at?: string
}
