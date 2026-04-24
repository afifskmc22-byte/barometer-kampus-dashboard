exports.handler = async function (event) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return json(500, { error: { message: "YOUTUBE_API_KEY belum diset di Netlify Environment Variables." } });
    }

    const rawIds = (event.queryStringParameters && event.queryStringParameters.ids) || "";
    const ids = rawIds.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 50);
    if (!ids.length) {
      return json(400, { error: { message: "Parameter ids kosong." } });
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,statistics,contentDetails");
    url.searchParams.set("id", ids.join(","));
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();
    if (!response.ok) return json(response.status, data);

    return json(200, data, { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" });
  } catch (error) {
    return json(500, { error: { message: error.message || "Server error" } });
  }
};

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", ...extraHeaders },
    body: JSON.stringify(body)
  };
}
