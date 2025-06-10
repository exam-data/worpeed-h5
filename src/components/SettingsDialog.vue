<template>
  <Transition name="dialog">
    <div v-if="show" class="settings-dialog" @click="$emit('close')">
      <div class="dialog-content" @click.stop>
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

        <div class="dialog-body">
          <div class="settings-group">
            <h3>学习设置</h3>
            <div class="setting-item">
              <label class="switch-label">
                <span>自动切换（5秒后）</span>
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

            <div class="setting-item">
              <label class="select-label">
                敏感度：
                <select
                  v-model="localSettings.sensitivity"
                  @change="updateSettings"
                  class="select-input"
                >
                  <option value="low">低（学习更久）</option>
                  <option value="medium">中等</option>
                  <option value="high">高（快速学习）</option>
                </select>
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
          </div>
        </div>

        <!-- 确认重置弹窗 -->
        <div v-if="showResetConfirm" class="confirm-dialog">
          <div class="confirm-content">
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
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Settings {
  autoNext: boolean
  sensitivity: 'low' | 'medium' | 'high'
}

interface Props {
  show: boolean
  settings: Settings
}

interface Emits {
  (e: 'close'): void
  (e: 'update', settings: Settings): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地设置状态
const localSettings = ref<Settings>({
  autoNext: props.settings.autoNext,
  sensitivity: props.settings.sensitivity
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

// 方法
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

.dialog-content {
  background: white;
  width: 100%;
  max-width: 560px;
  border-radius: 2rem 2rem 0 0;
  padding: 2rem;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 -10px 40px -12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 600;
  letter-spacing: -0.02em;
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

/* 下拉框样式 */
.select-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #334155;
  font-size: 1rem;
  font-weight: 500;
}

.select-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  color: #334155;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.select-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

  .select-label {
    color: #e2e8f0;
  }

  .select-input {
    background-color: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  }

  .select-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
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
</style>
