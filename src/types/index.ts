// ============================================================
// Memory Game Platform — Type Definitions
// ============================================================

export interface Student {
  studentId: string;
  age: number | null;
  grade: string | null;
  group: "A" | "B";
  classroom: string;
  assignedAt: string;
  status: "pending" | "playing" | "completed";
}

export interface GameSession extends Student {
  sessionStart: string;
}

export interface Submission {
  studentId: string;
  group: "A" | "B";
  sessionId: string;
  round: number;
  questionIndex: number;
  questionText: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  isTimeout: boolean;
  responseTimeMs: number;
  imagesShown: string[];
  memorizationTimeMs: number;
  timestamp: string;
}

export interface Survey {
  studentId: string;
  group: "A" | "B";
  sessionId: string;
  enjoyment: number;
  playAgain: number;
  selfEfficacy: number;
  totalSessionDurationMs: number;
  roundsCompleted: number;
  quitEarly: boolean;
  timestamp: string;
}

export interface GameItem {
  id: string;
  name: string;
  emoji: string;
  img: string;
}

export interface Category {
  label: string;
  qLabel: string;
  items: GameItem[];
}

export interface RoundConfig {
  round: number;
  label: string;
  category: string;
  imageCount: number;
  questionCount: number;
  memTime: number;
  qTime: number;
  tagline: string;
  diff: string;
}

export interface Question {
  qText: string;
  correct: GameItem;
  opts: GameItem[];
}

export interface RoundData {
  shown: GameItem[];
  qs: Question[];
}

export interface FeedbackMessage {
  t: string;
  s: string;
}

export interface AnswerResult {
  sel: GameItem | null;
  ok: boolean;
  to: boolean;
  ms: number;
}

export interface SurveyAnswers {
  enjoyment: number | null;
  playAgain: number | null;
  selfEfficacy: number | null;
}

export interface DataContextType {
  students: Student[];
  subs: Submission[];
  surveys: Survey[];
  addStudent: (s: Partial<Student>) => Student;
  getStudent: (id: string) => Student | undefined;
  updateStatus: (id: string, status: Student["status"]) => void;
  removeStudent: (id: string) => void;
  bulkAdd: (ids: string[], grade: string | null) => Student[];
  saveStudentOnComplete: (student: Student) => void;
  addSubs: (batch: Submission[]) => void;
  addSurvey: (s: Survey) => void;
  getStudentSubs: (id: string) => Submission[];
  getGroupSubs: (g: "A" | "B") => Submission[];
  exportCSV: () => void;
  loading: boolean;
}
