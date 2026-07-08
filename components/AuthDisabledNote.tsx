/** Shown on auth pages when Clerk keys are not yet configured. */
export function AuthDisabledNote() {
  return (
    <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl">🔒</span>
      <h1 className="text-lg font-black text-white">ההתחברות עדיין לא מופעלת</h1>
      <p className="mt-2 text-sm text-gray-400">
        כדי לאפשר חשבונות משתמשים והצ׳אט האונליין, הגדירו את מפתחות Clerk, Neon ו־Pusher בקובץ ה־
        <code className="rounded bg-white/10 px-1">.env</code>. בינתיים הצ׳אט פועל במצב מקומי בדפדפן.
      </p>
    </div>
  );
}
