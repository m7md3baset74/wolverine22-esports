import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const res = await fetch(
    `https://futtransfer.top/getOrderStatus.php?uuid=LOOKUP&verify=${code}&code=${code}`
  );

  const data = await res.json();

  return NextResponse.json(data);
}