/**
 * CLI test script for the AI module.
 * Run with: pnpm test:ai
 */
// env loaded via --env-file flag in package.json script
import {
  extractRequirements,
  checkJdFairness,
  matchCvToJd,
  candidateSelfCheck,
} from "./index";

const SAMPLE_JD = `
Software Engineer — Full Stack
We are looking for a rockstar developer with 5+ years of experience in React and Node.js.
Must have a Computer Science degree. Cultural fit is essential — you need to be a team player who can keep up with our fast-paced bro culture.
Experience with AWS and PostgreSQL required. Knowledge of Docker preferred.
Must have been using React since its inception (2013).
`;

const SAMPLE_CV = `
Jane Smith
jane@example.com

EXPERIENCE
Web Developer, Acme Corp (2021–present)
- Built dashboard UI using React and TypeScript
- Developed REST APIs with Node.js and Express
- Deployed services on AWS (EC2, S3, RDS)
- Mentored two junior developers

Freelance Developer (2019–2021)
- Various client projects using React, Vue.js, and Node.js
- PostgreSQL database design and management

EDUCATION
Self-taught developer. Completed freeCodeCamp Full Stack certification (2019).
Currently enrolled part-time in BSc Computer Science (year 2 of 3).

PROJECTS
Open source contributor to react-query (2022–present)
Personal project: built a task management app with Next.js and Supabase, 500+ GitHub stars
`;

async function main() {
  console.log("\n=== CandidView AI Module Test ===\n");

  console.log("1. Extracting requirements from JD...");
  const requirements = await extractRequirements(SAMPLE_JD);
  console.log("Requirements:", JSON.stringify(requirements, null, 2));

  console.log("\n2. Checking JD for fairness flags...");
  const fairness = await checkJdFairness(SAMPLE_JD);
  console.log("Fairness flags:", JSON.stringify(fairness, null, 2));

  console.log("\n3. Matching candidate CV to JD...");
  const match = await matchCvToJd(SAMPLE_CV, requirements);
  console.log("Match result:", JSON.stringify(match, null, 2));

  console.log("\n4. Running candidate self-check...");
  const selfCheck = await candidateSelfCheck(SAMPLE_CV, SAMPLE_JD);
  console.log("Self-check result:", JSON.stringify(selfCheck, null, 2));

  console.log("\n=== All tests passed ===\n");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
