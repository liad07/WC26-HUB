import { normalizeTeam } from "@/lib/teams";
import type { TeamInfo } from "@/types/match";

const EN_TO_ISO: Record<string, string> = {
  israel: "il",
  brazil: "br",
  argentina: "ar",
  france: "fr",
  germany: "de",
  spain: "es",
  england: "gb-eng",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",
  ireland: "ie",
  portugal: "pt",
  italy: "it",
  netherlands: "nl",
  belgium: "be",
  croatia: "hr",
  uruguay: "uy",
  colombia: "co",
  switzerland: "ch",
  mexico: "mx",
  usa: "us",
  "united states": "us",
  canada: "ca",
  japan: "jp",
  "south korea": "kr",
  "korea republic": "kr",
  "republic of korea": "kr",
  kor: "kr",
  australia: "au",
  morocco: "ma",
  senegal: "sn",
  ghana: "gh",
  nigeria: "ng",
  cameroon: "cm",
  egypt: "eg",
  tunisia: "tn",
  algeria: "dz",
  "ivory coast": "ci",
  "cote divoire": "ci",
  "cote d'ivoire": "ci",
  poland: "pl",
  denmark: "dk",
  sweden: "se",
  norway: "no",
  serbia: "rs",
  austria: "at",
  turkey: "tr",
  turkiye: "tr",
  greece: "gr",
  chile: "cl",
  peru: "pe",
  ecuador: "ec",
  paraguay: "py",
  venezuela: "ve",
  qatar: "qa",
  "saudi arabia": "sa",
  iran: "ir",
  "ir iran": "ir",
  iraq: "iq",
  "united arab emirates": "ae",
  ukraine: "ua",
  "czech republic": "cz",
  czechia: "cz",
  hungary: "hu",
  romania: "ro",
  slovakia: "sk",
  slovenia: "si",
  "costa rica": "cr",
  panama: "pa",
  honduras: "hn",
  jamaica: "jm",
  "new zealand": "nz",
  "bosnia and herzegovina": "ba",
  bosnia: "ba",
  "south africa": "za",
  curacao: "cw",
  "congo dr": "cd",
  "dr congo": "cd",
  "democratic republic of the congo": "cd",
  "dem rep of the congo": "cd",
  drc: "cd",
  uzbekistan: "uz",
  "cabo verde": "cv",
  "cape verde": "cv",
  haiti: "ht",
  jordan: "jo",
  bolivia: "bo",
  "el salvador": "sv",
  guatemala: "gt",
  nicaragua: "ni",
  "trinidad and tobago": "tt",
  china: "cn",
  "chinese taipei": "tw",
  india: "in",
  thailand: "th",
  vietnam: "vn",
  indonesia: "id",
  malaysia: "my",
  philippines: "ph",
  bahrain: "bh",
  kuwait: "kw",
  oman: "om",
  yemen: "ye",
  syria: "sy",
  lebanon: "lb",
  palestine: "ps",
  libya: "ly",
  sudan: "sd",
  "south sudan": "ss",
  ethiopia: "et",
  kenya: "ke",
  uganda: "ug",
  tanzania: "tz",
  zambia: "zm",
  zimbabwe: "zw",
  angola: "ao",
  mozambique: "mz",
  mali: "ml",
  "burkina faso": "bf",
  "cote d ivoire": "ci",
  gabon: "ga",
  "equatorial guinea": "gq",
  "guinea bissau": "gw",
  guinea: "gn",
  liberia: "lr",
  "sierra leone": "sl",
  togo: "tg",
  benin: "bj",
  namibia: "na",
  botswana: "bw",
  congo: "cg",
  "republic of the congo": "cg",
  rwanda: "rw",
  burundi: "bi",
  madagascar: "mg",
  mauritania: "mr",
  comoros: "km",
  gambia: "gm",
  malawi: "mw",
  suriname: "sr",
  guyana: "gy",
  "puerto rico": "pr",
  cuba: "cu",
  "dominican republic": "do",
  belize: "bz",
  barbados: "bb",
  "antigua and barbuda": "ag",
  armenia: "am",
  azerbaijan: "az",
  georgia: "ge",
  kazakhstan: "kz",
  kyrgyzstan: "kg",
  tajikistan: "tj",
  turkmenistan: "tm",
  mongolia: "mn",
  "north korea": "kp",
  "korea dpr": "kp",
  laos: "la",
  cambodia: "kh",
  myanmar: "mm",
  nepal: "np",
  bangladesh: "bd",
  "sri lanka": "lk",
  pakistan: "pk",
  afghanistan: "af",
  malta: "mt",
  cyprus: "cy",
  luxembourg: "lu",
  iceland: "is",
  finland: "fi",
  estonia: "ee",
  latvia: "lv",
  lithuania: "lt",
  belarus: "by",
  moldova: "md",
  albania: "al",
  "north macedonia": "mk",
  montenegro: "me",
  kosovo: "xk",
  bulgaria: "bg",
  "faroe islands": "fo",
  andorra: "ad",
  monaco: "mc",
  liechtenstein: "li",
  "san marino": "sm",
  vatican: "va",
};

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function lookupKey(name: string): string {
  const normalized = normalizeTeam(name);
  const ascii = stripDiacritics(normalized).replace(/['.]/g, "").trim();
  return ascii;
}

function resolveIso(teamName: string | null | undefined): string | null {
  if (!teamName) return null;
  const key = lookupKey(teamName);
  if (EN_TO_ISO[key]) return EN_TO_ISO[key];

  for (const [alias, iso] of Object.entries(EN_TO_ISO)) {
    if (key === alias || key.includes(alias) || alias.includes(key)) return iso;
  }
  return null;
}

function isValidImageUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function flagUrl(teamName: string | null | undefined, width: 40 | 80 | 160 = 80): string | null {
  const iso = resolveIso(teamName);
  return iso ? `https://flagcdn.com/w${width}/${iso}.png` : null;
}

export function teamImageSrc(
  team: Pick<TeamInfo, "name" | "logo">,
  width: 40 | 80 | 160 = 80
): string {
  if (isValidImageUrl(team.logo)) return team.logo;
  const flag = flagUrl(team.name, width);
  if (flag) return flag;
  const initial = (team.name?.trim().charAt(0) || "?").toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill="#1a2332"/><text x="20" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#94a3b8">${initial}</text></svg>`
  )}`;
}
