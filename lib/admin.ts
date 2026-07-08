import "server-only";

const ADMIN_EMAIL = "liad07@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
}
