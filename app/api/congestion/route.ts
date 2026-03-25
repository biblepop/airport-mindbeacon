import { NextResponse } from "next/server";

const BASE_URL =
  "https://apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion";

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
  occurtime?: string;
}

function buildUrl(apiKey: string, terminalId: string) {
  return (
    `${BASE_URL}?serviceKey=${apiKey}` +
    `&numOfRows=20&pageNo=1&type=json&terminalId=${terminalId}`
  );
}

async function fetchTerminal(apiKey: string, terminalId: string) {
  const url = buildUrl(apiKey, terminalId);
  console.log(`[congestion] 요청 URL (${terminalId}):`, url);

  const res = await fetch(url, { cache: "no-store" });
  const rawText = await res.text();
  console.log(`[congestion] HTTP status (${terminalId}):`, res.status);
  console.log(`[congestion] 응답 전체 (${terminalId}):\n`, rawText);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} (terminalId=${terminalId})`);
  }

  const data = JSON.parse(rawText);

  // 실제 응답 구조: { header, body: { totalCount, items: [...] } }
  const items: GateItem[] = data?.body?.items ?? [];
  const totalCount: number = data?.body?.totalCount ?? 0;

  console.log(`[congestion] items 수 (${terminalId}):`, items.length, "/ totalCount:", totalCount);

  return { items, totalCount };
}

function calcAvgWaitTime(items: GateItem[]): number {
  const times = items
    .map((item) => parseInt(item.waitTime ?? "0", 10))
    .filter((t) => !isNaN(t) && t > 0);
  if (times.length === 0) return 0;
  return Math.round(times.reduce((s, t) => s + t, 0) / times.length);
}

export async function GET() {
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    console.error("[congestion] AIRPORT_API_KEY 없음");
    return NextResponse.json(mockResponse("API key missing"));
  }

  try {
    const { items, totalCount } = await fetchTerminal(apiKey, "P01");

    if (items.length === 0 || totalCount === 0) {
      console.warn("[congestion] 데이터 없음 — 운영 외 시간으로 처리");
      return NextResponse.json({
        response: { body: { items: { item: [] }, totalCount: 0 } },
        _mock: false,
        _offHours: true,
        _message: "운영 외 시간: 실시간 혼잡도 데이터가 제공되지 않습니다.",
      });
    }

    const avgWaitTime = calcAvgWaitTime(items);
    console.log(`[congestion] avgWaitTime: ${avgWaitTime}분`);

    return NextResponse.json({
      response: { body: { items: { item: items }, totalCount } },
      avgWaitTime,
      _mock: false,
    });
  } catch (err) {
    console.error("[congestion] 실패:", err);
    return NextResponse.json(mockResponse(String(err)));
  }
}

function mockResponse(error: string) {
  return {
    response: {
      body: {
        items: { item: MOCK_ITEMS },
        totalCount: MOCK_ITEMS.length,
      },
    },
    avgWaitTime: 9,
    _mock: true,
    _error: error,
  };
}

const MOCK_ITEMS: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];
