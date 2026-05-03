import { anthropic, HIRING_SYSTEM_PROMPT, MODEL } from "./client";
import type {
  ExtractedRequirements,
  FairnessCheckResult,
  MatchResult,
  SelfCheckResult,
} from "./types";


export async function extractRequirements(
  jobDescription: string
): Promise<ExtractedRequirements> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: HIRING_SYSTEM_PROMPT,
    tools: [
      {
        name: "extract_requirements",
        description:
          "Extract structured hiring requirements from a job description",
        input_schema: {
          type: "object" as const,
          properties: {
            requiredSkills: {
              type: "array",
              items: { type: "string" },
              description: "Must-have technical skills and qualifications",
            },
            preferredSkills: {
              type: "array",
              items: { type: "string" },
              description: "Nice-to-have skills and qualifications",
            },
            yearsExperience: {
              type: ["number", "null"],
              description:
                "Required years of experience, or null if unspecified",
            },
            educationLevel: {
              type: ["string", "null"],
              description:
                "Required education level (e.g. 'Bachelor\\'s degree'), or null if unspecified",
            },
            domainExperience: {
              type: "array",
              items: { type: "string" },
              description: "Industry or domain experience requirements",
            },
            softSkills: {
              type: "array",
              items: { type: "string" },
              description: "Interpersonal and soft skills mentioned",
            },
          },
          required: [
            "requiredSkills",
            "preferredSkills",
            "yearsExperience",
            "educationLevel",
            "domainExperience",
            "softSkills",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "extract_requirements" },
    messages: [
      {
        role: "user",
        content: `Extract the hiring requirements from this job description:\n\n${jobDescription}`,
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use in response");
  }
  return toolUse.input as ExtractedRequirements;
}

export async function checkJdFairness(
  jobDescription: string
): Promise<FairnessCheckResult> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: HIRING_SYSTEM_PROMPT,
    tools: [
      {
        name: "flag_fairness_concerns",
        description:
          "Identify potentially exclusionary language or requirements in a job description",
        input_schema: {
          type: "object" as const,
          properties: {
            flags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phrase: {
                    type: "string",
                    description: "The exact phrase or requirement from the JD",
                  },
                  concern: {
                    type: "string",
                    description:
                      "One sentence explaining the potential concern, advisory and non-accusatory.",
                  },
                  suggestion: {
                    type: "string",
                    description: "One sentence with a constructive alternative phrasing or approach.",
                  },
                },
                required: ["phrase", "concern", "suggestion"],
              },
            },
          },
          required: ["flags"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "flag_fairness_concerns" },
    messages: [
      {
        role: "user",
        content: `Review this job description for potentially exclusionary language or requirements. Look for:
- Degree requirements that may not be necessary for the role
- Experience demands that exceed a technology's age (e.g. "10 years of React experience")
- Vague culture-fit language that can mask bias
- Gendered or exclusionary language
- Requirements that disproportionately screen out qualified candidates

Be advisory and constructive — the goal is to help write better JDs, not to criticise.

Job description:
${jobDescription}`,
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use in response");
  }
  return toolUse.input as FairnessCheckResult;
}

export async function matchCvToJd(
  cvText: string,
  jdRequirements: ExtractedRequirements
): Promise<MatchResult> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: HIRING_SYSTEM_PROMPT,
    tools: [
      {
        name: "match_candidate",
        description: "Evaluate a candidate CV against job requirements",
        input_schema: {
          type: "object" as const,
          properties: {
            tier: {
              type: "string",
              enum: ["STRONG_FIT", "WORTH_A_LOOK", "LIKELY_NOT_A_FIT"],
              description:
                "Overall fit tier. Bias toward WORTH_A_LOOK on borderline cases.",
            },
            summary: {
              type: "string",
              description:
                "1-2 sentence summary of the candidate's fit, written for the recruiter. Be direct and specific — no filler phrases.",
            },
            requirementMatches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["required", "preferred", "domain", "soft"],
                  },
                  evidence: {
                    type: "string",
                    enum: ["strong", "partial", "none"],
                  },
                  justification: {
                    type: "string",
                    description:
                      "One sentence citing specific evidence from the CV, or explaining why evidence was not found",
                  },
                },
                required: ["requirement", "type", "evidence", "justification"],
              },
            },
            notableContext: {
              type: ["string", "null"],
              description:
                "One sentence of notable context (transferable skills, career gaps, non-obvious capability), or null if nothing notable.",
            },
          },
          required: ["tier", "summary", "requirementMatches", "notableContext"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "match_candidate" },
    messages: [
      {
        role: "user",
        content: `Evaluate this candidate CV against the job requirements below.

IMPORTANT INSTRUCTIONS:
- For each requirement, look actively for transferable skills and non-obvious evidence
- Count project work, open source, volunteer work, and freelance as valid experience
- When uncertain about tier, choose WORTH_A_LOOK rather than LIKELY_NOT_A_FIT
- Do not penalise non-traditional CV formats or career transitions without context
- The tier is a recommendation for the recruiter, not a final decision
- Keep summary to 1-2 sentences; keep notableContext to 1 sentence if provided
- Each justification should be one short sentence citing specific CV evidence

JOB REQUIREMENTS:
Required skills: ${jdRequirements.requiredSkills.join(", ")}
Preferred skills: ${jdRequirements.preferredSkills.join(", ")}
Years of experience: ${jdRequirements.yearsExperience ?? "Not specified"}
Education: ${jdRequirements.educationLevel ?? "Not specified"}
Domain experience: ${jdRequirements.domainExperience.join(", ")}
Soft skills: ${jdRequirements.softSkills.join(", ")}

CANDIDATE CV:
${cvText}`,
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use in response");
  }
  return toolUse.input as MatchResult;
}

export async function candidateSelfCheck(
  cvText: string,
  jobDescription: string
): Promise<SelfCheckResult> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: HIRING_SYSTEM_PROMPT,
    tools: [
      {
        name: "candidate_self_check",
        description:
          "Give a candidate personalised feedback on how well their CV matches a job description",
        input_schema: {
          type: "object" as const,
          properties: {
            tier: {
              type: "string",
              enum: ["STRONG_FIT", "WORTH_A_LOOK", "LIKELY_NOT_A_FIT"],
              description: "Overall match assessment. Bias toward WORTH_A_LOOK.",
            },
            summary: {
              type: "string",
              description:
                "1-2 encouraging sentences for the candidate about their overall fit. Be concise and direct.",
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific strengths from the CV that match this role well",
            },
            gaps: {
              type: "array",
              items: { type: "string" },
              description:
                "Areas where the CV doesn't clearly address the JD requirements — framed as opportunities to highlight or address",
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  advice: {
                    type: "string",
                    description:
                      "1-2 sentences of concrete advice on what to highlight, reframe, or add.",
                  },
                },
                required: ["area", "advice"],
              },
            },
            requirementMatches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["required", "preferred", "domain", "soft"],
                  },
                  evidence: {
                    type: "string",
                    enum: ["strong", "partial", "none"],
                  },
                  justification: { type: "string" },
                },
                required: ["requirement", "type", "evidence", "justification"],
              },
            },
          },
          required: [
            "tier",
            "summary",
            "strengths",
            "gaps",
            "suggestions",
            "requirementMatches",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "candidate_self_check" },
    messages: [
      {
        role: "user",
        content: `A candidate wants to understand how well their CV matches this job. Give them honest, encouraging, and actionable feedback.

Frame everything from the candidate's perspective — speak directly to them. Be specific and constructive. Keep all prose fields concise: summary in 1-2 sentences, each strength and gap as one short sentence, each advice field in 1-2 sentences.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}`,
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use in response");
  }
  return toolUse.input as SelfCheckResult;
}
