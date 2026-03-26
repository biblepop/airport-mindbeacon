import { NextResponse } from "next/server";

export const revalidate = 0;

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
  occurtime?: string;
}

const BASE_URL =
  "https://apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion";

async function fetchTerminal(apiKey: string, terminalId: string): Promise<GateItem[]> {
  const url =
    `${BASE_URL}?serviceKey=${apiKey}` +
    `&numOfRows=20&pageNo=1&type=json&terminalId=${terminalId}`;

  console.log(`[congestion] 요청 (${terminalId}):`, url);
  const res = await fetch(url, { cache: "no-store" });
  console.log(`[congestion] HTTP status (${terminalId}):`, res.status);

  if (!res.ok) throw new Error(`HTTP ${res.status} (${terminalId})`);

  const rawText = await res.text();
  console.log(`[congestion] 응답 (${terminalId}):\n`, rawText);

  const data = JSON.parse(rawText);
  console.log(`[congestion] 응답 전체 (${terminalId}):`, JSON.stringify(data));

  type N = Record<string, unknown>;
  const resBody = ((data as N)?.response as N | undefined)?.body as N | undefined;
  const items: GateItem[] = Array.isArray(resBody?.items) ? (resBody?.items as GateItem[]) : [];
  const totalCount: number = (resBody?.totalCount as number) ?? 0;
  console.log(`[congestion] items (${terminalId}):`, items.length, "/ totalCount:", totalCount);

  return items;
}

const MOCK_T1: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];

const MOCK_T2: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P02", waitTime: "6",  waitLength: "18" },
  { gateId: "DG2_E", terminalId: "P02", waitTime: "14", waitLength: "44" },
  { gateId: "DG3_W", terminalId: "P02", waitTime: "9",  waitLength: "25" },
  { gateId: "DG4_W", terminalId: "P02", waitTime: "11", waitLength: "31" },
];

function calcTotalPax(items: GateItem[]) {
  return items.reduce((s, i) => s + (parseInt(i.waitLength ?? "0", 10) || 0), 0);
}

export async function GET() {
  console.log("[congestion] 함수 실행됨", new Date().toISOString());
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(mockResponse("API key missing"));
  }

  try {
    const [t1Items, t2Items] = await Promise.all([
      fetchTerminal(apiKey, "P01"),
      fetchTerminal(apiKey, "P02"),
    ]);

    const allItems = [...t1Items, ...t2Items];
    if (allItems.length === 0) throw new Error("항목 없음");

    const totalPax = calcTotalPax(allItems);
    return NextResponse.json({
      body: { items: allItems, totalCount: allItems.length },
      t1Items, t2Items, totalPax, _mock: false,
    });
  } catch (err) {
    console.error("[congestion] 실패 → mock:", err);
    return NextResponse.json(mockResponse(String(err)));
  }
}

function mockResponse(error: string) {
  const allItems = [...MOCK_T1, ...MOCK_T2];
  return {
    body: { items: allItems, totalCount: allItems.length },
    t1Items: MOCK_T1,
    t2Items: MOCK_T2,
    totalPax: calcTotalPax(allItems),
    _mock: true,
    _error: error,
  };
}
