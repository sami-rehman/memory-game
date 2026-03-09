// ============================================================
// Data Provider — Firebase only (live data).
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as firebaseService from "../firebase/service";
import { assignGroup, exportSubmissionsCSV } from "../utils";
import type { Student, Submission, Survey, DataContextType } from "../types";

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Subscribe to Firestore (live data only) ──
  useEffect(() => {
    const unsubStudents = firebaseService.subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });

    const unsubSubs = firebaseService.subscribeToSubmissions((data) => {
      setSubs(data);
    });

    const unsubSurveys = firebaseService.subscribeToSurveys((data) => {
      setSurveys(data);
    });

    return () => {
      unsubStudents();
      unsubSubs();
      unsubSurveys();
    };
  }, []);

  // ── Add Student (in-memory only until they complete the quiz) ──
  const addStudent = useCallback(
    (partial: Partial<Student>): Student => {
      const classroom = partial.grade || "default";
      const group = assignGroup(students, classroom);
      const student: Student = {
        studentId: partial.studentId || "",
        age: partial.age || null,
        grade: partial.grade || null,
        group,
        classroom,
        assignedAt: new Date().toISOString(),
        status: "pending",
      };
      // Do NOT write to Firebase here; student is written only when they complete the full quiz (submitSv).
      return student;
    },
    [students]
  );

  // ── Write student to Firebase (called only when they complete the full quiz) ──
  const saveStudentOnComplete = useCallback((student: Student): void => {
    firebaseService.addStudentToFirestore({ ...student, status: "completed" });
  }, []);

  // ── Get Student ──
  const getStudent = useCallback(
    (id: string): Student | undefined => {
      return students.find((s) => s.studentId === id);
    },
    [students]
  );

  // ── Update Status ──
  const updateStatus = useCallback(
    (id: string, status: Student["status"]): void => {
      firebaseService.updateStudentStatusInFirestore(id, status);
    },
    []
  );

  // ── Remove Student (and all their submissions + surveys) ──
  const removeStudent = useCallback(
    async (id: string): Promise<void> => {
      await firebaseService.removeStudentFromFirestore(id);
    },
    []
  );

  // ── Bulk Add ──
  const bulkAdd = useCallback(
    (ids: string[], grade: string | null): Student[] => {
      const added: Student[] = [];
      ids.forEach((id) => {
        if (!students.find((s) => s.studentId === id) && !added.find((s) => s.studentId === id)) {
          const all = [...students, ...added];
          const classroom = grade || "default";
          const group = assignGroup(all, classroom);
          added.push({
            studentId: id,
            age: null,
            grade,
            group,
            classroom,
            assignedAt: new Date().toISOString(),
            status: "pending",
          });
        }
      });

      firebaseService.bulkAddStudentsToFirestore(added);
      return added;
    },
    [students]
  );

  // ── Add Submissions (batch) ──
  const addSubs = useCallback(
    (batch: Submission[]): void => {
      firebaseService.addSubmissionsToFirestore(batch);
    },
    []
  );

  // ── Add Survey ──
  const addSurvey = useCallback(
    (survey: Survey): void => {
      firebaseService.addSurveyToFirestore(survey);
    },
    []
  );

  // ── Queries ──
  const getStudentSubs = useCallback(
    (id: string): Submission[] => subs.filter((s) => s.studentId === id),
    [subs]
  );

  const getGroupSubs = useCallback(
    (g: "A" | "B"): Submission[] => subs.filter((s) => s.group === g),
    [subs]
  );

  // ── CSV Export ──
  const exportCSV = useCallback((): void => {
    exportSubmissionsCSV(subs, students, surveys);
  }, [subs, students, surveys]);

  return (
    <DataContext.Provider
      value={{
        students,
        subs,
        surveys,
        addStudent,
        getStudent,
        updateStatus,
        removeStudent,
        bulkAdd,
        saveStudentOnComplete,
        addSubs,
        addSurvey,
        getStudentSubs,
        getGroupSubs,
        exportCSV,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

export default DataProvider;
