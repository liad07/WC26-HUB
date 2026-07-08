import "server-only";
import type { Match, StandingGroup } from "@/types/match";
import { fifaApi } from "@/lib/fifaApi";
import { apiFootball } from "@/lib/apiFootball";
import { sameTeam } from "@/lib/teams";

type Sourced<T> = { data: T; source: string };

/**
 * Unified match data facade: prefers the keyless live FIFA API and falls back
 * to API-FOOTBALL (or offline mock) whenever FIFA is unreachable.
 */
class MatchProvider {
  private fallbackSource(): string {
    return apiFootball.hasKey ? "api-football" : "mock";
  }

  async getFixturesByDate(dateKey: string): Promise<Sourced<Match[]>> {
    const fifa = await fifaApi.getFixturesByDate(dateKey);
    if (fifa !== null) return { data: fifa, source: "fifa" };
    return { data: await apiFootball.getFixturesByDate(dateKey), source: this.fallbackSource() };
  }

  async getAllFixtures(): Promise<Sourced<Match[]>> {
    const fifa = await fifaApi.getAllFixtures();
    if (fifa !== null) return { data: fifa, source: "fifa" };
    return { data: [], source: this.fallbackSource() };
  }

  async getLiveFixtures(): Promise<Sourced<Match[]>> {
    const fifa = await fifaApi.getLiveFixtures();
    if (fifa !== null) return { data: fifa, source: "fifa" };
    return { data: await apiFootball.getLiveFixtures(), source: this.fallbackSource() };
  }

  async getFixtureById(id: number): Promise<Sourced<Match | null>> {
    const fifa = await fifaApi.getFixtureById(id);
    if (fifa) return { data: fifa, source: "fifa" };
    return { data: await apiFootball.getFixtureById(id), source: this.fallbackSource() };
  }

  async findFixtureByTeams(names: string[]): Promise<Sourced<Match | null>> {
    const fifa = await fifaApi.findFixtureByTeams(names, sameTeam);
    if (fifa) return { data: fifa, source: "fifa" };
    return { data: await apiFootball.findFixtureByTeams(names), source: this.fallbackSource() };
  }

  async getKnockout(): Promise<Sourced<Match[]>> {
    const fifa = await fifaApi.getKnockoutFixtures();
    if (fifa !== null) return { data: fifa, source: "fifa" };
    return { data: [], source: this.fallbackSource() };
  }

  async getStandings(): Promise<Sourced<StandingGroup[]>> {
    const fifa = await fifaApi.getStandings();
    if (fifa !== null && fifa.length > 0) return { data: fifa, source: "fifa" };
    return { data: await apiFootball.getStandings(), source: this.fallbackSource() };
  }
}

export const matchProvider = new MatchProvider();
