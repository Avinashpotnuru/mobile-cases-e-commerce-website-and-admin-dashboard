import type { ObjectId } from "mongodb";

export const ADMIN_SESSIONS_COLLECTION = "admin_sessions";

export interface AdminSessionRecord {
  _id: ObjectId;
  tokenHash: string;
  subject: string;
  expiresAt: Date;
  createdAt: Date;
}