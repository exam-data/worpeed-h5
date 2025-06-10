<template>
  <div class="congratulations-view">
    <div class="content">
      <div class="confetti">
        <svg viewBox="0 0 24 24" class="star">
          <path
            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
          />
        </svg>
        <svg viewBox="0 0 24 24" class="star">
          <path
            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
          />
        </svg>
        <svg viewBox="0 0 24 24" class="star">
          <path
            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
          />
        </svg>
      </div>

      <h1>恭喜完成！</h1>
      <p class="round-info">这是你完成的第 {{ round }} 轮学习</p>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.masteredWords }}</span>
          <span class="stat-label">已掌握</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.familiarWords }}</span>
          <span class="stat-label">熟悉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.learningWords }}</span>
          <span class="stat-label">学习中</span>
        </div>
      </div>

      <div class="actions">
        <button class="restart-btn" @click="$emit('restart')">
          <svg viewBox="0 0 24 24">
            <path
              d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"
            />
          </svg>
          再来一轮
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LearningStats } from '../types/word'

interface Props {
  round: number
  stats: LearningStats
}

interface Emits {
  (e: 'restart'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.congratulations-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
  text-align: center;
}

.content {
  max-width: 480px;
  width: 100%;
}

.confetti {
  position: relative;
  height: 6rem;
  margin-bottom: 2rem;
}

.star {
  position: absolute;
  width: 3rem;
  height: 3rem;
  fill: #fbbf24;
  animation: float 3s ease-in-out infinite;
}

.star:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}

.star:nth-child(2) {
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.5s;
}

.star:nth-child(3) {
  right: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}

.round-info {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 3rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.actions {
  margin-top: 2rem;
}

.restart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: white;
  color: #2563eb;
  border: none;
  border-radius: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 auto;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.restart-btn svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .congratulations-view {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  }

  .restart-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    backdrop-filter: blur(8px);
  }

  .restart-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>
