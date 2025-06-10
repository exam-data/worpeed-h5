<template>
  <Transition name="dialog">
    <div v-if="show" class="mode-select-dialog">
      <div class="dialog-content">
        <h2>选择学习模式</h2>
        <div class="mode-options">
          <button
            class="mode-option"
            :class="{ active: selectedMode === 'sequential' }"
            @click="selectMode('sequential')"
          >
            <div class="mode-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M3,14V4A1,1 0 0,1 4,3H10A1,1 0 0,1 11,4V14A1,1 0 0,1 10,15H4A1,1 0 0,1 3,14M4,4V14H10V4H4M13,14V4A1,1 0 0,1 14,3H20A1,1 0 0,1 21,4V14A1,1 0 0,1 20,15H14A1,1 0 0,1 13,14M14,4V14H20V4H14Z"
                />
              </svg>
            </div>
            <div class="mode-info">
              <h3>顺序模式</h3>
              <p>按照词频顺序学习单词</p>
            </div>
          </button>

          <button
            class="mode-option"
            :class="{ active: selectedMode === 'random' }"
            @click="selectMode('random')"
          >
            <div class="mode-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z"
                />
              </svg>
            </div>
            <div class="mode-info">
              <h3>随机模式</h3>
              <p>随机顺序学习单词</p>
            </div>
          </button>
        </div>
        <div class="dialog-actions">
          <button class="confirm-btn" @click="confirmMode">开始学习</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'select', mode: 'sequential' | 'random'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedMode = ref<'sequential' | 'random'>('sequential')

const selectMode = (mode: 'sequential' | 'random') => {
  selectedMode.value = mode
}

const confirmMode = () => {
  emit('select', selectedMode.value)
}
</script>

<style scoped>
.mode-select-dialog {
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
  z-index: 1000;
  padding: 1rem;
}

.dialog-content {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

.dialog-content h2 {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  background: white;
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
  width: 3rem;
  height: 3rem;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.mode-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: #2563eb;
}

.mode-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  color: #0f172a;
  font-weight: 600;
}

.mode-info p {
  margin: 0;
  font-size: 0.9375rem;
  color: #64748b;
}

.dialog-actions {
  margin-top: 2rem;
}

.confirm-btn {
  padding: 0.875rem 2rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.confirm-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .dialog-content {
    background: #1e293b;
  }

  .dialog-content h2 {
    color: #f1f5f9;
  }

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

  .mode-info h3 {
    color: #f1f5f9;
  }

  .mode-info p {
    color: #94a3b8;
  }
}
</style>
