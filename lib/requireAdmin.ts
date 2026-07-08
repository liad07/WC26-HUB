import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/admin";

export async function requireAdmin() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdminEmail(email)) return null;
  return user;
}
