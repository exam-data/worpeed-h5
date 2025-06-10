<template>
  <AppLayout
    :show-settings="showSettings"
    @toggle-settings="showSettings = !showSettings"
  >
    <!-- 单词卡片 -->
    <WordCard
      v-if="!showCongratulations"
      ref="wordCardRef"
      :word="wordStore.currentWord"
      @swipe-up="handleSwipeUp"
      @swipe-down="handleSwipeDown"
      @view-time="handleViewTime"
      :key="wordStore.currentWordIndex"
    />

    <!-- 祝贺页面 -->
    <CongratulationsView
      v-if="showCongratulations"
      :round="currentRound"
      :stats="wordStore.learningStats"
      @restart="handleRestart"
    />

    <!-- 控制区域 -->
    <div class="control-area" v-if="!showCongratulations">
      <button
        v-if="settings.autoNext"
        class="control-btn pause-btn"
        @click="togglePause"
        :class="{ paused: isPaused }"
      >
        <svg v-if="isPaused" viewBox="0 0 24 24" class="play-icon">
          <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="pause-icon">
          <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
        </svg>
        <span class="btn-text">{{ isPaused ? '继续' : '暂停' }}</span>
      </button>

      <button class="control-btn finish-btn" @click="finishLearning">
        <svg viewBox="0 0 24 24" class="finish-icon">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        <span class="btn-text">完成学习</span>
      </button>
    </div>

    <!-- 设置弹窗 -->
    <SettingsDialog
      :show="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="updateSettings"
      @reset="resetProgress"
      @clearCache="handleClearCache"
    />

    <!-- 提示弹窗 -->
    <Toast :show="showToast" :message="toastMessage" />

    <!-- 模式选择弹窗 -->
    <ModeSelectDialog :show="showModeSelect" @select="handleModeSelect" />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useWordStore } from '../stores/wordStore'
import AppLayout from '../components/layout/AppLayout.vue'
import WordCard from '../components/WordCard.vue'
import SettingsDialog from '../components/SettingsDialog.vue'
import Toast from '../components/Toast.vue'
import ModeSelectDialog from '../components/ModeSelectDialog.vue'
import CongratulationsView from '../components/CongratulationsView.vue'

interface Settings {
  autoNext: boolean
  autoNextInterval: number
  mode: 'sequential' | 'random'
}

// 状态管理
const wordStore = useWordStore()

// 界面状态
const showSettings = ref(false)
const isPaused = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const showModeSelect = ref(false)
const showCongratulations = ref(false)
const currentRound = ref(1)

// 组件引用
const wordCardRef = ref<InstanceType<typeof WordCard>>()

// 设置
const settings = ref<Settings>({
  autoNext: false,
  autoNextInterval: 5,
  mode: 'sequential'
})

// 自动切换定时器
let autoNextTimer: number | null = null

// 方法
const handleSwipeUp = () => {
  clearAutoNextTimer()
  // 取消标记当前单词和下一个单词
  const currentWord = wordStore.currentWord
  const nextIndex = wordStore.currentWordIndex + 1
  if (nextIndex < wordStore.words.length) {
    if (wordStore.isWordLearned(currentWord.number)) {
      wordStore.unmarkWord(currentWord.number)
    }
    const nextWord = wordStore.words[nextIndex]
    if (nextWord && wordStore.isWordLearned(nextWord.number)) {
      wordStore.unmarkWord(nextWord.number)
    }
  }
  goToNextWord()
}

const handleSwipeDown = () => {
  clearAutoNextTimer()

  // 检查是否所有单词都已学习
  const allLearned = wordStore.words.every((word) =>
    wordStore.isWordLearned(word.number)
  )

  if (allLearned) {
    showCongratulations.value = true
  } else {
    wordStore.prevWord()
  }
}

const handleViewTime = (viewTime: number) => {
  // 记录查看时间
  wordStore.recordWordView(viewTime)

  // 设置自动切换
  if (settings.value.autoNext && !isPaused.value) {
    setAutoNextTimer()
  }
}

const goToNextWord = () => {
  wordStore.nextWord()

  // 重置卡片计时器
  nextTick(() => {
    wordCardRef.value?.resetTimer()
  })

  if (settings.value.autoNext && !isPaused.value) {
    setAutoNextTimer()
  }
}

const setAutoNextTimer = () => {
  clearAutoNextTimer()
  autoNextTimer = setTimeout(() => {
    goToNextWord()
  }, settings.value.autoNextInterval * 1000)
}

const clearAutoNextTimer = () => {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer)
    autoNextTimer = null
  }
}

const togglePause = () => {
  isPaused.value = !isPaused.value

  if (isPaused.value) {
    clearAutoNextTimer()
  } else {
    setAutoNextTimer()
  }
}

const resetProgress = () => {
  wordStore.resetProgress()
}

const updateSettings = (newSettings: Settings) => {
  const oldMode = settings.value.mode
  settings.value = newSettings

  // 如果模式发生变化，需要处理学习顺序
  if (oldMode !== newSettings.mode) {
    if (newSettings.mode === 'random') {
      wordStore.shuffleWords()
      wordStore.saveLearningSequence()
    } else {
      wordStore.restoreOriginalOrder()
    }
  }

  // 根据新设置更新自动切换
  if (newSettings.autoNext && !isPaused.value) {
    setAutoNextTimer()
  } else if (!newSettings.autoNext) {
    clearAutoNextTimer()
    isPaused.value = false
  }

  // 保存设置
  try {
    localStorage.setItem('wordApp_settings', JSON.stringify(settings.value))
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

const loadSettings = () => {
  const saved = localStorage.getItem('wordApp_settings')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      settings.value = { ...settings.value, ...data }

      // 如果是随机模式且没有已保存的学习顺序，需要打乱顺序
      if (
        settings.value.mode === 'random' &&
        !localStorage.getItem('wordApp_learning_sequence')
      ) {
        wordStore.shuffleWords()
        wordStore.saveLearningSequence()
      }

      // 如果启用了自动切换且未暂停，立即开始计时
      if (settings.value.autoNext && !isPaused.value) {
        setAutoNextTimer()
      }
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  }
}

// 键盘事件处理
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    handleSwipeUp()
  } else if (e.code === 'KeyP' && settings.value.autoNext) {
    // 添加P键作为暂停快捷键
    e.preventDefault()
    togglePause()
  }
}

