// 单词数据类型
export interface Word {
  number: number
  frequency: number
  word: string
  meaning: string
  variant: string | null
}

// 学习记录类型
export interface WordRecord {
  wordId: number
  familiarity: 'unknown' | 'learning' | 'familiar' | 'mastered'
  viewCount: number
  totalViewTime: number // 总停留时间（毫秒）
  lastViewTime: number // 最后查看时间戳
  averageViewTime: number // 平均停留时间
}

// 学习统计类型
export interface LearningStats {
  totalWords: number
  unknownWords: number
  learningWords: number
  familiarWords: number
  masteredWords: number
  todayNewWords: number
  todayReviewWords: number
}
