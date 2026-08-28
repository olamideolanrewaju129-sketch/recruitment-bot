const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_PROMPT = "Say hello and confirm you are working";

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: GEMINI_PROMPT }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      return Response.json(
        {
          error: "Gemini API request failed",
          details: errorDetails,
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json(
        { error: "Gemini API returned no text response" },
        { status: 500 },
      );
    }

    return Response.json({ text });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to call Gemini API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
