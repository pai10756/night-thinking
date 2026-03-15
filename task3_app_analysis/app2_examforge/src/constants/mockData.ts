export const userProfile = {
  name: '小明',
  streak: 15,
  totalStudyHours: 47.5,
  totalQuestions: 1284,
  accuracy: 78,
  longestStreak: 23,
  joinDate: '2025-12-01',
};

export const todayPlan = {
  targetQuestions: 30,
  completedQuestions: 12,
  estimatedMinutes: 18,
};

export const recentActivity = [
  {
    id: '1',
    title: '台灣駕照筆試 - 交通號誌',
    date: '今天 09:30',
    score: '8/10',
    scorePercent: 80,
  },
  {
    id: '2',
    title: '全民英檢 GEPT - 閱讀測驗',
    date: '昨天 21:15',
    score: '12/15',
    scorePercent: 80,
  },
  {
    id: '3',
    title: 'JLPT N3 - 文法',
    date: '昨天 14:00',
    score: '6/10',
    scorePercent: 60,
  },
];

export const practiceQuestion = {
  id: 1,
  total: 30,
  category: '交通號誌',
  examName: '台灣駕照筆試',
  question: '在設有乘客乘車處標誌之路段，行車時應注意下列何者？',
  options: [
    { label: 'A', text: '減速慢行，注意乘客上下車安全' },
    { label: 'B', text: '加速快速通過' },
    { label: 'C', text: '按鳴喇叭，警告行人' },
    { label: 'D', text: '切換車道繞行' },
  ],
  correctAnswer: 0,
  explanation:
    '在設有乘客乘車處標誌之路段，駕駛人應減速慢行，並注意乘客上下車的安全，以避免交通事故發生。',
};

export const analyticsCategories = [
  { name: '交通號誌', mastery: 92, status: 'mastered' as const, total: 120, correct: 110 },
  { name: '交通規則', mastery: 78, status: 'proficient' as const, total: 85, correct: 66 },
  { name: '法規常識', mastery: 40, status: 'weak' as const, total: 60, correct: 24 },
  { name: '行車安全', mastery: 85, status: 'mastered' as const, total: 70, correct: 60 },
  { name: '急救常識', mastery: 55, status: 'review' as const, total: 40, correct: 22 },
  { name: '肇事處理', mastery: 68, status: 'proficient' as const, total: 50, correct: 34 },
];

export const weeklyStudyTime = [
  { day: '一', minutes: 45 },
  { day: '二', minutes: 30 },
  { day: '三', minutes: 60 },
  { day: '四', minutes: 25 },
  { day: '五', minutes: 50 },
  { day: '六', minutes: 75 },
  { day: '日', minutes: 40 },
];

export const examModules = [
  {
    id: '1',
    flag: '\u{1F1F9}\u{1F1FC}',
    name: '台灣駕照筆試',
    totalQuestions: 1600,
    mastery: 72,
    price: '已購買',
    purchased: true,
  },
  {
    id: '2',
    flag: '\u{1F1F9}\u{1F1FC}',
    name: '全民英檢 GEPT',
    totalQuestions: 2400,
    mastery: 58,
    price: '已購買',
    purchased: true,
  },
  {
    id: '3',
    flag: '\u{1F1EF}\u{1F1F5}',
    name: '日本語能力試驗 JLPT N3',
    totalQuestions: 1800,
    mastery: 35,
    price: '$2.99',
    purchased: false,
  },
  {
    id: '4',
    flag: '\u{1F1EC}\u{1F1E7}',
    name: 'UK Driving Theory',
    totalQuestions: 900,
    mastery: 0,
    price: '$2.99',
    purchased: false,
  },
  {
    id: '5',
    flag: '\u{1F1FA}\u{1F1F8}',
    name: 'US Citizenship Test',
    totalQuestions: 600,
    mastery: 0,
    price: '$1.99',
    purchased: false,
  },
];

export const achievements = [
  { id: '1', name: '初學者', description: '完成第一次練習', icon: 'star', earned: true },
  { id: '2', name: '連續七天', description: '連續學習 7 天', icon: 'flame', earned: true },
  { id: '3', name: '百題達人', description: '累計完成 100 題', icon: 'trophy', earned: true },
  { id: '4', name: '千題大師', description: '累計完成 1000 題', icon: 'crown', earned: true },
  { id: '5', name: '完美成績', description: '模擬考獲得 100 分', icon: 'medal', earned: false },
  { id: '6', name: '學霸', description: '連續學習 30 天', icon: 'academic-cap', earned: false },
  { id: '7', name: '全科精通', description: '所有科目達到 85%', icon: 'check-circle', earned: false },
  { id: '8', name: '速度之王', description: '在限時內完成模擬考', icon: 'lightning-bolt', earned: false },
];

export const settingsItems = [
  { id: '1', title: '通知設定', subtitle: '每日提醒、學習目標通知' },
  { id: '2', title: '學習偏好', subtitle: '每日目標題數、計時模式' },
  { id: '3', title: '顯示設定', subtitle: '字體大小、深色模式' },
  { id: '4', title: '購買與訂閱', subtitle: '管理已購買的考試模組' },
  { id: '5', title: '關於 ExamForge', subtitle: '版本 1.0.0' },
];
