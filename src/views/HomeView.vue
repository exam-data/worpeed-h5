<template>
  <AppLayout
    :show-settings="showSettings"
    @toggle-settings="showSettings = !showSettings"
  >
    <!-- 单词卡片 -->
    <WordCard
      ref="wordCardRef"
      :word="wordStore.currentWord"
      @swipe-up="handleSwipeUp"
      @view-time="handleViewTime"
      :key="wordStore.currentWordIndex"
    />

    <!-- 设置弹窗 -->
    <SettingsDialog
      :show="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="updateSettings"
      @reset="resetProgress"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useWordStore } from '../stores/wordStore'
import AppLayout from '../components/layout/AppLayout.vue'
import WordCard from '../components/WordCard.vue'
import SettingsDialog from '../components/SettingsDialog.vue'

// 状态管理
const wordStore = useWordStore()

// 界面状态
const showSettings = ref(false)

// 组件引用
const wordCardRef = ref<InstanceType<typeof WordCard>>()

// 设置
const settings = ref({
  autoNext: false,
  sensitivity: 'medium' as 'low' | 'medium' | 'high'
})

// 自动切换定时器
let autoNextTimer: number | null = null

// 方法
const handleSwipeUp = () => {
  clearAutoNextTimer()
  goToNextWord()
}

const handleViewTime = (viewTime: number) => {
  // 记录查看时间
  wordStore.recordWordView(viewTime)

  // 设置自动切换
  if (settings.value.autoNext) {
    setAutoNextTimer()
  }
}

const goToNextWord = () => {
  wordStore.nextWord()

  // 重置卡片计时器
  nextTick(() => {
    wordCardRef.value?.resetTimer()
  })
}

const setAutoNextTimer = () => {
  clearAutoNextTimer()
  autoNextTimer = setTimeout(() => {
    goToNextWord()
  }, 5000) // 5秒后自动切换
}

const clearAutoNextTimer = () => {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer)
    autoNextTimer = null
  }
}

const resetProgress = () => {
  wordStore.resetProgress()
}

const updateSettings = (newSettings: typeof settings.value) => {
  settings.value = newSettings
  saveSettings()
}

const loadSettings = () => {
  const saved = localStorage.getItem('wordApp_settings')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      settings.value = { ...settings.value, ...data }
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('wordApp_settings', JSON.stringify(settings.value))
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

// 键盘事件处理
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    handleSwipeUp()
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  wordStore.initializeStore()
  loadSettings()

  // 绑定键盘事件
  document.addEventListener('keydown', handleKeyPress)

  // 防止页面滚动
  document.body.style.overflow = 'hidden'

  // 阻止默认的触摸行为
  document.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault()
    },
    { passive: false }
  )
})

// 清理
const cleanup = () => {
  clearAutoNextTimer()
  document.removeEventListener('keydown', handleKeyPress)
  document.body.style.overflow = ''
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup)
</script>

<style scoped>
/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .menu-content {
    background: #0f172a;
  }

  .menu-header {
    border-bottom-color: rgba(37, 99, 235, 0.15);
  }

  .menu-header h3 {
    color: #f1f5f9;
  }

  .menu-header button {
    color: #94a3b8;
  }

  .menu-header button:hover {
    background: rgba(37, 99, 235, 0.15);
    color: #60a5fa;
  }

  .menu-item {
    border-bottom-color: rgba(37, 99, 235, 0.1);
  }

  .menu-item:hover {
    background: rgba(37, 99, 235, 0.06);
  }

  .menu-item label {
    color: #e2e8f0;
  }

  .menu-item select {
    background: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
  }

  .menu-item select:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .menu-item.danger {
    color: #f87171;
  }
}
</style>