const finishLearning = () => {
  // 保存当前进度
  wordStore.saveProgress(wordStore.currentWordIndex)

  // 显示提示
  toastMessage.value = '学习进度已保存'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 添加beforeunload事件处理
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  // 如果有未保存的学习进度
  if (!wordStore.isWordLearned(wordStore.currentWord.number)) {
    e.preventDefault()
    e.returnValue = '您有未保存的学习进度，确定要离开吗？'
    return e.returnValue
  }
}

// 处理模式选择
const handleModeSelect = (mode: 'sequential' | 'random') => {
  showModeSelect.value = false
  settings.value.mode = mode

  if (mode === 'random') {
    wordStore.shuffleWords()
    wordStore.saveLearningSequence()
  }

  // 找到第一个未学习的单词
  const firstUnlearnedIndex = wordStore.words.findIndex(
    (word) => !wordStore.isWordLearned(word.number)
  )
  if (firstUnlearnedIndex !== -1) {
    wordStore.jumpToWord(firstUnlearnedIndex)
  }

  // 保存设置
  try {
    localStorage.setItem('wordApp_settings', JSON.stringify(settings.value))
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

const handleRestart = () => {
  showCongratulations.value = false
  currentRound.value++
  wordStore.resetProgress()

  // 如果是随机模式，重新打乱顺序
  if (settings.value.mode === 'random') {
    wordStore.shuffleWords()
    wordStore.saveLearningSequence()
  }

  // 跳转到第一个单词
  wordStore.jumpToWord(0)
}

const handleClearCache = () => {
  // 清除所有本地存储
  localStorage.removeItem('wordRecords')
  localStorage.removeItem('wordApp_progress')
  localStorage.removeItem('wordApp_settings')
  localStorage.removeItem('wordApp_current_round')
  localStorage.removeItem('wordApp_learning_sequence')
  localStorage.removeItem('wordApp_has_selected_mode')

  // 重置所有状态
  wordStore.resetProgress()
  settings.value = {
    autoNext: false,
    autoNextInterval: 5,
    mode: 'sequential'
  }
  currentRound.value = 1
  showModeSelect.value = true

  // 显示提示
  toastMessage.value = '缓存已清除'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 生命周期
onMounted(() => {
  // 初始化数据
  wordStore.initializeStore()
  loadSettings()

  // 检查是否首次使用
  const hasSelectedMode = localStorage.getItem('wordApp_has_selected_mode')

  if (!hasSelectedMode) {
    showModeSelect.value = true
    localStorage.setItem('wordApp_has_selected_mode', 'true')
  } else {
    // 恢复临时进度
    const tempProgress = localStorage.getItem('wordApp_temp_progress')
    if (tempProgress) {
      try {
        const { index } = JSON.parse(tempProgress)
        wordStore.jumpToWord(index)
        localStorage.removeItem('wordApp_temp_progress')
      } catch (e) {
        console.error('恢复临时进度失败:', e)
      }
    } else {
      // 如果没有临时进度，找到第一个未学习的单词
      const firstUnlearnedIndex = wordStore.words.findIndex(
        (word) => !wordStore.isWordLearned(word.number)
      )
      if (firstUnlearnedIndex !== -1) {
        wordStore.jumpToWord(firstUnlearnedIndex)
      }
    }
  }

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

  // 在组件挂载时添加事件监听
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 清理
const cleanup = () => {
  clearAutoNextTimer()
  document.removeEventListener('keydown', handleKeyPress)
  document.body.style.overflow = ''

  // 保存临时进度
  try {
    localStorage.setItem(
      'wordApp_temp_progress',
      JSON.stringify({
        index: wordStore.currentWordIndex,
        timestamp: Date.now()
      })
    )
  } catch (e) {
    console.error('保存临时进度失败:', e)
  }
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup)

// 在组件卸载时移除事件监听和保存临时进度
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  cleanup()
})
</script>

<style scoped>
.control-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom, 0.75rem) + 6.5rem);
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0 1.5rem;
  z-index: 100;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 1rem;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.control-btn svg {
  width: 1.375rem;
  height: 1.375rem;
  fill: currentColor;
}

.control-btn:hover {
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

.pause-btn {
  background: #2563eb;
}

.pause-btn:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
}

.pause-btn.paused {
  background: #dc2626;
}

.pause-btn.paused:hover {
  background: #b91c1c;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
}

.finish-btn {
  background: #059669;
}

.finish-btn:hover {
  background: #047857;
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .control-area {
    bottom: calc(env(safe-area-inset-bottom, 0.75rem) + 6rem);
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .control-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }

  .control-btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .control-btn {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .pause-btn {
    background: #2563eb;
  }

  .pause-btn:hover {
    background: #1d4ed8;
  }

  .pause-btn.paused {
    background: #dc2626;
  }

  .pause-btn.paused:hover {
    background: #b91c1c;
  }

  .finish-btn {
    background: #059669;
  }

  .finish-btn:hover {
    background: #047857;
  }
}
</style>
