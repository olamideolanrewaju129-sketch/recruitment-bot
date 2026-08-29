import { CandidateScore, ExtractedCandidate } from "@/src/types/candidate";

export const maxDuration = 30;

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash-lite",
];

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

/**
 * Intelligent heuristic scoring engine fallback.
 * Evaluates semantic match between job description and candidate profile.
 */
function heuristicScore(jobDescription: string, candidate: ExtractedCandidate): CandidateScore {
  const jdLower = jobDescription.toLowerCase();
  const allCandidateSkills = [
    ...(candidate.skills || []),
    ...(candidate.tools || []),
  ];

  // Check matching skills
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Common keywords to search in JD
  const importantKeywords = [
    "next.js", "typescript", "react", "node.js", "python", "tailwind",
    "gemini", "openai", "ai", "postgresql", "sql", "vector", "aws", "docker",
    "graphql", "agile", "product", "leadership", "figma"
  ];

  const jdRequirements = importantKeywords.filter((kw) => jdLower.includes(kw));

  jdRequirements.forEach((req) => {
    const hasSkill = allCandidateSkills.some((s) => s.toLowerCase().includes(req));
    if (hasSkill) {
      matchedSkills.push(req.toUpperCase());
    } else {
      missingSkills.push(`Proficiency in ${req.toUpperCase()}`);
    }
  });

  // Calculate experience requirement from JD
  const expMatch = jobDescription.match(/(\d{1,2})\+?\s*(?:years?|yrs?)/i);
  const requiredExp = expMatch ? parseInt(expMatch[1], 10) : 3;
  const candidateExp = candidate.yearsOfExperience || 0;

  // Category scores
  const experienceRatio = Math.min(1.2, candidateExp / Math.max(1, requiredExp));
  const experienceScore = Math.min(100, Math.round(experienceRatio * 85));

  const skillMatchRatio = jdRequirements.length > 0
    ? matchedSkills.length / jdRequirements.length
    : 0.8;
  const technicalScore = Math.min(100, Math.round(skillMatchRatio * 90 + 10));

  const domainScore = Math.min(100, Math.round((technicalScore * 0.6) + (experienceScore * 0.4)));
  const educationScore = candidate.education ? 90 : 75;

  const matchScore = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        technicalScore * 0.4 +
        experienceScore * 0.3 +
        domainScore * 0.2 +
        educationScore * 0.1
      )
    )
  );

  let matchLevel: "Strong" | "Medium" | "Weak" = "Medium";
  if (matchScore >= 75) matchLevel = "Strong";
  else if (matchScore < 50) matchLevel = "Weak";

  const strengths: string[] = [];
  if (candidateExp >= requiredExp) {
    strengths.push(`${candidateExp} years of relevant experience meets/exceeds the ${requiredExp}+ years role criteria.`);
  }
  if (matchedSkills.length > 0) {
    strengths.push(`Demonstrated hands-on experience with key technologies: ${matchedSkills.slice(0, 4).join(", ")}.`);
  }
  if (candidate.education) {
    strengths.push(`Solid educational foundation with ${candidate.education}.`);
  }
  if (strengths.length === 0) {
    strengths.push("Possesses foundational technical skills and adaptable profile.");
  }

  const finalMissing = missingSkills.length > 0
    ? missingSkills.slice(0, 3)
    : ["Specific enterprise production scaling metrics not detailed"];

  const reasoning = `${candidate.fullName} is evaluated as a ${matchLevel} match (${matchScore}/100) with ${candidateExp} years of experience. Demonstrated strength in ${matchedSkills.slice(0, 3).join(", ") || "core technologies"}, while role alignment would benefit from deeper evidence in ${finalMissing[0] || "niche requirements"}.`;

  const suggestedInterviewQuestions = [
    `Can you describe a complex production feature you built using ${matchedSkills[0] || "your primary tech stack"} and how you architected it?`,
    `How would you quickly ramp up on ${finalMissing[0] || "emerging AI architectures"} to meet our project timeline?`,
    `Walk us through a time you had to debug a difficult performance bottleneck in a high-traffic application.`
  ];

  const outreachEmailDraft = `Hi ${candidate.fullName},\n\nI came across your profile and was impressed by your ${candidateExp}+ years of experience and strong expertise in ${matchedSkills.slice(0, 3).join(", ") || "modern engineering"}.\n\nWe are currently hiring for a key engineering position and believe your background aligns well with our team's goals. Would you be open to a brief 15-minute introductory call this week?\n\nBest regards,\nRecruitment Team`;

  return {
    matchScore,
    matchLevel,
    reasoning,
    missingSkills: finalMissing,
    strengths,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : candidate.skills.slice(0, 3),
    categoryScores: {
      technical: technicalScore,
      experience: experienceScore,
      domain: domainScore,
      education: educationScore,
    },
    suggestedInterviewQuestions,
    outreachEmailDraft,
  };
}

