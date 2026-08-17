import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { mockForgeSourceRepository } from "@/lib/repositories/mock/forgeSourceRepository";
import { supabaseForgeSourceRepository } from "@/lib/repositories/supabase/forgeSourceRepository";
import type { ForgeSourceInput } from "@/lib/repositories/forgeSourceRepository.types";

export type {
  ForgeSourceInput,
  ForgeSourceRepository
} from "@/lib/repositories/forgeSourceRepository.types";

function getForgeSourceRepository() {
  return getConfiguredDataSource() === "supabase"
    ? supabaseForgeSourceRepository
    : mockForgeSourceRepository;
}

export const attachSourcesToCourse = (
  teacherId: string,
  sourceIds: string[],
  courseId: string
) => getForgeSourceRepository().attachSourcesToCourse(teacherId, sourceIds, courseId);

export const createSource = (teacherId: string, input: ForgeSourceInput) =>
  getForgeSourceRepository().createSource(teacherId, input);

export const deleteSource = (teacherId: string, sourceId: string) =>
  getForgeSourceRepository().deleteSource(teacherId, sourceId);

export const getSources = (teacherId: string, courseId?: string) =>
  getForgeSourceRepository().getSources(teacherId, courseId);

export const getSourcesByIds = (teacherId: string, sourceIds: string[]) =>
  getForgeSourceRepository().getSourcesByIds(teacherId, sourceIds);
