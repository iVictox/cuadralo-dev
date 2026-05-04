export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}
