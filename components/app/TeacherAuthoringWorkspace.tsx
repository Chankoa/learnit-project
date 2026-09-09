"use client";

import type { ReactNode } from "react";
import { CanonicalCourseWorkspace, type CanonicalCourseWorkspaceProps } from "@/components/app/CanonicalCourseWorkspace";
import { TeacherAuthoringSurfaceProvider } from "@/components/app/TeacherAuthoringSurface";

type Props = Omit<CanonicalCourseWorkspaceProps, "mode" | "content"> & {
  editor: ReactNode;
  previewHref: string;
  publicationHref: string;
};
/** Compatibility adapter: the only authoring-specific responsibility is surface context. */
export function TeacherAuthoringWorkspace({ editor, previewHref: _previewHref, publicationHref: _publicationHref, ...props }: Props) {
  return <TeacherAuthoringSurfaceProvider key={props.selectedId ?? "course"}>
    <CanonicalCourseWorkspace {...props} mode="edit" content={editor} />
  </TeacherAuthoringSurfaceProvider>;
}
