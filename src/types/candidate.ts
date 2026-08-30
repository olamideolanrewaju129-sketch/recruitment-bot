export interface ExtractedCandidate {
  fullName: string;
  yearsOfExperience: number;
  skills: string[];
  education: string;
  certifications: string[];
  tools: string[];
  /** A short 1-2 sentence summary of the candidate's background */
  summary: string;
}

export interface CandidateWithFile extends ExtractedCandidate {
  fileName: string;
  rawText: string;
}
