import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "SmartHR",
    version: "1.0.0",
  });
}
