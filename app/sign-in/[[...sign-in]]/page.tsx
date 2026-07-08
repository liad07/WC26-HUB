import { SignIn } from "@clerk/nextjs";
import { CHAT_AUTH_ENABLED } from "@/lib/features";
import { AuthDisabledNote } from "@/components/AuthDisabledNote";

export const metadata = { title: "התחברות · מונדיאל עכשיו" };

export default function SignInPage() {
  if (!CHAT_AUTH_ENABLED) return <AuthDisabledNote />;
  return (
    <div className="flex justify-center py-6">
      <SignIn />
    </div>
  );
}
