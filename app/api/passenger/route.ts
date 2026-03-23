import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.AIRPORT_API_KEY;
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const url = `https://apis.data.go.kr/B551177/PassengerNotice/getPassengerNotice?serviceKey=${apiKey}&numOfRows=24&pageNo=1&type=json&paxmon=${dateStr}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock hourly data
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      t1Passenger: Math.floor(Math.random() * 3000 + 500),
      t2Passenger: Math.floor(Math.random() * 2500 + 400),
    }));
    return NextResponse.json({
      items: hours,
      _mock: true,
      _error: String(error),
    });
  }
}
