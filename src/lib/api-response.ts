import { NextResponse } from "next/server";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };
}

export function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(),
  });
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
