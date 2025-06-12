<template>
  <AppLayout @clear-cache="handleClearCache">
    <div class="word-list-container" @touchmove.stop>
      <!-- 搜索和跳转栏 -->
      <div class="search-section">
        <div class="search-box search-box-no-margin">
          <div class="search-tabs">
            <button
              class="search-tab"
              :class="{ active: searchMode === 'word' }"
              @click="searchMode = 'word'"
            >
              单词搜索
            </button>
            <button
              class="search-tab"
              :class="{ active: searchMode === 'number' }"
              @click="searchMode = 'number'"
            >
              序号跳转
            </button>
            <button
              class="search-tab"
              :class="{ active: searchMode === 'frequency' }"
              @click="searchMode = 'frequency'"
            >
              词频跳转
            </button>
          </div>

          <!-- 单词搜索 -->
          <div v-if="searchMode === 'word'" class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24">
              <path
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索单词..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
              <svg viewBox="0 0 24 24">
                <path
                  d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z"
                />
              </svg>
            </button>
          </div>

          <!-- 序号跳转 -->
          <div v-if="searchMode === 'number'" class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24">
              <path
                d="M4,17V9H2V7H6V17H4M22,15C22,16.11 21.1,17 20,17H16V15H20V13H18V11H20V9H16V7H20A2,2 0 0,1 22,9V10.5A1.5,1.5 0 0,1 20.5,12A1.5,1.5 0 0,1 22,13.5V15M14,15V17H8V13C8,11.89 8.9,11 10,11H12V9H8V7H12A2,2 0 0,1 14,9V11C14,12.11 13.1,13 12,13H10V15H14Z"
              />
            </svg>
            <input
              v-model="numberInput"
              type="number"
              placeholder="输入序号..."
              class="search-input"
              min="1"
              :max="wordStore.words.length"
              @keyup.enter="jumpToNumber"
            />
            <button class="jump-btn" @click="jumpToNumber">跳转</button>
          </div>

          <!-- 词频搜索 -->
          <div v-if="searchMode === 'frequency'" class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24">
              <path
                d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"
              />
            </svg>
            <input
              v-model="frequencyInput"
              type="number"
              placeholder="搜索词频..."
              class="search-input"
              min="1"
            />
            <button
              v-if="frequencyInput"
              @click="clearSearch"
              class="clear-btn"
            >
              <svg viewBox="0 0 24 24">
                <path
                  d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 单词列表 -->
      <div class="word-list" ref="wordListRef" @scroll="handleScroll">
        <div
          v-for="word in filteredWords"
          :key="word.number"
          class="word-item"
          :class="{ learned: wordStore.isWordLearned(word.number) }"
          @click="handleWordClick(word)"
        >
          <div class="word-content">
            <span class="word-text">{{ word.word }}</span>
            <span class="word-meaning">{{ word.meaning }}</span>
          </div>
          <svg
            v-if="wordStore.isWordLearned(word.number)"
            viewBox="0 0 24 24"
            class="learned-icon"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>

        <!-- 无结果提示 -->
        <div v-if="filteredWords.length === 0" class="no-results">
          <svg class="no-results-icon" viewBox="0 0 24 24">
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <p>没有找到匹配的单词</p>
          <button @click="clearSearch" class="clear-search-btn">
            清空搜索
          </button>
        </div>
      </div>

      <!-- 确认弹窗 -->
      <div v-if="showConfirm" class="confirm-dialog" @click="cancelConfirm">
        <div class="confirm-content" @click.stop>
          <h3>标记学习进度</h3>
          <p>是否将此单词之前的所有单词标记为已学习？</p>
          <div class="confirm-actions">
            <button class="cancel-btn" @click="cancelConfirm">否</button>
            <button class="confirm-btn" @click="confirmAndStart">是</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWordStore } from '../stores/wordStore'
import type { Word } from '../types/word'
import AppLayout from '../components/layout/AppLayout.vue'

// 状态管理
const wordStore = useWordStore()
const router = useRouter()

// 响应式数据
const searchMode = ref<'word' | 'number' | 'frequency'>('word')
const searchQuery = ref('')
const numberInput = ref('')
const frequencyInput = ref('')
const pageSize = 100
const currentPage = ref(1)
const isLoading = ref(false)
const wordListRef = ref<HTMLElement | null>(null)

// 确认弹窗状态
const showConfirm = ref(false)
const selectedWordIndex = ref(-1)

