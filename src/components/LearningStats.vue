<template>
  <div class="learning-stats" :class="{ show: show }">
    <div class="stats-header">
      <h2>学习统计</h2>
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>

    <div class="stats-content">
      <!-- 总体统计 -->
      <div class="stats-section">
        <h3>总体进度</h3>
        <div class="progress-overview">
          <div class="progress-circle">
            <svg class="circle-bg" viewBox="0 0 42 42">
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#e2e8f0"
                stroke-width="3"
              />
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#48bb78"
                stroke-width="3"
                :stroke-dasharray="progressDashArray"
                stroke-dashoffset="25"
                transform="rotate(-90 21 21)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-number">{{ learnedPercentage }}%</span>
              <span class="progress-label">已学习</span>
            </div>
          </div>
          <div class="progress-details">
            <div class="detail-item">
              <span class="label">总单词数</span>
              <span class="value">{{ stats.totalWords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已掌握</span>
              <span class="value mastered">{{ stats.masteredWords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">熟悉</span>
              <span class="value familiar">{{ stats.familiarWords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">学习中</span>
              <span class="value learning">{{ stats.learningWords }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 熟悉度分布 -->
      <div class="stats-section">
        <h3>熟悉度分布</h3>
        <div class="familiarity-chart">
          <div class="chart-bar">
            <div
              class="bar unknown"
              :style="{ height: unknownPercentage + '%' }"
            >
              <span class="bar-label">{{ stats.unknownWords }}</span>
            </div>
            <span class="bar-name">陌生</span>
          </div>
          <div class="chart-bar">
            <div
              class="bar learning"
              :style="{ height: learningPercentage + '%' }"
            >
              <span class="bar-label">{{ stats.learningWords }}</span>
            </div>
            <span class="bar-name">学习中</span>
          </div>
          <div class="chart-bar">
            <div
              class="bar familiar"
              :style="{ height: familiarPercentage + '%' }"
            >
              <span class="bar-label">{{ stats.familiarWords }}</span>
            </div>
            <span class="bar-name">熟悉</span>
          </div>
          <div class="chart-bar">
            <div
              class="bar mastered"
              :style="{ height: masteredPercentage + '%' }"
            >
              <span class="bar-label">{{ stats.masteredWords }}</span>
            </div>
            <span class="bar-name">已掌握</span>
          </div>
        </div>
      </div>

      <!-- 今日学习 -->
      <div class="stats-section">
        <h3>今日学习</h3>
        <div class="today-stats">
          <div class="today-item">
            <div class="today-icon new">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <div class="today-content">
              <span class="today-number">{{ stats.todayNewWords }}</span>
              <span class="today-label">新学单词</span>
            </div>
          </div>
          <div class="today-item">
            <div class="today-icon review">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                />
              </svg>
            </div>
            <div class="today-content">
              <span class="today-number">{{ stats.todayReviewWords }}</span>
              <span class="today-label">复习单词</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LearningStats } from '../types/word'

interface Props {
  stats: LearningStats
  show: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 计算属性
const learnedWords = computed(
  () =>
    props.stats.masteredWords +
    props.stats.familiarWords +
    props.stats.learningWords
)

const learnedPercentage = computed(() =>
  Math.round((learnedWords.value / props.stats.totalWords) * 100)
)

const progressDashArray = computed(() => {
  const circumference = 100
  const progress = learnedPercentage.value
  return `${(progress / 100) * circumference} ${circumference}`
})

const unknownPercentage = computed(() =>
  props.stats.totalWords > 0
    ? (props.stats.unknownWords / props.stats.totalWords) * 100
    : 0
)

const learningPercentage = computed(() =>
  props.stats.totalWords > 0
    ? (props.stats.learningWords / props.stats.totalWords) * 100
    : 0
)

const familiarPercentage = computed(() =>
  props.stats.totalWords > 0
    ? (props.stats.familiarWords / props.stats.totalWords) * 100
    : 0
)

const masteredPercentage = computed(() =>
  props.stats.totalWords > 0
    ? (props.stats.masteredWords / props.stats.totalWords) * 100
    : 0
)
</script>

<style scoped>
.learning-stats {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  padding: 1rem;
}

.learning-stats.show {
  opacity: 1;
  visibility: visible;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.stats-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f7fafc;
}

.close-btn svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: #718096;
}

.stats-content {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.stats-section {
  margin-bottom: 2.5rem;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #4a5568;
}

.progress-overview {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.circle-bg {
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #48bb78;
}

.progress-label {
  font-size: 0.875rem;
  color: #718096;
}

.progress-details {
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #718096;
  font-size: 0.875rem;
}

.detail-item .value {
  font-weight: 600;
  font-size: 1rem;
}

.value.mastered {
  color: #3182ce;
}

.value.familiar {
  color: #38a169;
}

.value.learning {
  color: #dd6b20;
}

.familiarity-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 1rem;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  border-radius: 0.25rem 0.25rem 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 20px;
  transition: height 0.6s ease;
}

.bar.unknown {
  background: #e53e3e;
}

.bar.learning {
  background: #dd6b20;
}

.bar.familiar {
  background: #38a169;
}

.bar.mastered {
  background: #3182ce;
}

.bar-label {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem;
}

.bar-name {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #718096;
  text-align: center;
}

.today-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 1rem;
}

.today-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.today-icon.new {
  background: #fed7e2;
  color: #e53e3e;
}

.today-icon.review {
  background: #bee3f8;
  color: #3182ce;
}

.today-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

.today-content {
  display: flex;
  flex-direction: column;
}

.today-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.today-label {
  font-size: 0.875rem;
  color: #718096;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .stats-content {
    padding: 1.5rem;
    margin: 1rem;
    max-height: 90vh;
  }

  .progress-overview {
    flex-direction: column;
    text-align: center;
  }

  .progress-circle {
    width: 100px;
    height: 100px;
  }

  .familiarity-chart {
    height: 150px;
  }

  .today-stats {
    grid-template-columns: 1fr;
  }
}
</style>
