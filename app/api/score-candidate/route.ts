import { CandidateScore, ExtractedCandidate } from "@/src/types/candidate";

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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const jobDescription = body?.jobDescription;
    const candidate: ExtractedCandidate = body?.candidate;

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return Response.json(
        { error: "Missing or invalid 'jobDescription' in request body" },
        { status: 400 }
      );
    }

    if (!candidate || typeof candidate !== "object") {
      return Response.json(
        { error: "Missing or invalid 'candidate' in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[score-candidate] Error: GEMINI_API_KEY environment variable is not configured.");
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const candidateSummaryText = `
Candidate Name: ${candidate.fullName || "Unknown"}
Years of Experience: ${candidate.yearsOfExperience ?? 0}
Skills: ${(candidate.skills || []).join(", ")}
Education: ${candidate.education || "Not specified"}
Certifications: ${(candidate.certifications || []).join(", ")}
Tools & Technologies: ${(candidate.tools || []).join(", ")}
Summary: ${candidate.summary || "Not provided"}
`.trim();

    const prompt = `You are an expert recruitment evaluator and talent acquisition specialist.
Evaluate how well the following candidate matches the provided job description.

Job Description:
"""
${jobDescription}
"""

Candidate Profile:
"""
${candidateSummaryText}
"""

Instructions:
1. Compare the candidate's skills, experience level, tools, and background against the job requirements.
2. Determine a match score from 0 to 100.
3. Assign a match level: "Strong" (typically 75-100), "Medium" (typically 50-74), or "Weak" (0-49).
4. Provide a 2-3 sentence reasoning explaining the score.
5. Identify any missing skills or requirements that the job asks for which the candidate lacks.
6. Identify the candidate's key strengths that directly align with the job.

Return ONLY a valid JSON object matching this exact structure with no markdown, no code fences, and no surrounding text:
{
  "matchScore": number (0-100),
  "matchLevel": "Strong" | "Medium" | "Weak",
  "reasoning": "2-3 sentences explaining the score",
  "missingSkills": ["Array", "of", "missing skills"],
  "strengths": ["Array", "of", "candidate strengths for this role"]
}`;

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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(
        `[score-candidate] Gemini API HTTP ${response.status} ${response.statusText} for candidate "${candidate.fullName}":`,
        errorDetails
      );
      return Response.json(
        {
          error: "Gemini API request failed",
          status: response.status,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Log raw text response and data payload from Gemini before attempting JSON parse
    console.log(
      `[score-candidate] Raw Gemini response text for candidate "${candidate.fullName}":\n`,
      rawText
    );
    if (!rawText) {
      console.error(
        `[score-candidate] Gemini API returned no text response for candidate "${candidate.fullName}". Full payload:\n`,
        JSON.stringify(data, null, 2)
      );
      return Response.json(
        { error: "Gemini API returned an empty text response", rawPayload: data },
        { status: 500 }
      );
    }

    const cleanedText = cleanJsonText(rawText);

    let parsedScore: CandidateScore;
    try {
      const parsed = JSON.parse(cleanedText);

      let matchLevel: "Strong" | "Medium" | "Weak" = "Medium";
      if (
        parsed.matchLevel === "Strong" ||
        parsed.matchLevel === "Medium" ||
        parsed.matchLevel === "Weak"
      ) {
        matchLevel = parsed.matchLevel;
      } else {
        const numScore = Number(parsed.matchScore) || 0;
        if (numScore >= 75) matchLevel = "Strong";
        else if (numScore >= 50) matchLevel = "Medium";
        else matchLevel = "Weak";
      }

      parsedScore = {
        matchScore:
          typeof parsed.matchScore === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.matchScore)))
            : Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0))),
        matchLevel,
        reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      };
    } catch (parseError) {
      console.error(
        `[score-candidate] JSON parse error for candidate "${candidate.fullName}":`,
        parseError
      );
      console.error("[score-candidate] Raw response that failed parsing:\n", rawText);
      console.error("[score-candidate] Cleaned text attempted to parse:\n", cleanedText);
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

    return Response.json(parsedScore);
  } catch (error) {
    console.error("[score-candidate] Unexpected error during candidate scoring:", error);
    if (error instanceof Error) {
      console.error("[score-candidate] Error name:", error.name);
      console.error("[score-candidate] Error message:", error.message);
      console.error("[score-candidate] Error stack trace:", error.stack);
    }
    return Response.json(
      {
        error: "Failed to process candidate scoring",
        details: error instanceof Error ? error.message : "Unknown error",
        errorObject: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
      },
      { status: 500 }
    );
  }
}
