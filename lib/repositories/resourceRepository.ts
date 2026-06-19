import { learnerResources } from "@/data/learner";
import { resources } from "@/data/resources";
import { teacherResources } from "@/data/teacher";

export function listResources() {
  return [...resources];
}

export function listLearnerResources() {
  return [...learnerResources];
}

export function listTeacherResources() {
  return [...teacherResources];
}
