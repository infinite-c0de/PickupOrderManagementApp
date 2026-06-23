export type SyncResult = "Successful" | "Failed";

export interface SyncRun {
  id: string;
  datetime: string;
  status: SyncResult;
  imported: number;
  errors: number;
  notes?: string;
}

export interface SyncStatus {
  lastRun?: SyncRun;
  customerCount: number;
  running: boolean;
}
