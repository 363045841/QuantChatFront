import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 组件库样式
import '@363045841yyt/klinechart/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
