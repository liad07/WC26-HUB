import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";

export const dynamic = "force-dynamic";

/** Returns all knockout-stage fixtures for the bracket. */
export async function GET() {
  try {
    const { data, source } = await matchProvider.getKnockout();
    return NextResponse.json({ matches: data, source });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_bracket", message: (error as Error).message },
      { status: 502 }
    );
  }
}
