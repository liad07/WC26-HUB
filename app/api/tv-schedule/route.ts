import { NextResponse } from "next/server";
import { kanSchedule } from "@/lib/kanSchedule";

export const dynamic = "force-dynamic";

/** Returns the Kan 11 broadcast schedule for today. */
export async function GET() {
  try {
    const schedule = await kanSchedule.getSchedule();
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_schedule", message: (error as Error).message },
      { status: 502 }
    );
  }
}
