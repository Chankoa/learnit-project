import "server-only";

import type { ForgeSourceRepository } from "@/lib/repositories/forgeSourceRepository.types";

function getMockError() {
  return new Error("Les sources Forge persistantes requièrent NEXT_PUBLIC_DATA_SOURCE=supabase.");
}

export const mockForgeSourceRepository: ForgeSourceRepository = {
  async attachSourcesToCourse() {
    throw getMockError();
  },
  async createSource() {
    throw getMockError();
  },
  async deleteSource() {
    throw getMockError();
  },
  async getSources() {
    return [];
  },
  async getSourcesByIds() {
    return [];
  }
};
