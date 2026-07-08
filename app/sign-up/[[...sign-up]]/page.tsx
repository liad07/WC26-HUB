import { SignUp } from "@clerk/nextjs";
import { CHAT_AUTH_ENABLED } from "@/lib/features";
import { AuthDisabledNote } from "@/components/AuthDisabledNote";

export const metadata = { title: "הרשמה · מונדיאל עכשיו" };

export default function SignUpPage() {
  if (!CHAT_AUTH_ENABLED) return <AuthDisabledNote />;
  return (
    <div className="flex justify-center py-6">
      <SignUp />
    </div>
  );
}
