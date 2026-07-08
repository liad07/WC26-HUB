import { matchProvider } from "@/lib/matchProvider";
import { TournamentTabs, type TournamentTab } from "@/components/tournament/TournamentTabs";
import type { StandingGroup } from "@/types/match";

export const dynamic = "force-dynamic";
export const metadata = { title: "טורניר · מונדיאל עכשיו" };

export default async function TournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: TournamentTab = tab === "knockout" ? "knockout" : "groups";

  let groups: StandingGroup[] = [];
  let failed = false;
  try {
    groups = (await matchProvider.getStandings()).data;
  } catch {
    failed = true;
  }

  return <TournamentTabs groups={groups} failed={failed} initialTab={initialTab} />;
}
