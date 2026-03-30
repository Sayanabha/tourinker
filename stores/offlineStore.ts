import { create } from 'zustand'
import { OfflineDraft } from '@/hooks/useOfflineSync'

interface OfflineStore {
  pendingDrafts: OfflineDraft[]
  setPendingDrafts: (drafts: OfflineDraft[]) => void
  addDraft: (draft: OfflineDraft) => void
  removeDraft: (id: string) => void
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  pendingDrafts: [],
  setPendingDrafts: (drafts) => set({ pendingDrafts: drafts }),
  addDraft: (draft) =>
    set((state) => ({ pendingDrafts: [...state.pendingDrafts, draft] })),
  removeDraft: (id) =>
    set((state) => ({
      pendingDrafts: state.pendingDrafts.filter((d) => d.id !== id),
    })),
}))