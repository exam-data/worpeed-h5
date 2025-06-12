<template>
  <Transition name="dialog">
    <div v-if="show" class="settings-dialog" @click="$emit('close')">
      <div class="dialog-container" @click.stop>
        <!-- 固定的标题栏 -->
        <div class="dialog-header">
          <h2>设置</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <!-- 可滚动的内容区域 -->
        <div class="dialog-content" ref="dialogContentRef">
          <div class="dialog-body">
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
                      @change="updateSettings"
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
              <h3>数据管理</h3>
              <div class="setting-item">
                <button class="danger-btn" @click="confirmReset">
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
                  @click="confirmClearCache"
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

        <!-- 重置确认弹窗 -->
        <div
          v-if="showResetConfirm"
          class="confirm-dialog"
          @click="showResetConfirm = false"
        >
          <div class="confirm-content" @click.stop>
            <h3>确认重置</h3>
            <p>确定要重置所有学习进度吗？此操作不可撤销。</p>
            <div class="confirm-actions">
              <button class="cancel-btn" @click="showResetConfirm = false">
                取消
              </button>
              <button class="confirm-btn" @click="handleReset">确定重置</button>
            </div>
          </div>
        </div>

        <!-- 清除缓存确认弹窗 -->
        <div
          v-if="showClearCacheConfirm"
          class="confirm-dialog"
          @click="showClearCacheConfirm = false"
        >
          <div class="confirm-content" @click.stop>
            <h3>确认清除缓存</h3>
            <p>
              确定要清除所有缓存数据吗？这将清除所有设置、进度和学习记录，此操作不可撤销。
            </p>
            <div class="confirm-actions">
              <button class="cancel-btn" @click="showClearCacheConfirm = false">
                取消
              </button>
              <button class="confirm-btn" @click="handleClearCache">
                确定清除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Settings {
  autoNext: boolean
  autoNextInterval: number
  mode: 'sequential' | 'random'
}

interface Props {
  show: boolean
  settings: Settings
}

interface Emits {
  (e: 'close'): void
  (e: 'update', settings: Settings): void
  (e: 'reset'): void
  (e: 'clearCache'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地设置状态
const localSettings = ref<Settings>({
  autoNext: props.settings.autoNext,
  autoNextInterval: props.settings.autoNextInterval,
  mode: props.settings.mode
})

// 监听props变化
watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = { ...newSettings }
  },
  { deep: true }
)

// 重置确认
const showResetConfirm = ref(false)
const showClearCacheConfirm = ref(false)

// 触摸滑动相关变量
const dialogContentRef = ref<HTMLElement | null>(null)
let startY = 0
let currentY = 0
let lastScrollTop = 0
let isTouching = false
let touchStartTime = 0
let touchStartScrollTop = 0
let velocity = 0
let animationFrameId: number | null = null

// 触摸事件处理函数
const handleTouchStart = (e: TouchEvent) => {
  if (!dialogContentRef.value) return

  // 停止任何正在进行的动画
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  startY = e.touches[0].clientY
  touchStartTime = Date.now()
  isTouching = true
  lastScrollTop = dialogContentRef.value.scrollTop
  touchStartScrollTop = lastScrollTop
  velocity = 0
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isTouching || !dialogContentRef.value) return

  // 阻止默认滚动行为
  e.preventDefault()

  currentY = e.touches[0].clientY
  const deltaY = currentY - startY

  // 计算新的滚动位置
  const newScrollTop = lastScrollTop - deltaY

  // 应用滚动
  dialogContentRef.value.scrollTop = newScrollTop

  // 更新起始位置和上次滚动位置
  startY = currentY
  lastScrollTop = dialogContentRef.value.scrollTop

  // 计算速度 (像素/毫秒)
  const now = Date.now()
  const timeDiff = now - touchStartTime
  if (timeDiff > 0) {
    velocity =
      (dialogContentRef.value.scrollTop - touchStartScrollTop) / timeDiff
  }
}

const handleTouchEnd = () => {
  if (!isTouching || !dialogContentRef.value) return

  isTouching = false

  // 惯性滚动
  const initialVelocity = velocity * 15 // 放大速度效果
  let lastTimestamp: number | null = null

  const animateScroll = (timestamp: number) => {
    if (!dialogContentRef.value) return

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
    dialogContentRef.value.scrollTop += velocity * elapsed

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
  if (dialogContentRef.value) {
    dialogContentRef.value.addEventListener('touchstart', handleTouchStart, {
      passive: false
    })
    dialogContentRef.value.addEventListener('touchmove', handleTouchMove, {
      passive: false
    })
    dialogContentRef.value.addEventListener('touchend', handleTouchEnd, {
      passive: false
    })
  }
})

// 在组件卸载时移除触摸事件监听器
onUnmounted(() => {
  if (dialogContentRef.value) {
    dialogContentRef.value.removeEventListener('touchstart', handleTouchStart)
    dialogContentRef.value.removeEventListener('touchmove', handleTouchMove)
    dialogContentRef.value.removeEventListener('touchend', handleTouchEnd)
  }

  // 清理任何可能正在进行的动画
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})

