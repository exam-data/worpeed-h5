<template>
  <div
    class="word-card"
    ref="cardRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    :style="cardStyle"
  >
    <!-- 单词主要内容 -->
    <div class="word-content">
      <!-- 单词编号和频率 -->
      <div class="word-meta">
        <span class="word-number">#{{ word.number }}</span>
        <span class="word-frequency">频率: {{ word.frequency }}</span>
      </div>

      <!-- 单词本身 -->
      <div class="word-main">
        <h1 class="word-text">{{ word.word }}</h1>
      </div>

      <!-- 中文释义 -->
      <div class="word-meaning">
        <p>{{ word.meaning }}</p>
      </div>
    </div>

    <!-- 停留时间指示器 -->
    <div class="time-indicator">
      <div class="time-progress" :style="{ width: timeProgress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Word } from '../types/word'

interface Props {
  word: Word
}

interface Emits {
  (e: 'swipe-up'): void
  (e: 'view-time', time: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 模板引用
const cardRef = ref<HTMLElement>()

// 触摸相关状态
const touchStartY = ref(0)
const touchStartTime = ref(0)
const isDragging = ref(false)
const dragY = ref(0)
const viewStartTime = ref(0)

// 计时相关
const timeProgress = ref(0)
let timeProgressInterval: number | null = null

// 计算属性
const cardStyle = computed(() => ({
  transform: `translateY(${dragY.value}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-out'
}))

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  touchStartTime.value = Date.now()
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  const currentY = e.touches[0].clientY
  const deltaY = currentY - touchStartY.value

  // 只允许向上滑动
  if (deltaY < 0) {
    dragY.value = deltaY
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const touchDuration = Date.now() - touchStartTime.value
  const threshold = -100 // 上滑阈值

  if (dragY.value < threshold && touchDuration < 500) {
    // 快速上滑，切换到下一个单词
    onSwipeUp()
  }

  // 重置状态
  isDragging.value = false
  dragY.value = 0
}

const onSwipeUp = () => {
  const viewTime = Date.now() - viewStartTime.value
  emit('view-time', viewTime)
  emit('swipe-up')
}

// 计时器功能
const startTimer = () => {
  viewStartTime.value = Date.now()
  timeProgress.value = 0

  // 清除之前的定时器
  if (timeProgressInterval) {
    clearInterval(timeProgressInterval)
  }

  // 10秒内显示进度条
  timeProgressInterval = setInterval(() => {
    const elapsed = Date.now() - viewStartTime.value
    const progress = Math.min((elapsed / 10000) * 100, 100)
    timeProgress.value = progress

    if (progress >= 100) {
      clearInterval(timeProgressInterval!)
      timeProgressInterval = null
    }
  }, 100)
}

const stopTimer = () => {
  if (timeProgressInterval) {
    clearInterval(timeProgressInterval)
    timeProgressInterval = null
  }
}

// 生命周期
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
  const viewTime = Date.now() - viewStartTime.value
  emit('view-time', viewTime)
})

// 监听props变化重新开始计时
const resetTimer = () => {
  stopTimer()
  startTimer()
}

// 导出方法供父组件调用
defineExpose({
  resetTimer
})
</script>

<style scoped>
.word-card {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 14rem);
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  user-select: none;
  overflow: hidden;
  border-radius: 2rem;
}

.word-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 440px;
  text-align: center;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.word-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9375rem;
}

.word-number {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  padding: 0.375rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.word-frequency {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.word-main {
  margin-bottom: 2.5rem;
}

.word-text {
  font-size: 3.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.word-meaning {
  background: rgba(37, 99, 235, 0.04);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 0;
  border-left: 3px solid #2563eb;
}

.word-meaning p {
  font-size: 1.25rem;
  color: #334155;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.time-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.time-progress {
  height: 100%;
  background: #2563eb;
  transition: width 0.1s linear;
  border-radius: 0 3px 3px 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .word-card {
    max-height: calc(100vh - 13rem);
    margin-bottom: 3.5rem;
    padding: 1.5rem;
  }

  .word-content {
    padding: 1.75rem 1.5rem;
  }

  .word-text {
    font-size: 2.5rem;
  }

  .word-meaning p {
    font-size: 1.125rem;
  }

  .word-meta {
    margin-bottom: 1.5rem;
  }

  .word-number {
    padding: 0.25rem 0.75rem;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .word-card {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  }

  .word-content {
    background: rgba(15, 23, 42, 0.98);
  }

  .word-text {
    color: #f1f5f9;
  }

  .word-number {
    background: rgba(37, 99, 235, 0.15);
    color: #60a5fa;
  }

  .word-frequency {
    color: #94a3b8;
  }

  .word-meaning {
    background: rgba(37, 99, 235, 0.06);
    border-left-color: #60a5fa;
  }

  .word-meaning p {
    color: #e2e8f0;
  }

  .time-progress {
    background: #60a5fa;
  }
}
</style>