// 计算属性
const filteredWords = computed(() => {
  let words = [...wordStore.words]

  // 搜索过滤
  if (searchMode.value === 'word' && searchQuery.value) {
    // 单词搜索
    const query = searchQuery.value.toLowerCase()
    words = words.filter(
      (word) =>
        word.word.toLowerCase().includes(query) || word.meaning.includes(query)
    )
  } else if (searchMode.value === 'frequency' && frequencyInput.value) {
    const targetFreq = parseInt(frequencyInput.value)
    if (!isNaN(targetFreq)) {
      // 先查找完全匹配的
      const exactMatches = words.filter((word) => word.frequency === targetFreq)

      if (exactMatches.length > 0) {
        // 有完全匹配的词频，只显示第一个
        words = [exactMatches[0]]
      } else {
        // 没有完全匹配的，显示接近的（上下浮动50）
        const range = 50
        words = words
          .filter(
            (word) =>
              word.frequency >= targetFreq - range &&
              word.frequency <= targetFreq + range
          )
          .sort((a, b) => {
            // 按照与目标词频的接近程度排序
            const diffA = Math.abs(a.frequency - targetFreq)
            const diffB = Math.abs(b.frequency - targetFreq)
            return diffA - diffB
          })
      }
    }
  }

  // 只在普通浏览时进行分页（没有搜索且不在词频模式）
  if (!searchQuery.value && !frequencyInput.value) {
    words = words.slice(0, currentPage.value * pageSize)
  }

  return words
})

const hasMore = computed(() => {
  // 只在普通浏览模式下显示加载更多
  return (
    !searchQuery.value &&
    !frequencyInput.value &&
    currentPage.value * pageSize < wordStore.words.length
  )
})

// 方法
const clearSearch = () => {
  searchQuery.value = ''
  numberInput.value = ''
  frequencyInput.value = ''
  currentPage.value = 1
}

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  try {
    currentPage.value++
  } finally {
    isLoading.value = false
  }
}

const handleScroll = () => {
  if (!wordListRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = wordListRef.value
  // 当滚动到距离底部100px时就开始加载
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore()
  }
}

const getOriginalIndex = (word: Word) => {
  return wordStore.words.findIndex((w) => w.number === word.number)
}

const startLearningFrom = (index: number) => {
  if (index >= 0) {
    wordStore.jumpToWord(index)
    router.push('/')
  }
}

const jumpToNumber = () => {
  const number = parseInt(numberInput.value)
  if (number > 0 && number <= wordStore.words.length) {
    startLearningFrom(number - 1) // 序号从1开始，索引从0开始
  }
}

const handleWordClick = (word: Word) => {
  const index = getOriginalIndex(word)
  if (index > 0 && !wordStore.isWordLearned(word.number)) {
    // 如果不是第一个单词且未学习，显示确认弹窗
    selectedWordIndex.value = index
    showConfirm.value = true
  } else {
    // 如果是第一个单词或已学习，直接跳转
    startLearningFrom(index)
  }
}

const cancelConfirm = () => {
  showConfirm.value = false
  startLearningFrom(selectedWordIndex.value)
}

const confirmAndStart = () => {
  // 保存进度
  wordStore.saveProgress(selectedWordIndex.value - 1)
  showConfirm.value = false
  startLearningFrom(selectedWordIndex.value)
}

const handleClearCache = () => {
  // 清除所有本地存储
  localStorage.removeItem('wordRecords')
  localStorage.removeItem('wordApp_progress')
  localStorage.removeItem('wordApp_settings')
  localStorage.removeItem('wordApp_current_round')
  localStorage.removeItem('wordApp_learning_sequence')
  localStorage.removeItem('wordApp_has_selected_mode')

  // 重置 store 状态
  wordStore.resetProgress()

  // 重新加载数据
  wordStore.initializeStore()
}

// 生命周期
onMounted(() => {
  wordStore.initializeStore()
})
</script>

<style scoped>
.word-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* 搜索和筛选区域 */
.search-section {
  flex-shrink: 0;
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px -8px rgba(0, 0, 0, 0.05);
  z-index: 1;
  touch-action: none;
}

.search-box {
  position: relative;
}

.search-box-no-margin {
  margin-bottom: 0;
}

.search-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.search-tab {
  padding: 0.625rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-tab:hover {
  background: rgba(37, 99, 235, 0.04);
  border-color: #e2e8f0;
  color: #2563eb;
}

.search-tab.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.search-input-group {
  position: relative;
  display: flex;
  gap: 0.75rem;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.375rem;
  height: 1.375rem;
  fill: #94a3b8;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1.25rem 0.875rem 3.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  color: #0f172a;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #94a3b8;
}

.clear-btn:hover {
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}

.clear-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}