// 方法
const handleIntervalInput = () => {
  // 确保值不小于1
  if (localSettings.value.autoNextInterval < 1) {
    localSettings.value.autoNextInterval = 1
  }
  // 确保是整数
  localSettings.value.autoNextInterval = Math.floor(
    localSettings.value.autoNextInterval
  )
  updateSettings()
}

const updateSettings = () => {
  emit('update', { ...localSettings.value })
}

const confirmReset = () => {
  showResetConfirm.value = true
}

const handleReset = () => {
  showResetConfirm.value = false
  emit('reset')
  emit('close')
}

const confirmClearCache = () => {
  showClearCacheConfirm.value = true
}

const handleClearCache = () => {
  showClearCacheConfirm.value = false
  emit('clearCache')
  emit('close')
}

// 添加新的方法
const handleModeChange = (mode: 'sequential' | 'random') => {
  localSettings.value.mode = mode
  updateSettings()
}
</script>

<style scoped>
.settings-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  background: white;
  width: 100%;
  max-width: 560px;
  border-radius: 2rem 2rem 0 0;
  position: relative;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px -12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 2rem 2rem 0 0;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
}

/* 隐藏Webkit浏览器的滚动条 */
.dialog-content::-webkit-scrollbar {
  display: none;
}

.dialog-body {
  padding-top: 1rem;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.625rem;
  cursor: pointer;
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

.close-btn:hover {
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}

.close-btn svg {
  width: 1.375rem;
  height: 1.375rem;
  fill: currentColor;
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

/* 确认弹窗 */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-content {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  width: 90%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

.confirm-content h3 {
  margin: 0 0 1rem 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.confirm-content p {
  margin: 0 0 2rem 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-actions button {
  padding: 0.75rem 1.75rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 6rem;
}

.cancel-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.confirm-btn {
  background: #dc2626;
  border: 1px solid #dc2626;
  color: white;
}

.confirm-btn:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

/* 动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-content {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-leave-active .dialog-content {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  .dialog-content {
    background: #0f172a;
  }

  .dialog-header h2 {
    color: #f1f5f9;
  }

  .close-btn {
    color: #94a3b8;
  }

  .close-btn:hover {
    background: rgba(37, 99, 235, 0.15);
    color: #60a5fa;
  }

  .settings-group {
    border-bottom-color: rgba(37, 99, 235, 0.15);
  }

  .settings-group h3 {
    color: #e2e8f0;
  }

  .switch-label {
    color: #e2e8f0;
  }

  .slider {
    background-color: #334155;
  }

  .slider:before {
    background-color: #f1f5f9;
  }

  input:checked + .slider {
    background-color: #2563eb;
  }

  .input-label {
    color: #e2e8f0;
  }

  .number-input {
    background: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
  }

  .number-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .unit {
    color: #94a3b8;
  }

  .danger-btn {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.2);
    color: #f87171;
  }

  .danger-btn:hover {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.25);
  }

  .confirm-content {
    background: #0f172a;
  }

  .confirm-content h3 {
    color: #f1f5f9;
  }

  .confirm-content p {
    color: #94a3b8;
  }

  .cancel-btn {
    background: #1e293b;
    border-color: #334155;
    color: #e2e8f0;
  }

  .cancel-btn:hover {
    background: #334155;
    border-color: #475569;
    color: #f1f5f9;
  }

  .confirm-btn {
    background: #dc2626;
    border-color: #dc2626;
  }

  .confirm-btn:hover {
    background: #b91c1c;
    border-color: #b91c1c;
  }
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.mode-option:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.04);
}

.mode-option.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.mode-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: #2563eb;
}

.mode-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
}

.mode-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .mode-option {
    background: #1e293b;
    border-color: #334155;
  }

  .mode-option:hover {
    border-color: #60a5fa;
    background: rgba(37, 99, 235, 0.15);
  }

  .mode-option.active {
    border-color: #60a5fa;
    background: rgba(37, 99, 235, 0.2);
  }

  .mode-icon {
    background: rgba(37, 99, 235, 0.2);
  }

  .mode-icon svg {
    fill: #60a5fa;
  }

  .mode-info h4 {
    color: #f1f5f9;
  }

  .mode-info p {
    color: #94a3b8;
  }
}

.clear-cache-btn {
  background: #7c3aed;
  border-color: #7c3aed;
}

.clear-cache-btn:hover {
  background: #6d28d9;
  border-color: #6d28d9;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .clear-cache-btn {
    background: rgba(124, 58, 237, 0.1);
    border-color: rgba(124, 58, 237, 0.2);
    color: #a78bfa;
  }

  .clear-cache-btn:hover {
    background: rgba(124, 58, 237, 0.15);
    border-color: rgba(124, 58, 237, 0.25);
  }
}
</style>
