import { ExtractedCandidate } from "@/src/types/candidate";

export const maxDuration = 30;

const GEMINI_MODEL = "gemini-3.6-flash";

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callGeminiWithRetry(url: string, payload: unknown): Promise<Response> {
  const maxRetries = 3;
  const backoffDelays = [2000, 4000, 8000]; // 2s before retry 1, 4s before retry 2, 8s before retry 3

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  for (let retry = 1; retry <= maxRetries; retry++) {
    if (response.status !== 429) {
      return response;
    }

    const delayMs = backoffDelays[retry - 1];
    const delaySec = delayMs / 1000;
    console.warn(`Rate limited, retrying in ${delaySec}s... (attempt ${retry}/${maxRetries})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const resumeText = body?.resumeText;

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return Response.json(
        { error: "Missing or invalid 'resumeText' in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are an expert HR and recruitment assistant. Extract structured candidate information from the following resume text.

Return ONLY a valid JSON object matching this exact TypeScript structure with no markdown, no code fences, and no surrounding text:
{
  "fullName": "Candidate full name as string (use 'Unknown' if not found)",
  "yearsOfExperience": total years of professional experience as a number (e.g. 5 or 0),
  "skills": ["Array", "of", "relevant", "skills"],
  "education": "Highest degree or education summary as string",
  "certifications": ["Array", "of", "certifications", "licenses"],
  "tools": ["Array", "of", "technologies", "tools", "frameworks", "software"],
  "summary": "A concise 1-2 sentence summary of the candidate's professional background and strengths"
}

Resume Text:
"""
${resumeText}
"""`;

    const response = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      return Response.json(
        {
          error: "Gemini API request failed",
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return Response.json(
        { error: "Gemini API returned an empty text response" },
        { status: 500 }
      );
    }

    const cleanedText = cleanJsonText(rawText);

    let parsedCandidate: ExtractedCandidate;
    try {
      const parsed = JSON.parse(cleanedText);
      parsedCandidate = {
        fullName: typeof parsed.fullName === "string" ? parsed.fullName : "Unknown",
        yearsOfExperience:
          typeof parsed.yearsOfExperience === "number"
            ? parsed.yearsOfExperience
            : Number(parsed.yearsOfExperience) || 0,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: typeof parsed.education === "string" ? parsed.education : "",
        certifications: Array.isArray(parsed.certifications)
          ? parsed.certifications
          : [],
        tools: Array.isArray(parsed.tools) ? parsed.tools : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
      };
    } catch (parseError) {
      return Response.json(
        {
          error: "Failed to parse Gemini response as JSON",
          details:
            parseError instanceof Error ? parseError.message : "Invalid JSON",
          rawResponse: rawText,
        },
        { status: 500 }
      );
    }

    return Response.json(parsedCandidate);
  } catch (error) {
    return Response.json(
      {
        error: "Failed to process candidate extraction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
