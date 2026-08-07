"use client";

import { GraduationCap } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { enrollAction } from "@/app/learn/actions";
import { useToast } from "@/components/app/ToastProvider";

type EnrollmentButtonProps = {
  courseId: string;
  courseSlug: string;
};

export function EnrollmentButton({ courseId, courseSlug }: EnrollmentButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  function enroll() {
    setIsPending(true);
    startTransition(async () => {
      try {
        await enrollAction(courseId, courseSlug);
        showToast({ title: "Formation ajoutée", description: "Vous pouvez commencer la première leçon.", variant: "success" });
        router.refresh();
      } catch {
        showToast({ title: "Inscription impossible", description: "Réessayez dans un instant.", variant: "danger" });
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <button className="btn btn-primary" disabled={isPending} type="button" onClick={enroll}>
      <GraduationCap size={17} aria-hidden="true" />
      {isPending ? "Inscription..." : "S'inscrire"}
    </button>
  );
}