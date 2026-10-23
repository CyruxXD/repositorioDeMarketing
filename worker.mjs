export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (!pathname.startsWith("/recursos/") || !pathname.endsWith(".mp4") || !["GET", "HEAD"].includes(request.method)) {
      return env.ASSETS.fetch(request);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete("Range");
    requestHeaders.delete("If-Range");
    const asset = await env.ASSETS.fetch(new Request(request, { headers: requestHeaders }));
    if (asset.status !== 200) return asset;

    const headers = new Headers(asset.headers);
    headers.set("Accept-Ranges", "bytes");
    const range = request.headers.get("Range");
    const ifRange = request.headers.get("If-Range");
    const matchesValidator = !ifRange || (
      !ifRange.startsWith("W/") && (
        ifRange === headers.get("ETag") || ifRange === headers.get("Last-Modified")
      )
    );
    const match = range?.match(/^bytes=(\d*)-(\d*)$/);
    if (request.method === "HEAD" || !match || !matchesValidator) {
      return new Response(asset.body, { status: asset.status, headers });
    }

    const buffer = await asset.arrayBuffer();
    const size = buffer.byteLength;
    const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if ((!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
      headers.set("Content-Range", `bytes */${size}`);
      headers.set("Content-Length", "0");
      return new Response(null, { status: 416, headers });
    }

    const body = buffer.slice(start, end + 1);
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(body.byteLength));
    return new Response(body, { status: 206, headers });
  }
};
