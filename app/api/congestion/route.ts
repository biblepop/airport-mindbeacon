import { NextResponse } from "next/server";

const BASE_URL =
  "https://apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion";

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

  // 실제 필드명 확인용 — 응답 구조 전체 출력
  console.log(
    `[congestion] 파싱된 데이터 (${terminalId}):`,
    JSON.stringify(data, null, 2)
  );

  const items: unknown[] = data?.response?.body?.items?.item ?? [];
  const totalCount: number = data?.response?.body?.totalCount ?? 0;

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

    if (items.length === 0 || totalCount === 0) {
      console.warn("[congestion] 데이터 없음 — 운영 외 시간으로 처리");
      return NextResponse.json({
        response: {
          body: {
            items: { item: [] },
            totalCount: 0,
          },
        },
        _mock: false,
        _offHours: true,
        _message: "운영 외 시간: 실시간 혼잡도 데이터가 제공되지 않습니다.",
      });
    }

    return NextResponse.json({
      response: {
        body: {
          items: { item: items },
          totalCount,
        },
      },
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
    _mock: true,
    _error: error,
  };
}

const MOCK_ITEMS = [
  { aicpName: "T1 출국장 1구역", congestNm: "원활", passengerNum: 1240 },
  { aicpName: "T1 출국장 2구역", congestNm: "보통", passengerNum: 2180 },
  { aicpName: "T1 출국장 3구역", congestNm: "혼잡", passengerNum: 3450 },
  { aicpName: "T2 출국장 1구역", congestNm: "원활", passengerNum: 980 },
  { aicpName: "T2 출국장 2구역", congestNm: "보통", passengerNum: 1760 },
  { aicpName: "T2 출국장 3구역", congestNm: "원활", passengerNum: 820 },
];
