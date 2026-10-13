import type { Diff, RawQuestion, Tier } from '../kit';
export interface LiveRecord {
  id: string; revision: number; status: 'approved';
  reviewedBy: string; reviewedAt: string; asOfDate: string;
  source: { url: string; title: string };
  difficulty: Diff; tiers: Tier[];
  question: Omit<RawQuestion, 'id'>;
}
export interface LiveBundle { schemaVersion: 1; publishedAt: string; questions: LiveRecord[]; withdrawnIds: string[] }
export interface ResearchItem {
  id: string; title: string; url: string; sourceId: string; sourceName: string;
  publishedAt: string | null; sourceDateText: string; firstSeenAt: string; lastSeenAt: string;
}
export interface ResearchSnapshot {
  schemaVersion: 1; checkedAt: string;
  items: ResearchItem[];
  sources: { id: string; name: string; ok: boolean; checkedAt: string; lastSuccessAt: string | null; count: number; error: string | null }[];
}
export type LivePracticeQuestion = RawQuestion & { liveSource?: { id: string; revision: number; asOfDate: string; reviewedAt: string; source: LiveRecord['source'] } };
