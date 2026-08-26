export interface ExtractedCandidate {
  fullName: string;
  yearsOfExperience: number;
  skills: string[];
  education: string;
  certifications: string[];
  tools: string[];
  summary: string;
}

export interface CandidateWithFile extends ExtractedCandidate {
  fileName: string;
  rawText: string;
}

export interface CandidateScore {
  matchScore: number;
  matchLevel: "Strong" | "Medium" | "Weak";
  reasoning: string;
  missingSkills: string[];
  strengths: string[];
}

export interface ScoredCandidate extends ExtractedCandidate, CandidateScore {
  fileName: string;
  rawText?: string;
  scoringFailed?: boolean;
}
