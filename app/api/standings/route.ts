import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";

export const dynamic = "force-dynamic";

/** Returns World Cup standings grouped by group. */
export async function GET() {
  try {
    const { data, source } = await matchProvider.getStandings();
    return NextResponse.json({ source, groups: data });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_standings", message: (error as Error).message },
      { status: 502 }
    );
  }
}