.jump-btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 0.75rem;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.jump-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* 单词列表 */
.word-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.5rem;
  margin-bottom: calc(env(safe-area-inset-bottom, 0.75rem) + 5rem);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
  user-select: none;
  cursor: pointer;
}

.word-list::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.word-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.word-item.learned {
  background: rgba(5, 150, 105, 0.04);
  border-color: rgba(5, 150, 105, 0.1);
}

.word-item:hover {
  background: rgba(37, 99, 235, 0.04);
  border-color: rgba(37, 99, 235, 0.1);
}

.word-item.learned:hover {
  background: rgba(5, 150, 105, 0.08);
  border-color: rgba(5, 150, 105, 0.15);
}

.word-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.word-number {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  min-width: 2.5rem;
}

.word-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #0f172a;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.word-meaning {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.word-frequency {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.word-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: rgba(37, 99, 235, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.word-item:hover .word-actions {
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.05);
}

.play-icon {
  width: 1.375rem;
  height: 1.375rem;
  fill: #2563eb;
}

.learned-icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: #059669;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

/* 无结果提示 */
.no-results {
  text-align: center;
  padding: 3rem 0;
  color: #64748b;
}

.no-results-icon {
  width: 2.5rem;
  height: 2.5rem;
  fill: #94a3b8;
  margin-bottom: 0.75rem;
}

.no-results p {
  font-size: 1rem;
  margin: 0 0 1rem;
}

.clear-search-btn {
  padding: 0.625rem 1.5rem;
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-search-btn:hover {
  background: rgba(37, 99, 235, 0.1);
}

/* 响应式适配 */
@media (max-width: 480px) {
  .search-section {
    padding: 0.75rem 1rem;
  }

  .word-list {
    padding: 0.5rem 1rem;
    margin-bottom: calc(env(safe-area-inset-bottom, 0.75rem) + 4.5rem);
  }

  .word-item {
    padding: 0.875rem 1rem;
    margin-bottom: 0.5rem;
    min-height: 3.25rem;
  }

  .word-number {
    font-size: 0.6875rem;
    min-width: 2rem;
  }

  .word-text {
    font-size: 1rem;
  }

  .word-meaning {
    font-size: 0.8125rem;
  }

  .word-frequency {
    font-size: 0.6875rem;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .word-list-container {
    background: #0f172a;
  }

  .search-section {
    background: rgba(15, 23, 42, 0.98);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .word-item {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(255, 255, 255, 0.06);
  }

  .word-item:hover {
    background: rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.2);
  }

  .word-item.learned {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(5, 150, 105, 0.2);
  }

  .word-item.learned:hover {
    background: rgba(5, 150, 105, 0.15);
    border-color: rgba(5, 150, 105, 0.25);
  }

  .word-number,
  .word-frequency {
    color: #64748b;
  }

  .word-text {
    color: #f1f5f9;
  }

  .word-meaning {
    color: #94a3b8;
  }

  .no-results {
    color: #94a3b8;
  }

  .no-results-icon {
    fill: #64748b;
  }

  .clear-search-btn {
    background: rgba(37, 99, 235, 0.15);
    color: #60a5fa;
  }

  .clear-search-btn:hover {
    background: rgba(37, 99, 235, 0.2);
  }

  .learned-icon {
    fill: #10b981;
  }
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
  padding: 1rem;
}

.confirm-content {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

.confirm-content h3 {
  margin: 0 0 0.75rem;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.confirm-content p {
  margin: 0 0 1.5rem;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.confirm-actions button {
  padding: 0.75rem 2rem;
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
  background: #2563eb;
  border: 1px solid #2563eb;
  color: white;
}

.confirm-btn:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .confirm-content {
    background: #1e293b;
  }

  .confirm-content h3 {
    color: #f1f5f9;
  }

  .confirm-content p {
    color: #94a3b8;
  }

  .cancel-btn {
    background: #0f172a;
    border-color: #334155;
    color: #e2e8f0;
  }

  .cancel-btn:hover {
    background: #1e293b;
    border-color: #475569;
    color: #f1f5f9;
  }

  .confirm-btn {
    background: #2563eb;
    border-color: #2563eb;
  }

  .confirm-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }
}
</style>
