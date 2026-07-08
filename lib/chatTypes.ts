/** Client-side chat message shape shared by online and local chat modes. */
export interface ClientMessage {
  id: string;
  user: string;
  avatar?: string | null;
  text: string;
  ts: number;
}

export const QUICK_REPLIES = ["איזה גול!", "שופט מכור", "יאללהההה", "מי לוקח היום?"];
