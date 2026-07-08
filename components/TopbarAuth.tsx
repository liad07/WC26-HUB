"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Icon } from "@/components/Icon";

/** Account control: Clerk user menu when signed in, sign-in button otherwise. */
export function TopbarAuth() {
  const { isSignedIn, isLoaded } = useUser();

  if (isLoaded && isSignedIn) {
    return <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />;
  }

  return (
    <SignInButton mode="modal">
      <button className="btn-primary px-4 py-2 text-sm">
        <Icon name="user" size={15} />
        התחברות
      </button>
    </SignInButton>
  );
}
