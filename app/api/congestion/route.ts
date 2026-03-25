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

export async function GET() {
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    console.error("[congestion] AIRPORT_API_KEY 없음");
    return NextResponse.json(mockResponse("API key missing"));
  }

  try {
    const { items, totalCount } = await fetchTerminal(apiKey, "P01");

    const totalPax = items.reduce(
      (sum, item) => sum + (parseInt(item.waitLength ?? "0", 10) || 0),
      0
    );
    console.log(`[congestion] totalPax: ${totalPax}명 / totalCount: ${totalCount}`);

    // 프론트에 { body: { items: [...], totalCount }, totalPax } 구조로 통일
    return NextResponse.json({
      body: { items, totalCount },
      totalPax,
      _mock: false,
    });
  } catch (err) {
    console.error("[congestion] 실패:", err);
    return NextResponse.json(mockResponse(String(err)));
  }
}

function mockResponse(error: string) {
  return {
    body: { items: MOCK_ITEMS, totalCount: MOCK_ITEMS.length },
    totalPax: 185,
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
