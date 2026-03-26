import { NextResponse } from "next/server";

export const revalidate = 0;

// 현실적인 시간대별 고정 승객 수 (T1 / T2 출국장)
const HOURLY_PAX = [
  { hour: "00:00", t1Passenger:  320, t2Passenger:  280 },
  { hour: "01:00", t1Passenger:  180, t2Passenger:  150 },
  { hour: "02:00", t1Passenger:  120, t2Passenger:   90 },
  { hour: "03:00", t1Passenger:   95, t2Passenger:   75 },
  { hour: "04:00", t1Passenger:  420, t2Passenger:  350 },
  { hour: "05:00", t1Passenger: 1200, t2Passenger:  980 },
  { hour: "06:00", t1Passenger: 2100, t2Passenger: 1750 },
  { hour: "07:00", t1Passenger: 2800, t2Passenger: 2300 },
  { hour: "08:00", t1Passenger: 2650, t2Passenger: 2100 },
  { hour: "09:00", t1Passenger: 2200, t2Passenger: 1850 },
  { hour: "10:00", t1Passenger: 1800, t2Passenger: 1500 },
  { hour: "11:00", t1Passenger: 1650, t2Passenger: 1380 },
  { hour: "12:00", t1Passenger: 1900, t2Passenger: 1600 },
  { hour: "13:00", t1Passenger: 2050, t2Passenger: 1720 },
  { hour: "14:00", t1Passenger: 2300, t2Passenger: 1950 },
  { hour: "15:00", t1Passenger: 2500, t2Passenger: 2100 },
  { hour: "16:00", t1Passenger: 2700, t2Passenger: 2250 },
  { hour: "17:00", t1Passenger: 2900, t2Passenger: 2400 },
  { hour: "18:00", t1Passenger: 3100, t2Passenger: 2600 },
  { hour: "19:00", t1Passenger: 2850, t2Passenger: 2380 },
  { hour: "20:00", t1Passenger: 2400, t2Passenger: 2000 },
  { hour: "21:00", t1Passenger: 1950, t2Passenger: 1630 },
  { hour: "22:00", t1Passenger: 1400, t2Passenger: 1180 },
  { hour: "23:00", t1Passenger:  750, t2Passenger:  620 },
];

export async function GET() {
  console.log("[passenger] 함수 실행됨", new Date().toISOString());
  return NextResponse.json({ items: HOURLY_PAX, _mock: true });
}
