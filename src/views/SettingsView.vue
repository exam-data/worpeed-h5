<template>
  <AppLayout>
    <div class="settings-view">
      <!-- 标题 -->
      <div class="page-header">
        <h1>设置</h1>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content" ref="settingsContentRef">
        <div class="settings-group">
          <h3>学习模式</h3>
          <div class="setting-item">
            <div class="mode-options">
              <button
                class="mode-option"
                :class="{ active: localSettings.mode === 'sequential' }"
                @click="handleModeChange('sequential')"
              >
                <div class="mode-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M3,14V4A1,1 0 0,1 4,3H10A1,1 0 0,1 11,4V14A1,1 0 0,1 10,15H4A1,1 0 0,1 3,14M4,4V14H10V4H4M13,14V4A1,1 0 0,1 14,3H20A1,1 0 0,1 21,4V14A1,1 0 0,1 20,15H14A1,1 0 0,1 13,14M14,4V14H20V4H14Z"
                    />
                  </svg>
                </div>
                <div class="mode-info">
                  <h4>顺序模式</h4>
                  <p>按照词频顺序学习单词</p>
                </div>
              </button>

              <button
                class="mode-option"
                :class="{ active: localSettings.mode === 'random' }"
                @click="handleModeChange('random')"
              >
                <div class="mode-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z"
                    />
                  </svg>
                </div>
                <div class="mode-info">
                  <h4>随机模式</h4>
                  <p>随机顺序学习单词</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <h3>学习设置</h3>
          <div class="setting-item">
            <label class="switch-label">
              <span>自动切换</span>
              <div class="switch">
                <input
                  type="checkbox"
                  v-model="localSettings.autoNext"
                  @change="handleChange"
                />
                <span class="slider"></span>
              </div>
            </label>
          </div>

          <div class="setting-item" v-if="localSettings.autoNext">
            <label class="input-label">
              切换间隔：
              <div class="input-with-unit">
                <input
                  type="number"
                  v-model.number="localSettings.autoNextInterval"
                  @input="handleIntervalInput"
                  class="number-input"
                  min="1"
                  step="1"
                />
                <span class="unit">秒</span>
              </div>
            </label>
          </div>
        </div>

        <div class="settings-group">
          <h3>保存设置</h3>
          <div class="setting-item">
            <button
              class="save-button"
              :class="{ 'has-changes': hasChanges }"
              @click="saveSettings"
            >
              <svg viewBox="0 0 24 24" class="save-icon">
                <path
                  d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z"
                />
              </svg>
              <span>{{ hasChanges ? '保存更改' : '无更改' }}</span>
            </button>
          </div>
        </div>

        <div class="settings-group">
          <h3>数据管理</h3>
          <div class="setting-item">
            <button class="danger-btn" @click="handleReset">
              <svg viewBox="0 0 24 24">
                <path
                  d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                />
              </svg>
              <span>重置学习进度</span>
            </button>
          </div>
          <div class="setting-item">
            <button
              class="danger-btn clear-cache-btn"
              @click="handleClearCache"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M15,2A7,7,0,0,1,22,9V15A7,7,0,0,1,15,22H9A7,7,0,0,1,2,15V9A7,7,0,0,1,9,2H15M15,4H9A5,5,0,0,0,4,9V15A5,5,0,0,0,9,20H15A5,5,0,0,0,20,15V9A5,5,0,0,0,15,4M12,6A4,4,0,1,1,8,10A4,4,0,0,1,12,6M12,8A2,2,0,1,0,14,10A2,2,0,0,0,12,8Z"
                />
              </svg>
              <span>清除所有缓存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'

interface Settings {
  autoNext: boolean
  autoNextInterval: number
  mode: 'sequential' | 'random'
}

// 路由
const router = useRouter()

// 本地设置状态
const localSettings = ref<Settings>({
  autoNext: false,
  autoNextInterval: 5,
  mode: 'sequential'
})

// 原始设置状态（用于比较变化）
const originalSettings = ref<Settings>({
  autoNext: false,
  autoNextInterval: 5,
  mode: 'sequential'
})

