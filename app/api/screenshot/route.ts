import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const transferID = searchParams.get("transferID");

    if (!transferID) {
      return new NextResponse("Missing transferID", { status: 400 });
    }

    const imageRes = await fetch(
      `https://futtransfer.top/getScreenshot.php?transferID=${transferID}&mode=2`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      }
    );

    if (!imageRes.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",

        // مهم جدًا
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}