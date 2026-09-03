import { posthogSnippet } from "./analytics.ts";

const analytics = {
  POSTHOG_PROJECT_TOKEN: "phc_test_token",
  POSTHOG_HOST: "https://us.i.posthog.com",
};

let failed = 0;

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error(message);
    failed += 1;
  }
}

const snippet = posthogSnippet(analytics);
assert(snippet.includes("posthog.init"), "snippet must call posthog.init");
assert(snippet.includes("phc_test_token"), "snippet must include project token");
assert(snippet.includes("https://us.i.posthog.com"), "snippet must include api host");
assert(snippet.includes("defaults: '2026-05-30'"), "snippet must set defaults");
assert(!snippet.includes("<ph_project_token>"), "snippet must not leave placeholder");

if (failed > 0) {
  console.error(`${failed} analytics test(s) failed`);
  process.exit(1);
}

console.log("analytics tests passed");