// 计算是否有更改
const hasChanges = computed(() => {
  return (
    JSON.stringify(localSettings.value) !==
    JSON.stringify(originalSettings.value)
  )
})

// 触摸滑动相关变量
const settingsContentRef = ref<HTMLElement | null>(null)
let startY = 0
let currentY = 0
let lastScrollTop = 0
let isTouching = false
let touchStartTime = 0
let touchStartScrollTop = 0
let velocity = 0
let animationFrameId: number | null = null

// 方法
const handleModeChange = (mode: 'sequential' | 'random') => {
  localSettings.value.mode = mode
}

const handleChange = () => {
  // 仅更新本地状态
}

const handleIntervalInput = () => {
  // 确保值不小于1
  if (localSettings.value.autoNextInterval < 1) {
    localSettings.value.autoNextInterval = 1
  }
  // 确保是整数
  localSettings.value.autoNextInterval = Math.floor(
    localSettings.value.autoNextInterval
  )
}

const saveSettings = () => {
  // 保存到localStorage
  try {
    localStorage.setItem(
      'wordApp_settings',
      JSON.stringify(localSettings.value)
    )
    // 更新原始设置状态
    originalSettings.value = JSON.parse(JSON.stringify(localSettings.value))
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

const handleReset = () => {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    // 清除进度相关的本地存储
    localStorage.removeItem('wordRecords')
    localStorage.removeItem('wordApp_progress')
    // 返回主页
    router.push('/')
  }
}

const handleClearCache = () => {
  if (
    confirm(
      '确定要清除所有缓存数据吗？这将清除所有设置、进度和学习记录，此操作不可撤销。'
    )
  ) {
    // 清除所有本地存储
    localStorage.removeItem('wordRecords')
    localStorage.removeItem('wordApp_progress')
    localStorage.removeItem('wordApp_settings')
    localStorage.removeItem('wordApp_current_round')
    localStorage.removeItem('wordApp_learning_sequence')
    localStorage.removeItem('wordApp_has_selected_mode')
    // 返回主页
    router.push('/')
  }
}

// 从localStorage加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('wordApp_settings')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      localSettings.value = { ...localSettings.value, ...data }
      // 保存原始设置状态
      originalSettings.value = JSON.parse(JSON.stringify(localSettings.value))
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  }
}

// 触摸事件处理函数
const handleTouchStart = (e: TouchEvent) => {
  if (!settingsContentRef.value) return

  // 停止任何正在进行的动画
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  startY = e.touches[0].clientY
  touchStartTime = Date.now()
  isTouching = true
  lastScrollTop = settingsContentRef.value.scrollTop
  touchStartScrollTop = lastScrollTop
  velocity = 0
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isTouching || !settingsContentRef.value) return

  // 阻止默认滚动行为
  e.preventDefault()

  currentY = e.touches[0].clientY
  const deltaY = currentY - startY

  // 计算新的滚动位置
  const newScrollTop = lastScrollTop - deltaY

  // 应用滚动
  settingsContentRef.value.scrollTop = newScrollTop

  // 更新起始位置和上次滚动位置
  startY = currentY
  lastScrollTop = settingsContentRef.value.scrollTop

  // 计算速度 (像素/毫秒)
  const now = Date.now()
  const timeDiff = now - touchStartTime
  if (timeDiff > 0) {
    velocity =
      (settingsContentRef.value.scrollTop - touchStartScrollTop) / timeDiff
  }
}

const handleTouchEnd = () => {
  if (!isTouching || !settingsContentRef.value) return

  isTouching = false

  // 惯性滚动
  const initialVelocity = velocity * 15 // 放大速度效果
  let lastTimestamp: number | null = null

  const animateScroll = (timestamp: number) => {
    if (!settingsContentRef.value) return

    if (lastTimestamp === null) {
      lastTimestamp = timestamp
      animationFrameId = requestAnimationFrame(animateScroll)
      return
    }

    const elapsed = timestamp - lastTimestamp
    lastTimestamp = timestamp

    // 减速因子
    const friction = 0.95

    // 更新速度和位置
    velocity *= friction

    // 如果速度足够小，停止动画
    if (Math.abs(velocity) < 0.05) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      return
    }

    // 应用滚动
    settingsContentRef.value.scrollTop += velocity * elapsed

    // 继续动画
    animationFrameId = requestAnimationFrame(animateScroll)
  }

  // 只有当速度足够大时才应用惯性滚动
  if (Math.abs(initialVelocity) > 0.1) {
    velocity = initialVelocity
    animationFrameId = requestAnimationFrame(animateScroll)
  }
}

