// ============================================================
// Utility Functions
// ============================================================

import { CATEGORIES, FEEDBACK_MESSAGES } from "../config/gameContent";
import type { GameItem, RoundConfig, RoundData, FeedbackMessage, Submission, Survey, Student } from "../types";

export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pickRandom = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

export const getFeedback = (type: string, answer: string): FeedbackMessage => {
  const msgs = FEEDBACK_MESSAGES[type];
  const m = msgs[Math.floor(Math.random() * msgs.length)];
  return { t: m.t.replace("{a}", answer), s: m.s };
};

export const generateRound = (rc: RoundConfig): RoundData => {
  const cat = CATEGORIES[rc.category];
  const shown = pickRandom(cat.items, rc.imageCount);
  const rest = cat.items.filter((i) => !shown.some((s) => s.id === i.id));

  const qs = shown.slice(0, rc.questionCount).map((correct) => {
    const pool = rest.length >= 3 ? rest : cat.items.filter((x) => x.id !== correct.id);
    const distractors = pickRandom(pool, 3).filter((d) => d.id !== correct.id);
    const uniqueOpts = [correct];
    const seenIds = new Set<string>([correct.id]);
    distractors.forEach((d) => {
      if (!seenIds.has(d.id)) { seenIds.add(d.id); uniqueOpts.push(d); }
    });
    while (uniqueOpts.length < 4 && pool.length > 0) {
      const extra = pool.find((p) => !seenIds.has(p.id));
      if (!extra) break;
      seenIds.add(extra.id);
      uniqueOpts.push(extra);
    }
    const opts = shuffle(uniqueOpts);
    return {
      qText: `Which ${cat.qLabel} did you see?`,
      correct,
      opts,
    };
  });

  return { shown: shuffle(shown), qs };
};

export const exportSubmissionsCSV = (
  subs: Submission[],
  students: Student[],
  surveys: Survey[],
  filename?: string
): void => {
  const headers = [
    "student_id", "group", "age", "grade", "round", "question_num",
    "question_text", "correct_answer", "selected_answer", "is_correct",
    "is_timeout", "response_time_ms", "images_shown", "memorization_time_ms",
    "timestamp", "enjoyment", "play_again", "self_efficacy",
  ];

  const rows = subs.map((s) => {
    const sv = surveys.find((v) => v.studentId === s.studentId && v.sessionId === s.sessionId);
    const st = students.find((x) => x.studentId === s.studentId);
    return [
      s.studentId, s.group, st?.age || "", st?.grade || "",
      s.round, s.questionIndex + 1, `"${s.questionText}"`,
      s.correctAnswer, s.selectedAnswer || "", s.isCorrect,
      s.isTimeout, s.responseTimeMs, `"${s.imagesShown.join(";")}"`,
      s.memorizationTimeMs, s.timestamp,
      sv?.enjoyment || "", sv?.playAgain || "", sv?.selfEfficacy || "",
    ];
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `memory_game_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Block randomization: balance groups per classroom
export const assignGroup = (
  existingStudents: Student[],
  classroom: string
): "A" | "B" => {
  const classStudents = existingStudents.filter((x) => x.classroom === classroom);
  const aCount = classStudents.filter((x) => x.group === "A").length;
  const bCount = classStudents.filter((x) => x.group === "B").length;
  return aCount <= bCount ? "A" : "B";
};
