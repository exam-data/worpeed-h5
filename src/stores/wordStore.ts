import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Word, WordRecord, LearningStats } from '../types/word'
import wordData from '../assets/netem_full_list.json'

export const useWordStore = defineStore('word', () => {
  // 状态
  const words = ref<Word[]>(wordData.list)
  const wordRecords = ref<Map<number, WordRecord>>(new Map())
  const currentWordIndex = ref(0)
  const isLoading = ref(false)

  // 从localStorage加载数据
  const loadFromStorage = () => {
    const saved = localStorage.getItem('wordRecords')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        wordRecords.value = new Map(data)
      } catch (e) {
        console.error('加载学习记录失败:', e)
      }
    }
  }

  // 保存到localStorage
  const saveToStorage = () => {
    try {
      const data = Array.from(wordRecords.value.entries())
      localStorage.setItem('wordRecords', JSON.stringify(data))
    } catch (e) {
      console.error('保存学习记录失败:', e)
    }
  }

  // 计算属性
  const currentWord = computed(() => words.value[currentWordIndex.value])

  const currentWordRecord = computed(() => {
    const wordId = currentWord.value?.number
    if (!wordId) return null
    return wordRecords.value.get(wordId) || null
  })

  const learningStats = computed<LearningStats>(() => {
    const stats = {
      totalWords: words.value.length,
      unknownWords: 0,
      learningWords: 0,
      familiarWords: 0,
      masteredWords: 0,
      todayNewWords: 0,
      todayReviewWords: 0
    }

    const today = new Date().toDateString()

    for (const record of wordRecords.value.values()) {
      const lastViewDate = new Date(record.lastViewTime).toDateString()

      // 统计各熟悉度等级
      switch (record.familiarity) {
        case 'unknown':
          stats.unknownWords++
          break
        case 'learning':
          stats.learningWords++
          break
        case 'familiar':
          stats.familiarWords++
          break
        case 'mastered':
          stats.masteredWords++
          break
      }

      // 统计今日新增和复习
      if (lastViewDate === today) {
        if (record.viewCount === 1) {
          stats.todayNewWords++
        } else {
          stats.todayReviewWords++
        }
      }
    }

    stats.unknownWords =
      stats.totalWords -
      stats.learningWords -
      stats.familiarWords -
      stats.masteredWords

    return stats
  })

  // 方法
  const initializeStore = () => {
    loadFromStorage()
  }

  const nextWord = () => {
    if (currentWordIndex.value < words.value.length - 1) {
      currentWordIndex.value++
    } else {
      // 循环回到开始或者可以实现智能推荐
      currentWordIndex.value = 0
    }
  }

  const recordWordView = (viewTime: number) => {
    const word = currentWord.value
    if (!word) return

    const wordId = word.number
    const existing = wordRecords.value.get(wordId)
    const now = Date.now()

    if (existing) {
      // 更新现有记录
      existing.viewCount++
      existing.totalViewTime += viewTime
      existing.lastViewTime = now
      existing.averageViewTime = existing.totalViewTime / existing.viewCount

      // 根据停留时间智能判定熟悉度
      existing.familiarity = calculateFamiliarity(
        existing.averageViewTime,
        existing.viewCount
      )
    } else {
      // 创建新记录
      const newRecord: WordRecord = {
        wordId,
        familiarity: calculateFamiliarity(viewTime, 1),
        viewCount: 1,
        totalViewTime: viewTime,
        lastViewTime: now,
        averageViewTime: viewTime
      }
      wordRecords.value.set(wordId, newRecord)
    }

    saveToStorage()
  }

  // 智能判定熟悉度的算法
  const calculateFamiliarity = (
    averageViewTime: number,
    viewCount: number
  ): WordRecord['familiarity'] => {
    // 基于停留时间的判定逻辑
    // 停留时间越短，说明越熟悉
    if (averageViewTime < 1000) {
      // 小于1秒
      if (viewCount >= 3) return 'mastered'
      if (viewCount >= 2) return 'familiar'
      return 'learning'
    } else if (averageViewTime < 3000) {
      // 1-3秒
      if (viewCount >= 5) return 'familiar'
      if (viewCount >= 2) return 'learning'
      return 'unknown'
    } else if (averageViewTime < 5000) {
      // 3-5秒
      if (viewCount >= 3) return 'learning'
      return 'unknown'
    } else {
      // 超过5秒
      return 'unknown'
    }
  }

  const resetProgress = () => {
    wordRecords.value.clear()
    currentWordIndex.value = 0
    saveToStorage()
  }

  const jumpToWord = (index: number) => {
    if (index >= 0 && index < words.value.length) {
      currentWordIndex.value = index
    }
  }

  return {
    // 状态
    words,
    wordRecords,
    currentWordIndex,
    isLoading,

    // 计算属性
    currentWord,
    currentWordRecord,
    learningStats,

    // 方法
    initializeStore,
    nextWord,
    recordWordView,
    resetProgress,
    jumpToWord
  }
})
