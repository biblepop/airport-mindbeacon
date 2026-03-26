import { NextResponse } from "next/server";

export const revalidate = 0;

export interface ArrivalItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

const BASE_URL =
  "https://apis.data.go.kr/B551177/StatusOfArrivals/getArrivalsCongestion";

async function fetchTerminal(apiKey: string, terminalId: string): Promise<ArrivalItem[]> {
  const url =
    `${BASE_URL}?serviceKey=${apiKey}` +
    `&numOfRows=20&pageNo=1&type=json&terminalId=${terminalId}`;

  console.log(`[arrivals] 요청 (${terminalId}):`, url);
  const res = await fetch(url, { cache: "no-store" });
  console.log(`[arrivals] HTTP status (${terminalId}):`, res.status);

  if (!res.ok) throw new Error(`HTTP ${res.status} (${terminalId})`);

  const rawText = await res.text();
  console.log(`[arrivals] 응답 (${terminalId}):\n`, rawText);

  const data = JSON.parse(rawText);

  // 다양한 래핑 구조 대응
  type Nested = Record<string, unknown>;
  const tryItem = (d: Nested) => {
    const res = d?.response as Nested | undefined;
    const resBody = res?.body as Nested | undefined;
    const resItems = resBody?.items as Nested | undefined;
    const body = d?.body as Nested | undefined;
    const bodyItems = body?.items as Nested | undefined;
    return resItems?.item ?? bodyItems?.item ?? body?.items ?? d?.items;
  };

  const raw = tryItem(data as Record<string, unknown>);
  const arr: ArrivalItem[] = raw
    ? Array.isArray(raw)
      ? raw
      : [raw]
    : [];

  console.log(`[arrivals] items (${terminalId}):`, arr.length, "개");
  return arr;
}

const MOCK_T1: ArrivalItem[] = [
  { gateId: "AG1_E", terminalId: "P01", waitTime: "4",  waitLength: "8"  },
  { gateId: "AG2_E", terminalId: "P01", waitTime: "9",  waitLength: "25" },
  { gateId: "AG3_W", terminalId: "P01", waitTime: "16", waitLength: "45" },
  { gateId: "AG4_W", terminalId: "P01", waitTime: "6",  waitLength: "12" },
];

const MOCK_T2: ArrivalItem[] = [
  { gateId: "AG1_E", terminalId: "P02", waitTime: "7",  waitLength: "18" },
  { gateId: "AG2_W", terminalId: "P02", waitTime: "11", waitLength: "32" },
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

  try {
    const [t1Items, t2Items] = await Promise.all([
      fetchTerminal(apiKey, "P01"),
      fetchTerminal(apiKey, "P02"),
    ]);

    const allItems = [...t1Items, ...t2Items];
    if (allItems.length === 0) throw new Error("arrivals 데이터 없음");

    const totalPax = allItems.reduce(
      (s, i) => s + parseInt(i.waitLength ?? "0", 10),
      0
    );

    return NextResponse.json({ t1Items, t2Items, totalPax, _mock: false });
  } catch (err) {
    console.error("[arrivals] 실패 → mock:", err);
    return NextResponse.json({
      t1Items: MOCK_T1, t2Items: MOCK_T2,
      totalPax: 140, _mock: true, _error: String(err),
    });
  }
}
