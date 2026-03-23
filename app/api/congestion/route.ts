import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.AIRPORT_API_KEY;
  const url = `https://apis.data.go.kr/B551177/StatusOfCongestion/getStatusOfCongestion?serviceKey=${apiKey}&numOfRows=20&pageNo=1&type=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock data if API fails
    return NextResponse.json({
      response: {
        body: {
          items: {
            item: [
              { aicpName: "T1 출국장 1구역", congestNm: "원활", passengerNum: 1240 },
              { aicpName: "T1 출국장 2구역", congestNm: "보통", passengerNum: 2180 },
              { aicpName: "T1 출국장 3구역", congestNm: "혼잡", passengerNum: 3450 },
              { aicpName: "T2 출국장 1구역", congestNm: "원활", passengerNum: 980 },
              { aicpName: "T2 출국장 2구역", congestNm: "보통", passengerNum: 1760 },
              { aicpName: "T2 출국장 3구역", congestNm: "원활", passengerNum: 820 },
            ],
          },
          totalCount: 6,
        },
      },
      _mock: true,
      _error: String(error),
    });
  }
}