async function callGemini(apiKey: string, prompt: string): Promise<Response | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        return res;
      }
    } catch (e) {
      console.warn(`Gemini score attempt with ${model} failed, trying next...`);
    }
  }
  return null;
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
Evaluate how well the candidate matches the job description.

Job Description:
\"\"\"
${jobDescription}
\"\"\"

Candidate Profile:
\"\"\"
${candidateSummaryText}
\"\"\"

Instructions:
1. Provide an overall matchScore (0-100) and matchLevel ("Strong" | "Medium" | "Weak").
2. Provide category sub-scores (0-100 each) for: "technical", "experience", "domain", "education".
3. Provide a concise 2-3 sentence reasoning.
4. List exact missing skills or gaps ("missingSkills").
5. List key standout strengths ("strengths").
6. List matched skills ("matchedSkills").
7. Generate 3 tailored interview questions ("suggestedInterviewQuestions").
8. Generate a brief personalized outreach email ("outreachEmailDraft").

Return ONLY a valid JSON object matching this exact structure with no markdown code fences:
{
  "matchScore": 88,
  "matchLevel": "Strong",
  "reasoning": "2-3 sentences evaluation reasoning",
  "missingSkills": ["missing skill 1", "missing skill 2"],
  "strengths": ["key strength 1", "key strength 2"],
  "matchedSkills": ["skill 1", "skill 2"],
  "categoryScores": {
    "technical": 90,
    "experience": 85,
    "domain": 80,
    "education": 95
  },
  "suggestedInterviewQuestions": [
    "Question 1 targeting experience",
    "Question 2 targeting skill gap",
    "Question 3 behavioral"
  ],
  "outreachEmailDraft": "Personalized recruiter message draft..."
}`;

    if (apiKey) {
      const response = await callGemini(apiKey, prompt);
      if (response && response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            const cleaned = cleanJsonText(rawText);
            const parsed = JSON.parse(cleaned);

            let matchLevel: "Strong" | "Medium" | "Weak" = "Medium";
            if (["Strong", "Medium", "Weak"].includes(parsed.matchLevel)) {
              matchLevel = parsed.matchLevel;
            } else {
              const num = Number(parsed.matchScore) || 0;
              if (num >= 75) matchLevel = "Strong";
              else if (num < 50) matchLevel = "Weak";
            }

            const scoredResult: CandidateScore = {
              matchScore: Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0))),
              matchLevel,
              reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
              missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
              matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
              categoryScores: parsed.categoryScores || {
                technical: 85,
                experience: 80,
                domain: 75,
                education: 85,
              },
              suggestedInterviewQuestions: Array.isArray(parsed.suggestedInterviewQuestions)
                ? parsed.suggestedInterviewQuestions
                : [
                    "How have you architected large-scale applications with modern web frameworks?",
                    "Can you walk us through a recent challenge with system performance?"
                  ],
              outreachEmailDraft: typeof parsed.outreachEmailDraft === "string"
                ? parsed.outreachEmailDraft
                : `Hi ${candidate.fullName},\n\nWe noticed your strong background and would love to connect for a quick 15-min chat regarding our open role.`,
            };

            return Response.json(scoredResult);
          } catch (e) {
            console.warn("Error parsing Gemini score response, using heuristic fallback", e);
          }
        }
      }
    }

    // Heuristic fallback
    const fallback = heuristicScore(jobDescription, candidate);
    return Response.json(fallback);
  } catch (error) {
    return Response.json(
      {
        error: "Failed to process candidate scoring",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
