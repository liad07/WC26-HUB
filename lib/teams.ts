/** Hebrew national-team names mapped to their canonical English form. */
const HE_TO_EN: Record<string, string> = {
  ישראל: "israel",
  ברזיל: "brazil",
  ארגנטינה: "argentina",
  צרפת: "france",
  גרמניה: "germany",
  ספרד: "spain",
  אנגליה: "england",
  פורטוגל: "portugal",
  איטליה: "italy",
  הולנד: "netherlands",
  בלגיה: "belgium",
  קרואטיה: "croatia",
  אורוגוואי: "uruguay",
  קולומביה: "colombia",
  שווייץ: "switzerland",
  שוויץ: "switzerland",
  מקסיקו: "mexico",
  ארהב: "usa",
  "ארה\"ב": "usa",
  קנדה: "canada",
  יפן: "japan",
  קוריאה: "south korea",
  "דרום קוריאה": "south korea",
  אוסטרליה: "australia",
  מרוקו: "morocco",
  סנגל: "senegal",
  גאנה: "ghana",
  ניגריה: "nigeria",
  קמרון: "cameroon",
  מצרים: "egypt",
  טוניסיה: "tunisia",
  "אלג'יריה": "algeria",
  "חוף השנהב": "ivory coast",
  פולין: "poland",
  דנמרק: "denmark",
  שוודיה: "sweden",
  נורווגיה: "norway",
  סרביה: "serbia",
  אוסטריה: "austria",
  סקוטלנד: "scotland",
  וויילס: "wales",
  ווילס: "wales",
  אירלנד: "ireland",
  טורקיה: "turkey",
  יוון: "greece",
  "צ'ילה": "chile",
  פרו: "peru",
  אקוודור: "ecuador",
  פרגוואי: "paraguay",
  ונצואלה: "venezuela",
  קטאר: "qatar",
  "ערב הסעודית": "saudi arabia",
  איראן: "iran",
  עיראק: "iraq",
  "אמירויות": "united arab emirates",
  אוקראינה: "ukraine",
  "צ'כיה": "czech republic",
  הונגריה: "hungary",
  רומניה: "romania",
  סלובקיה: "slovakia",
  סלובניה: "slovenia",
  קוסטהריקה: "costa rica",
  "קוסטה ריקה": "costa rica",
  פנמה: "panama",
  הונדורס: "honduras",
  ימייקה: "jamaica",
  "ג'מייקה": "jamaica",
  ניוזילנד: "new zealand",
};

const NON_MATCH_TOKENS = [
  "אולפן",
  "מבזק",
  "חדשות",
  "סיכום",
  "מגזין",
  "לקראת",
  "לפני",
  "אקטואליה",
  "מקדים",
];

/** Canonical comparable key for a team name (Hebrew alias → English, else lowered). */
export function normalizeTeam(name: string): string {
  const clean = name.trim().replace(/[.'"]/g, "");
  return HE_TO_EN[clean] ?? HE_TO_EN[name.trim()] ?? clean.toLowerCase();
}

/** True if two team names refer to the same team after normalization. */
export function sameTeam(a: string, b: string): boolean {
  const na = normalizeTeam(a);
  const nb = normalizeTeam(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/** Extracts a [teamA, teamB] pair from a program title/subtitle, or null. */
export function detectMatchTeams(title: string, subtitle: string | null): string[] | null {
  for (const text of [subtitle, title]) {
    if (!text) continue;
    if (NON_MATCH_TOKENS.some((t) => text.includes(t)) && !text.includes("/")) continue;
    const parts = text
      .split(/\s*[\/\-–—]\s*|\s+נגד\s+|\s+vs\.?\s+/i)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 2 && parts.every((p) => p.length >= 2 && p.length <= 20)) {
      return parts;
    }
  }
  return null;
}
