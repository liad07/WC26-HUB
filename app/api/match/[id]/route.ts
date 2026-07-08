import { NextResponse } from "next/server";
import { matchProvider } from "@/lib/matchProvider";

export const dynamic = "force-dynamic";

/** Returns full detail for a single fixture by id. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  try {
    const { data, source } = await matchProvider.getFixtureById(numericId);
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ source, match: data });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_match", message: (error as Error).message },
      { status: 502 }
    );
  }
}
