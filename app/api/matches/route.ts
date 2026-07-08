import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";
import { dateKeyOffset, toIsraelDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

/** Returns fixtures for a date query (today|tomorrow|all|YYYY-MM-DD), degrading to mock over hard errors. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") ?? "today";

  try {
    if (dateParam === "all") {
      const { data, source } = await matchProvider.getAllFixtures();
      return NextResponse.json({ date: "all", source, matches: data });
    }
    const date =
      dateParam === "today"
        ? toIsraelDateKey()
        : dateParam === "tomorrow"
          ? dateKeyOffset(1)
          : dateParam;
    const { data, source } = await matchProvider.getFixturesByDate(date);
    return NextResponse.json({ date, source, matches: data });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_matches", message: (error as Error).message },
      { status: 502 }
    );
  }
}
