import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";

export const dynamic = "force-dynamic";

/** Resolves a fixture from two team names (?home=&away=). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const away = searchParams.get("away");
  if (!home || !away) {
    return NextResponse.json({ error: "missing_teams" }, { status: 400 });
  }

  try {
    const { data, source } = await matchProvider.findFixtureByTeams([home, away]);
    return NextResponse.json({ match: data, source });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_resolve", message: (error as Error).message },
      { status: 502 }
    );
  }
}
