// ============================================================
// 🔥 Firebase Service — Firestore CRUD Operations
// ============================================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type { Student, Submission, Survey } from "../types";

// ── Collection References ──
const studentsRef = () => collection(db!, "students");
const submissionsRef = () => collection(db!, "submissions");
const surveysRef = () => collection(db!, "surveys");

// ============================================================
// STUDENTS
// ============================================================

export const addStudentToFirestore = async (student: Student): Promise<void> => {
  await setDoc(doc(db!, "students", student.studentId), student);
};

export const getStudentFromFirestore = async (
  id: string
): Promise<Student | null> => {
  const snap = await getDoc(doc(db!, "students", id));
  return snap.exists() ? (snap.data() as Student) : null;
};

export const getAllStudentsFromFirestore = async (): Promise<Student[]> => {
  const snap = await getDocs(studentsRef());
  return snap.docs.map((d) => d.data() as Student);
};

export const updateStudentStatusInFirestore = async (
  id: string,
  status: Student["status"]
): Promise<void> => {
  await setDoc(doc(db!, "students", id), { status }, { merge: true });
};

export const removeStudentFromFirestore = async (
  id: string
): Promise<void> => {
  await deleteDoc(doc(db!, "students", id));
};

export const bulkAddStudentsToFirestore = async (
  students: Student[]
): Promise<void> => {
  const batch = writeBatch(db!);
  students.forEach((s) => {
    batch.set(doc(db!, "students", s.studentId), s);
  });
  await batch.commit();
};

// Real-time listener for students
export const subscribeToStudents = (
  callback: (students: Student[]) => void
): Unsubscribe => {
  return onSnapshot(studentsRef(), (snap) => {
    const students = snap.docs.map((d) => d.data() as Student);
    callback(students);
  });
};

// ============================================================
// SUBMISSIONS
// ============================================================

export const addSubmissionsToFirestore = async (
  submissions: Submission[]
): Promise<void> => {
  const batch = writeBatch(db!);
  submissions.forEach((s) => {
    const ref = doc(collection(db!, "submissions"));
    batch.set(ref, s);
  });
  await batch.commit();
};

export const getAllSubmissionsFromFirestore = async (): Promise<
  Submission[]
> => {
  const snap = await getDocs(submissionsRef());
  return snap.docs.map((d) => d.data() as Submission);
};

// Real-time listener for submissions
export const subscribeToSubmissions = (
  callback: (subs: Submission[]) => void
): Unsubscribe => {
  return onSnapshot(submissionsRef(), (snap) => {
    const subs = snap.docs.map((d) => d.data() as Submission);
    callback(subs);
  });
};

// ============================================================
// SURVEYS
// ============================================================

export const addSurveyToFirestore = async (survey: Survey): Promise<void> => {
  const ref = doc(collection(db!, "surveys"));
  await setDoc(ref, survey);
};

export const getAllSurveysFromFirestore = async (): Promise<Survey[]> => {
  const snap = await getDocs(surveysRef());
  return snap.docs.map((d) => d.data() as Survey);
};

// Real-time listener for surveys
export const subscribeToSurveys = (
  callback: (surveys: Survey[]) => void
): Unsubscribe => {
  return onSnapshot(surveysRef(), (snap) => {
    const surveys = snap.docs.map((d) => d.data() as Survey);
    callback(surveys);
  });
};

// ============================================================
// CLEAR ALL DATA (admin only)
// ============================================================

const BATCH_SIZE = 500;

async function deleteCollection(ref: ReturnType<typeof collection>): Promise<number> {
  let total = 0;
  let snap = await getDocs(ref);
  while (!snap.empty) {
    const batch = writeBatch(db!);
    const chunk = snap.docs.slice(0, BATCH_SIZE);
    chunk.forEach((d) => batch.delete(d.ref));
    total += chunk.length;
    await batch.commit();
    if (chunk.length < BATCH_SIZE) break;
    snap = await getDocs(ref);
  }
  return total;
}

/** Delete all documents in students, submissions, and surveys. Use with caution. */
export const clearAllFirestoreData = async (): Promise<{ students: number; submissions: number; surveys: number }> => {
  const students = await deleteCollection(studentsRef());
  const submissions = await deleteCollection(submissionsRef());
  const surveys = await deleteCollection(surveysRef());
  return { students, submissions, surveys };
};
