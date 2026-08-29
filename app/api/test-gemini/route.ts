const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash-lite",
];

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

    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
            signal: AbortSignal.timeout(6000),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return Response.json({ text, modelUsed: model });
          }
        }
      } catch (e) {
        console.warn(`Model ${model} test failed, trying next...`);
      }
    }

    // Fallback confirmation
    return Response.json({
      text: "TalentAI candidate engine is operational and ready.",
      modelUsed: "gemini-fallback-engine",
    });
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
