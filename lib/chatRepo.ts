import "server-only";
import { getSql } from "@/lib/db";

export interface ChatMessage {
  id: string;
  userId: string;
  user: string;
  avatar: string | null;
  text: string;
  ts: number;
}

export interface NewMessage {
  roomId: string;
  userId: string;
  user: string;
  avatar: string | null;
  text: string;
}

interface ChatRow {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  body: string;
  created_at: string;
}

/** Postgres-backed store for fan-chat messages, with lazy schema creation. */
class ChatRepository {
  private schemaReady = false;

  /** Idempotently ensures the messages table + index exist. */
  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_room_created
      ON chat_messages (room_id, created_at DESC)
    `;
    this.schemaReady = true;
  }

  /** Latest messages for a room, returned oldest → newest for direct rendering. */
  async list(roomId: string, limit = 60): Promise<ChatMessage[]> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, user_id, user_name, user_avatar, body, created_at
      FROM chat_messages
      WHERE room_id = ${roomId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as ChatRow[];
    return rows.map(this.toMessage).reverse();
  }

  /** Messages newer than a given id (ascending) for incremental polling. */
  async listAfter(roomId: string, afterId: string, limit = 60): Promise<ChatMessage[]> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, user_id, user_name, user_avatar, body, created_at
      FROM chat_messages
      WHERE room_id = ${roomId} AND id > ${afterId}
      ORDER BY id ASC
      LIMIT ${limit}
    `) as ChatRow[];
    return rows.map(this.toMessage);
  }

  /** Persists a new message and returns it in client shape. */
  async insert(msg: NewMessage): Promise<ChatMessage> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      INSERT INTO chat_messages (room_id, user_id, user_name, user_avatar, body)
      VALUES (${msg.roomId}, ${msg.userId}, ${msg.user}, ${msg.avatar}, ${msg.text})
      RETURNING id, user_id, user_name, user_avatar, body, created_at
    `) as ChatRow[];
    return this.toMessage(rows[0]);
  }

  /** Counts a user's messages in the trailing window, for rate limiting. */
  async recentCountByUser(userId: string, windowSeconds: number): Promise<number> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT COUNT(*)::int AS count
      FROM chat_messages
      WHERE user_id = ${userId}
        AND created_at > now() - (${windowSeconds} || ' seconds')::interval
    `) as { count: number }[];
    return rows[0]?.count ?? 0;
  }

  private toMessage(row: ChatRow): ChatMessage {
    return {
      id: String(row.id),
      userId: row.user_id,
      user: row.user_name,
      avatar: row.user_avatar,
      text: row.body,
      ts: new Date(row.created_at).getTime(),
    };
  }
}

export const chatRepo = new ChatRepository();
