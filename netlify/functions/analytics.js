exports.handler = async function () {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal mengambil access token", detail: tokenData })
    };
  }

  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const startDate = "2026-04-01";

  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,impressions,impressionClickThroughRate",
    dimensions: "video",
    sort: "-views",
    maxResults: "50"
  });

  const analyticsRes = await fetch(
    "https://youtubeanalytics.googleapis.com/v2/reports?" + params.toString(),
    {
      headers: {
        Authorization: "Bearer " + tokenData.access_token
      }
    }
  );

  const analyticsData = await analyticsRes.json();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analyticsData)
  };
};
