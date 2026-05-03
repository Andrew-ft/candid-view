export type Tier = "STRONG_FIT" | "WORTH_A_LOOK" | "LIKELY_NOT_A_FIT";

export interface ExtractedRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  yearsExperience: number | null;
  educationLevel: string | null;
  domainExperience: string[];
  softSkills: string[];
}

export interface FairnessFlag {
  phrase: string;
  concern: string;
  suggestion: string;
}

export interface FairnessCheckResult {
  flags: FairnessFlag[];
}

export type EvidenceLevel = "strong" | "partial" | "none";

export interface RequirementMatch {
  requirement: string;
  type: "required" | "preferred" | "domain" | "soft";
  evidence: EvidenceLevel;
  justification: string;
}

export interface MatchResult {
  tier: Tier;
  summary: string;
  requirementMatches: RequirementMatch[];
  notableContext: string | null;
}

export interface SelfCheckSuggestion {
  area: string;
  advice: string;
}

export interface SelfCheckResult {
  tier: Tier;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: SelfCheckSuggestion[];
  requirementMatches: RequirementMatch[];
}
