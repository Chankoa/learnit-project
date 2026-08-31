"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import type { TeacherAuthoringSurface } from "@/lib/teacher-authoring";

export type { TeacherAuthoringSurface } from "@/lib/teacher-authoring";

type TeacherAuthoringSurfaceContextValue = {
  activeSurface: TeacherAuthoringSurface;
  setActiveSurface: (surface: TeacherAuthoringSurface) => void;
};

const TeacherAuthoringSurfaceContext = createContext<TeacherAuthoringSurfaceContextValue | null>(null);

export function TeacherAuthoringSurfaceProvider({ children }: { children: ReactNode }) {
  const [activeSurface, setActiveSurface] = useState<TeacherAuthoringSurface>("information");

  return (
    <TeacherAuthoringSurfaceContext.Provider value={{ activeSurface, setActiveSurface }}>
      {children}
    </TeacherAuthoringSurfaceContext.Provider>
  );
}

export function useTeacherAuthoringSurface() {
  const context = useContext(TeacherAuthoringSurfaceContext);

  if (!context) {
    throw new Error("Teacher authoring surface must be used inside its provider.");
  }

  return context;
}
