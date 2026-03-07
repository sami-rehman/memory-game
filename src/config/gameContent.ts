import type { Category, RoundConfig, FeedbackMessage } from "../types";

// Real photos from Unsplash CDN: https://images.unsplash.com/photo-{id}?w=640&q=80
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=640&q=80&fit=crop`;

export const CATEGORIES: Record<string, Category> = {
  animals: {
    label: "Animals",
    qLabel: "animal",
    items: [
      { id: "a1", name: "Dog", emoji: "🐕", img: U("1530281700549-e82e7bf110d6") },
      { id: "a2", name: "Eagle", emoji: "🦅", img: U("1637783038690-e4349f6981d7") },
      { id: "a3", name: "Elephant", emoji: "🐘", img: U("1453550486481-aa4175b013ea") },
      { id: "a4", name: "Cat", emoji: "🐱", img: U("1514888286974-6c03e2ca1dba") },
      { id: "a5", name: "Fish", emoji: "🐟", img: U("1522069169874-c58ec4b76be5") },
      { id: "a6", name: "Horse", emoji: "🐎", img: U("1553284965-83fd3e82fa5a") },
      { id: "a7", name: "Monkey", emoji: "🐒", img: U("1710196304456-27e81e76624e") },
      { id: "a8", name: "Fox", emoji: "🦊", img: U("1644125003076-ce465d331769") },
      { id: "a9", name: "Penguin", emoji: "🐧", img: U("1598439210625-5067c578f3f6") },
    ],
  },
  fruits: {
    label: "Fruits & Veggies",
    qLabel: "fruit or vegetable",
    items: [
      { id: "f1", name: "Apple", emoji: "🍎", img: U("1619546813926-a78fa6372cd2") },
      { id: "f2", name: "Banana", emoji: "🍌", img: U("1587132137056-bfbf0166836e") },
      { id: "f3", name: "Grapes", emoji: "🍇", img: U("1596363505729-4190a9506133") },
      { id: "f4", name: "Carrot", emoji: "🥕", img: U("1598170845058-32b9d6a5da37") },
      { id: "f5", name: "Strawberry", emoji: "🍓", img: U("1616690602454-882bbb363daa") },
      { id: "f6", name: "Broccoli", emoji: "🥦", img: U("1614336215203-05a588f74627") },
      { id: "f7", name: "Orange", emoji: "🍊", img: U("1642054016707-ec809a9c5ba0") },
      { id: "f8", name: "Watermelon", emoji: "🍉", img: U("1587049352846-4a222e784d38") },
      { id: "f9", name: "Lemon", emoji: "🍋", img: U("1770944418685-b05696bcb3d3") },
      { id: "f10", name: "Pineapple", emoji: "🍍", img: U("1589820296156-2454bb8a6ad1") },
    ],
  },
  flags: {
    label: "Countries",
    qLabel: "country flag",
    items: [
      { id: "g1", name: "France", emoji: "🇫🇷", img: "https://flagcdn.com/w320/fr.png" },
      { id: "g2", name: "Japan", emoji: "🇯🇵", img: "https://flagcdn.com/w320/jp.png" },
      { id: "g3", name: "Tunisia", emoji: "🇹🇳", img: "https://flagcdn.com/w320/tn.png" },
      { id: "g4", name: "UK", emoji: "🇬🇧", img: "https://flagcdn.com/w320/gb.png" },
      { id: "g5", name: "Canada", emoji: "🇨🇦", img: "https://flagcdn.com/w320/ca.png" },
      { id: "g6", name: "Australia", emoji: "🇦🇺", img: "https://flagcdn.com/w320/au.png" },
      { id: "g7", name: "Pakistan", emoji: "🇵🇰", img: "https://flagcdn.com/w320/pk.png" },
      { id: "g8", name: "Egypt", emoji: "🇪🇬", img: "https://flagcdn.com/w320/eg.png" },
      { id: "g9", name: "Germany", emoji: "🇩🇪", img: "https://flagcdn.com/w320/de.png" },
      { id: "g10", name: "Greece  ", emoji: "🇬🇷", img: "https://flagcdn.com/w320/gr.png" },
    ],
  },
};

export const ROUNDS: RoundConfig[] = [
  { round: 1, label: "Round 1", category: "animals", imageCount: 4, questionCount: 4, memTime: 15, qTime: 15, tagline: "Can you remember these animals?", diff: "Warm Up" },
  { round: 2, label: "Round 2", category: "fruits", imageCount: 6, questionCount: 6, memTime: 20, qTime: 12, tagline: "Time for fruits and veggies!", diff: "Getting Harder" },
  { round: 3, label: "Round 3", category: "flags", imageCount: 6, questionCount: 6, memTime: 20, qTime: 10, tagline: "Do you know these flags?", diff: "Expert" },
];

/** Kid-friendly feedback: simple words, encouraging, easy to understand and read aloud (TTS). */
export const FEEDBACK_MESSAGES: Record<string, { t: string; s: string }[]> = {
  correct: [
    { t: "Yes! You got it! It was {a}.", s: "You are a super star! Keep going!" },
    { t: "That's right! It was {a}.", s: "Your brain is so strong! Well done!" },
    { t: "Correct! It was {a}.", s: "You looked so carefully! Great job!" },
    { t: "You remembered! It was {a}.", s: "You're doing amazing! Don't stop!" },
    { t: "Right answer! It was {a}.", s: "You're getting better and better!" },
  ],
  incorrect: [
    { t: "Not this time. The right answer was {a}.", s: "That's okay! You can try again on the next one." },
    { t: "It was {a}. Good try!", s: "Every try makes your brain stronger! Keep going!" },
    { t: "The answer was {a}. Nice try!", s: "You're brave for trying! Next question is yours!" },
    { t: "Close! It was {a}.", s: "Mistakes help us learn. You're doing great!" },
    { t: "It was {a}. No worries!", s: "One wrong is okay. You've got the next one!" },
  ],
  timeout: [
    { t: "Time ran out! The answer was {a}.", s: "No problem! Take your time on the next one." },
    { t: "Time's up! It was {a}.", s: "You're still doing great! Ready for the next?" },
    { t: "We ran out of time. It was {a}.", s: "That's okay! Keep going — you've got this!" },
  ],
};

// ── Intervention: curiosity, emotion regulation, self-efficacy ──
// Used for classroom intervention (see docs/INTERVENTION_DESIGN.md)

/** Curiosity hooks shown before each round to boost attention and engagement. */
export const CURIOSITY_HOOKS = [
  "How many can you remember?",
  "Which one will stick in your mind?",
  "Ready to test your eyes and brain?",
  "Can you spot every one?",
  "Your memory is about to get a workout!",
];

/** Kid-friendly emotion-regulation: short, kind, easy to understand. */
export const EMOTION_REGULATION_PROMPTS = [
  "It's okay! Take a breath. The next one is for you!",
  "Everyone misses sometimes. You're still doing great!",
  "No worries! The next picture is waiting for you!",
  "You're still in the game! Ready for the next one?",
];

/** Optional curiosity line per round (overrides random hook when set). */
export const ROUND_CURIOSITY: Record<number, string> = {
  1: "How many animals can you remember?",
  2: "Which fruit or vegetable will stick in your mind?",
  3: "Can you match every flag you saw?",
};

/** Self-efficacy line for round end (Group B). Picks by performance tier. */
export const ROUND_END_SELF_EFFICACY: Record<"high" | "mid" | "low", string> = {
  high: "Your focus really showed!",
  mid: "You're getting better at this.",
  low: "Every round is practice — you're building your memory.",
};

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@500;600;700&display=swap";

export const FONT_FAMILY = "'Baloo 2','Quicksand',sans-serif";
