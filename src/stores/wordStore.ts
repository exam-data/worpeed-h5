import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Word, WordRecord, LearningStats } from '../types/word'
import wordData from '../assets/netem_full_list.json'

export const useWordStore = defineStore('word', () => {
  // 状态
  const words = ref<Word[]>(wordData.list)
  const originalWords = [...wordData.list] // 保存原始顺序
  const learningSequence = ref<number[]>([]) // 学习顺序（存储单词索引）
  const wordRecords = ref<Map<number, WordRecord>>(new Map())
  const currentWordIndex = ref(0)
  const isLoading = ref(false)
  const learnedWords = ref<Set<number>>(new Set())
  const currentRound = ref(1)

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

    // 加载当前轮数
    const savedRound = localStorage.getItem('wordApp_current_round')
    if (savedRound) {
      try {
        currentRound.value = parseInt(savedRound)
      } catch (e) {
        console.error('加载轮数失败:', e)
      }
    }
  }

  // 保存到localStorage
  const saveToStorage = () => {
    try {
      const data = Array.from(wordRecords.value.entries())
      localStorage.setItem('wordRecords', JSON.stringify(data))
      localStorage.setItem(
        'wordApp_current_round',
        currentRound.value.toString()
      )
    } catch (e) {
      console.error('保存学习记录失败:', e)
    }
  }

  // 获取实际的单词索引
  const getRealIndex = (index: number) => {
    if (learningSequence.value.length > 0) {
      return learningSequence.value[index]
    }
    return index
  }

  // 获取单词在学习序列中的位置
  const getSequenceIndex = (wordNumber: number) => {
    if (learningSequence.value.length > 0) {
      return learningSequence.value.findIndex(
        (idx) => words.value[idx].number === wordNumber
      )
    }
    return words.value.findIndex((word) => word.number === wordNumber)
  }

  // 计算属性
  const currentWord = computed(() => {
    const index = getRealIndex(currentWordIndex.value)
    return words.value[index]
  })

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

    // 加载已学习的单词
    const savedProgress = localStorage.getItem('wordApp_progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        learnedWords.value = new Set(progress.learnedWords)
      } catch (e) {
        console.error('加载进度失败:', e)
      }
    }

    // 加载学习顺序
    const savedSequence = localStorage.getItem('wordApp_learning_sequence')
    if (savedSequence) {
      try {
        const sequence = JSON.parse(savedSequence)
        learningSequence.value = sequence
      } catch (e) {
        console.error('加载学习顺序失败:', e)
      }
    }
  }

  const nextWord = () => {
    if (currentWordIndex.value < words.value.length - 1) {
      currentWordIndex.value++
    } else {
      // 循环回到开始
      currentWordIndex.value = 0
    }
  }

  const prevWord = () => {
    if (currentWordIndex.value > 0) {
      currentWordIndex.value--
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
    learnedWords.value.clear()
    localStorage.removeItem('wordApp_progress')
    saveToStorage()
  }

  const jumpToWord = (index: number) => {
    if (index >= 0 && index < words.value.length) {
      currentWordIndex.value = index
    }
  }

  const saveProgress = (currentIndex: number) => {
    // 将当前索引之前的所有单词标记为已学习
    if (learningSequence.value.length > 0) {
      // 随机模式：使用学习序列中的索引
      for (let i = 0; i <= currentIndex; i++) {
        const realIndex = learningSequence.value[i]
        learnedWords.value.add(words.value[realIndex].number)
      }
    } else {
      // 顺序模式：直接使用索引
      for (let i = 0; i <= currentIndex; i++) {
        learnedWords.value.add(words.value[i].number)
      }
    }

    // 保存进度
    try {
      localStorage.setItem(
        'wordApp_progress',
        JSON.stringify({
          learnedWords: Array.from(learnedWords.value)
        })
      )
    } catch (e) {
      console.error('保存进度失败:', e)
    }
  }

  const isWordLearned = (wordNumber: number) => {
    return learnedWords.value.has(wordNumber)
  }

  const unmarkWord = (wordNumber: number) => {
    learnedWords.value.delete(wordNumber)
    // 保存进度
    try {
      localStorage.setItem(
        'wordApp_progress',
        JSON.stringify({
          learnedWords: Array.from(learnedWords.value)
        })
      )
    } catch (e) {
      console.error('保存进度失败:', e)
    }
  }

  // 打乱学习顺序
  const shuffleWords = () => {
    // 生成索引数组
    learningSequence.value = Array.from(
      { length: words.value.length },
      (_, i) => i
    )
    // 打乱索引数组
    for (let i = learningSequence.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[learningSequence.value[i], learningSequence.value[j]] = [
        learningSequence.value[j],
        learningSequence.value[i]
      ]
    }
    currentWordIndex.value = 0
  }

  // 恢复原始顺序
  const restoreOriginalOrder = () => {
    learningSequence.value = []
    currentWordIndex.value = 0
  }

  // 保存学习顺序
  const saveLearningSequence = () => {
    try {
      localStorage.setItem(
        'wordApp_learning_sequence',
        JSON.stringify(learningSequence.value)
      )
    } catch (e) {
      console.error('保存学习顺序失败:', e)
    }
  }

  return {
    // 状态
    words,
    wordRecords,
    currentWordIndex,
    isLoading,
    learnedWords,
    currentRound,

    // 计算属性
    currentWord,
    currentWordRecord,
    learningStats,

    // 方法
    initializeStore,
    nextWord,
    prevWord,
    recordWordView,
    resetProgress,
    jumpToWord,
    saveProgress,
    isWordLearned,
    unmarkWord,
    shuffleWords,
    restoreOriginalOrder,
    saveLearningSequence
  }
})
