export type Assessment = {
  _id: string;
  user: string;
  topic: string;
  currentLevel: number;
  highestLevelCompleted: number;
  status: 'in-progress' | 'completed' | 'failed' | 'pending' | 'not-started' | 'expired' | 'cancelled';
  score: number;
  passThreshold: number;
  questions: Question[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Question = {
  _id: string;
  level: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  scoreWeight: number;
  userAnswer?: string;
  isCorrect?: boolean;
}