// 在组件挂载时添加触摸事件监听器
onMounted(() => {
  // 加载设置
  loadSettings()

  if (settingsContentRef.value) {
    settingsContentRef.value.addEventListener('touchstart', handleTouchStart, {
      passive: false
    })
    settingsContentRef.value.addEventListener('touchmove', handleTouchMove, {
      passive: false
    })
    settingsContentRef.value.addEventListener('touchend', handleTouchEnd, {
      passive: false
    })
  }
})

// 在组件卸载时移除触摸事件监听器
onUnmounted(() => {
  if (settingsContentRef.value) {
    settingsContentRef.value.removeEventListener('touchstart', handleTouchStart)
    settingsContentRef.value.removeEventListener('touchmove', handleTouchMove)
    settingsContentRef.value.removeEventListener('touchend', handleTouchEnd)
  }

  // 清理任何可能正在进行的动画
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}

.page-header {
  padding: 1rem 0 1.5rem;
  text-align: center;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: calc(8rem + env(safe-area-inset-bottom, 0px));
}

/* 隐藏Webkit浏览器的滚动条 */
.settings-content::-webkit-scrollbar {
  display: none;
}

.settings-group {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
}

.settings-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.settings-group h3 {
  font-size: 1.125rem;
  color: #334155;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.setting-item {
  margin-bottom: 1.25rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

/* 模式选择 */
.mode-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.mode-option:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.mode-option.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.04);
}

.mode-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 0.5rem;
  color: #2563eb;
}

.mode-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

.mode-info {
  flex: 1;
}

.mode-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.mode-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* 开关样式 */
.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #334155;
  font-size: 1rem;
  font-weight: 500;
}

.switch {
  position: relative;
  width: 2.75rem;
  height: 1.625rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1.625rem;
}

.slider:before {
  position: absolute;
  content: '';
  height: 1.25rem;
  width: 1.25rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: white;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #2563eb;
}

input:checked + .slider:before {
  transform: translateX(1.125rem);
}

/* 输入框样式 */
.input-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #334155;
  font-size: 0.9375rem;
  font-weight: 500;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.number-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  color: #334155;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 5rem;
  text-align: center;
  -moz-appearance: textfield;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.unit {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 危险按钮 */
.danger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 0.75rem;
  color: #dc2626;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.danger-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

.danger-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}

/* 保存按钮样式 */
.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.save-button.has-changes {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.save-button.has-changes:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
}

.save-icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .page-header h1 {
    color: #f1f5f9;
  }

  .settings-group {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .settings-group h3 {
    color: #e2e8f0;
  }

  .mode-option {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .mode-option:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .mode-option.active {
    border-color: #60a5fa;
    background: rgba(59, 130, 246, 0.1);
  }

  .mode-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  .mode-info h4 {
    color: #f1f5f9;
  }

  .mode-info p {
    color: #94a3b8;
  }

  .switch-label {
    color: #f1f5f9;
  }

  .slider {
    background-color: rgba(255, 255, 255, 0.1);
  }

  input:checked + .slider {
    background-color: #60a5fa;
  }

  .input-label {
    color: #f1f5f9;
  }

  .number-input {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }

  .number-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .unit {
    color: #94a3b8;
  }

  .danger-btn {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.2);
  }

  .danger-btn:hover {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.3);
  }

  .save-button {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  }

  .save-button.has-changes {
    background: #60a5fa;
    border-color: #60a5fa;
    color: white;
  }

  .save-button.has-changes:hover {
    background: #3b82f6;
    border-color: #3b82f6;
  }
}
</style>
