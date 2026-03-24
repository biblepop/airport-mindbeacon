import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    console.error("[congestion] AIRPORT_API_KEY 없음");
    return NextResponse.json(mockResponse("API key missing"));
  }

  const url =
    `https://apis.data.go.kr/B551177/StatusOfCongestion/getStatusOfCongestion` +
    `?serviceKey=${apiKey}` +
    `&numOfRows=20&pageNo=1&type=json`;

  // ① 실제 요청 URL 전체 출력 (키 포함)
  console.log("[congestion] 요청 URL:", url);

  try {
    const res = await fetch(url, { cache: "no-store" });

    // ④ 응답 전체 출력
    const rawText = await res.text();
    console.log("[congestion] HTTP status:", res.status);
    console.log("[congestion] 응답 전체:\n", rawText);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = JSON.parse(rawText);
    return NextResponse.json({ ...data, _mock: false });
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
