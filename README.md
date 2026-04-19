# QuantAgent

基于 Vue 3 的量化智能助手前端，支持流式对话、K 线图表可视化与多会话管理。

## 功能特性

- **流式对话** — 基于 SSE 的实时流式响应，打字机效果呈现 AI 回复
- **K 线图表** — 解析 AI 回复中的语义化图表配置，内嵌 K 线图卡片，支持弹窗全屏查看（日 K / 周 K / 月 K / 分钟级）
- **多会话管理** — 会话列表、新建会话、历史切换、清空对话
- **技能快捷入口** — 热点、目标价、新闻、公告、买卖点等一键标签
- **暗色 / 亮色主题** — 跟随系统或手动切换，平滑过渡
- **响应式布局** — 适配桌面与移动端

## 界面展示

![](https://files.seeusercontent.com/2026/04/19/akW9/QQ20260419215139.png)

![](https://files.seeusercontent.com/2026/04/19/i0Yo/QQ20260419215144.png)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5 + TypeScript 6 |
| 构建 | Vite 8 |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 5 |
| K 线图表 | @363045841yyt/klinechart |
| 样式 | CSS Custom Properties (Design Tokens) |

## 项目结构

```
src/
├── api/
│   └── chat.ts              # Chat API 封装（SSE 流式 / REST）
├── assets/
│   └── styles/
│       ├── global.css        # 全局样式、动画、滚动条
│       └── design-tokens.css # 设计令牌（颜色、间距、圆角、字体）
├── components/
│   ├── ChatContainer.vue     # 聊天容器（列表 + 输入 + 图表弹窗）
│   ├── ChatInput.vue         # 输入框 + 词槽标签 + 技能栏
│   ├── MessageItem.vue       # 单条消息（用户 / AI）
│   ├── MessageList.vue       # 消息列表（自动滚动）
│   ├── ChartCard.vue         # K 线图卡片摘要
│   ├── ChartModal.vue        # K 线图全屏弹窗
│   └── SkillSelector.vue     # 技能选择器
├── stores/
│   ├── chat.ts               # 聊天状态（消息、会话、流式控制）
│   └── theme.ts              # 主题状态（暗色 / 亮色切换）
├── types/
│   └── chat.ts               # 类型定义（Message, ChartConfig, Session...）
├── utils/
│   └── chartParser.ts        # 图表配置解析（<chart> 标签提取）
├── views/
│   └── ChatView.vue          # 主视图（侧边栏 + 聊天区）
├── router/
│   └── index.ts              # 路由配置
├── main.ts                   # 应用入口
└── App.vue                   # 根组件
```

## 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- pnpm

### 安装依赖

```sh
pnpm install
```

### 开发模式

```sh
pnpm dev
```

默认启动开发服务器并自动代理后端 API：

- `/api/stock/*` → `http://localhost:8000`（股票数据服务）
- `/api/chat/*` → `http://localhost:8001`（Chat 服务）

可通过环境变量自定义代理地址：

```sh
VITE_STOCK_API_URL=http://your-stock-api:8000 \
VITE_CHAT_API_URL=http://your-chat-api:8001 \
pnpm dev
```

### 生产构建

```sh
pnpm build
```

### 预览构建产物

```sh
pnpm preview
```

### 类型检查

```sh
pnpm type-check
```

## API 接口

项目依赖以下后端 API 端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat/chat-stream` | 流式聊天（SSE） |
| POST | `/api/chat/chat` | 非流式聊天 |
| POST | `/api/chat/clear-session` | 清空指定会话 |
| GET | `/api/chat/sessions` | 获取会话列表 |
| GET | `/api/chat/sessions/:id/messages` | 获取会话历史消息 |

流式接口通过 `X-Session-Id` 请求头传递会话 ID，响应为 SSE 格式（`data: {...}` 逐行推送）。

## 主题系统

项目使用 CSS Custom Properties 实现主题切换，通过 `data-theme` 属性控制：

- `data-theme="dark"` — 暗色主题（默认）
- `data-theme="light"` — 亮色主题

主题偏好会持久化到 `localStorage`（key: `quantagent-theme`），未手动设置时跟随系统 `prefers-color-scheme`。

## 图表配置协议

AI 回复中可通过 `<chart>` 标签嵌入语义化图表配置 JSON，前端会自动解析并渲染为可交互的 K 线图卡片。

支持的主图指标：`MA`、`BOLL`

支持的副图指标：`VOLUME`、`MACD`、`RSI`、`CCI`、`STOCH`、`MOM`、`WMSR`、`KST`、`FASTK`

## License

Private
