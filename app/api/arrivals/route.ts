import { NextResponse } from "next/server";

export const revalidate = 0;

export interface ArrivalItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

interface RawRow {
  terno?: string;
  entrygate?: string;
  korean?: string;
  foreigner?: string;
  airport?: string;
  flightid?: string;
}

const BASE_URL =
  "https://apis.data.go.kr/B551177/StatusOfArrivals/getArrivalsCongestion";

/** 대기인원 → 체감 대기시간(분) 추정 */
function estimateWaitTime(pax: number): string {
  if (pax >= 30) return "20";
  if (pax >= 10) return "10";
  return "4";
}

/** response.body.items 배열 추출 */
function extractRawRows(data: unknown): RawRow[] {
  if (!data || typeof data !== "object") return [];
  type N = Record<string, unknown>;
  const items = (((data as N).response as N | undefined)?.body as N | undefined)?.items;
  return Array.isArray(items) ? (items as RawRow[]) : [];
}

/** 게이트별 집계: (terno, entrygate) 단위로 korean+foreigner 합산 */
function aggregateByGate(rows: RawRow[]): ArrivalItem[] {
  const map = new Map<string, { terminal: string; gate: string; pax: number }>();

  for (const row of rows) {
    const terminal = row.terno ?? "";
    const gate = row.entrygate ?? "";
    if (!terminal || !gate) continue;

    const pax =
      Math.round(parseFloat(row.korean ?? "0")) +
      Math.round(parseFloat(row.foreigner ?? "0"));

    const key = `${terminal}|${gate}`;
    const existing = map.get(key);
    if (existing) {
      existing.pax += pax;
    } else {
      map.set(key, { terminal, gate, pax });
    }
  }

  return Array.from(map.values()).map(({ terminal, gate, pax }) => ({
    gateId: `${gate}게이트`,
    terminalId: terminal,
    waitLength: String(pax),
    waitTime: estimateWaitTime(pax),
  }));
}

const MOCK_T1: ArrivalItem[] = [
  { gateId: "A게이트", terminalId: "T1", waitTime: "4",  waitLength: "8"  },
  { gateId: "B게이트", terminalId: "T1", waitTime: "10", waitLength: "25" },
  { gateId: "C게이트", terminalId: "T1", waitTime: "20", waitLength: "45" },
  { gateId: "D게이트", terminalId: "T1", waitTime: "4",  waitLength: "12" },
];

const MOCK_T2: ArrivalItem[] = [
  { gateId: "E게이트", terminalId: "T2", waitTime: "4",  waitLength: "18" },
  { gateId: "F게이트", terminalId: "T2", waitTime: "10", waitLength: "32" },
];

export async function GET() {
  console.log("[arrivals] 함수 실행됨", new Date().toISOString());
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      t1Items: MOCK_T1, t2Items: MOCK_T2,
      totalPax: 140, _mock: true, _error: "API key missing",
    });
  }

  const url =
    `${BASE_URL}?serviceKey=${apiKey}&numOfRows=100&pageNo=1&type=json`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    console.log("[arrivals] HTTP status:", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rawText = await res.text();
    console.log("[arrivals] 응답 전체:\n", rawText);

    const data = JSON.parse(rawText);
    const rows = extractRawRows(data);
    console.log("[arrivals] rows:", rows.length, "개");

    const allItems = aggregateByGate(rows);
    console.log("[arrivals] 집계 결과:", allItems.length, "개", JSON.stringify(allItems));

    if (allItems.length === 0) throw new Error("arrivals 데이터 없음");

    const t1Items = allItems.filter((i) => i.terminalId === "T1");
    const t2Items = allItems.filter((i) => i.terminalId === "T2");
    const totalPax = allItems.reduce((s, i) => s + parseInt(i.waitLength ?? "0", 10), 0);

    return NextResponse.json({ t1Items, t2Items, totalPax, _mock: false });
  } catch (err) {
    console.error("[arrivals] 실패 → mock:", err);
    return NextResponse.json({
      t1Items: MOCK_T1, t2Items: MOCK_T2,
      totalPax: 140, _mock: true, _error: String(err),
    });
  }
}
