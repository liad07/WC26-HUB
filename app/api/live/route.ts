import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";

export const dynamic = "force-dynamic";

/** Returns all currently live fixtures. */
export async function GET() {
  try {
    const { data, source } = await matchProvider.getLiveFixtures();
    return NextResponse.json({ source, count: data.length, matches: data });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_live", message: (error as Error).message },
      { status: 502 }
    );
  }
}
