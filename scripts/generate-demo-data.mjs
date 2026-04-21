import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public", "data");
const questionsDir = path.join(publicDir, "questions");
const conversationsDir = path.join(publicDir, "conversations");
const metricsDir = path.join(publicDir, "metrics");

const AGENTS = ["ChatGPT", "Claude", "Gemini", "Grok"];
const ROLE_BY_AGENT = {
  ChatGPT: "Contrarian",
  Claude: "Optimist",
  Gemini: "Utilitarian",
  Grok: "Absolutist",
};

const CONDITIONS = [
  "single_no_role",
  "single_role",
  "debate_no_role",
  "debate_role",
];

const CONDITION_META = {
  single_no_role: { runMode: "single", roleMode: "no-role" },
  single_role: { runMode: "single", roleMode: "role" },
  debate_no_role: { runMode: "debate", roleMode: "no-role" },
  debate_role: { runMode: "debate", roleMode: "role" },
};

const TOPICS = [
  {
    slug: "rule-consistency",
    title: "Rule Consistency vs Case-by-Case Exceptions",
    spectrum: "Ethics & Norms",
    definition:
      "Whether rules should generally hold across situations or be bent when circumstances are unusual.",
    yesMeans: "The rule should generally stay consistent.",
    prompts: [
      "Should honesty rules generally be followed even when the truth may hurt someone’s feelings?",
      "Should people generally keep promises even when circumstances become difficult?",
      "Should privacy rules generally remain in force even during emergencies?",
      "Should loyalty standards generally apply even when a friend is clearly in the wrong?",
      "Should fairness rules be applied consistently even when a case seems emotionally unusual?",
    ],
    baseYesRate: 0.46,
  },
  {
    slug: "self-expression",
    title: "Self-Expression vs Role Expectations",
    spectrum: "Identity & Culture",
    definition:
      "Whether people should present themselves naturally or adapt to the expectations of school, work, or social roles.",
    yesMeans: "Self-expression should be prioritized over role expectations.",
    prompts: [
      "Should employees be free to show their personality at work even if it seems less traditionally professional?",
      "Should students be allowed to express themselves freely even when it conflicts with school behavior norms?",
      "Should professionals be able to present themselves online in ways that do not match expectations in their field?",
      "Should dress expectations matter less than personal expression in public-facing roles?",
      "Should people be allowed to speak in their natural style at work even if it seems less polished?",
    ],
    baseYesRate: 0.54,
  },
  {
    slug: "public-safety",
    title: "Public Safety vs Individual Freedom",
    spectrum: "Policy & Governance",
    definition:
      "Whether restrictions on personal freedom are justified when they reduce risks to others.",
    yesMeans: "Public safety can justify limiting individual freedom.",
    prompts: [
      "Should governments be allowed to require masks during a serious public health emergency?",
      "Should cities be allowed to limit private car use in crowded areas to reduce pollution-related harm?",
      "Should online platforms be allowed to remove harmful content even when it restricts user expression?",
      "Should schools be allowed to impose stricter safety rules even when students see them as intrusive?",
      "Should governments be allowed to require evacuation orders during severe natural disasters?",
    ],
    baseYesRate: 0.67,
  },
  {
    slug: "personal-agency",
    title: "Personal Agency vs Structural Conditions",
    spectrum: "Causality & Responsibility",
    definition:
      "Whether outcomes are explained more by individual choices or by broader social and institutional conditions.",
    yesMeans: "Individual choices are usually the stronger explanation.",
    prompts: [
      "Is financial hardship usually more the result of personal decisions than larger social conditions?",
      "When workers burn out, are individual coping habits usually more responsible than workplace structure?",
      "Is poor academic performance usually more the result of student effort than school resources?",
      "Is misinformation spread usually more the result of careless users than platform design?",
      "Is poor health usually explained more by lifestyle choices than by environmental conditions?",
    ],
    baseYesRate: 0.41,
  },
  {
    slug: "institutional-confidence",
    title: "Institutional Confidence vs Institutional Suspicion",
    spectrum: "Institutions & Legitimacy",
    definition:
      "Whether institutions should generally be given the benefit of the doubt or treated with caution and doubt.",
    yesMeans: "Institutions usually deserve initial confidence.",
    prompts: [
      "Should people generally trust schools to make fair decisions about student discipline?",
      "Are employers usually justified in monitoring activity on company-owned devices?",
      "Should the public generally assume government data programs are designed in good faith?",
      "Should large online platforms generally be trusted to enforce moderation rules responsibly?",
      "Should hospitals generally be trusted to adopt new internal policies without outside review?",
    ],
    baseYesRate: 0.52,
  },
  {
    slug: "data-privacy",
    title: "Data Privacy vs Everyday Ease",
    spectrum: "Technology & Privacy",
    definition:
      "Whether privacy protections should be prioritized over smoother, faster, and easier digital experiences.",
    yesMeans: "Privacy should be prioritized over ease.",
    prompts: [
      "Should phones keep stronger privacy settings on by default even if setup becomes less convenient?",
      "Should apps be restricted from collecting extra user data even when it makes the service easier to use?",
      "Should biometric login be limited when it increases privacy risks, even if it speeds up access?",
      "Should workplaces avoid low-friction tracking tools when they collect detailed employee behavior data?",
      "Should school-issued devices use stricter privacy protections even if they become harder to manage?",
    ],
    baseYesRate: 0.63,
  },
  {
    slug: "fast-deployment",
    title: "Fast Deployment vs Risk Review",
    spectrum: "Innovation & Risk",
    definition:
      "Whether useful new tools should be deployed quickly or held back until risks are better understood.",
    yesMeans: "Fast deployment is justified even before full risk review.",
    prompts: [
      "Should companies release powerful AI tools before all major risks are fully understood?",
      "Should new environmental technologies be deployed quickly even when long-term side effects remain uncertain?",
      "Should automation be adopted rapidly when it improves efficiency, even if job impacts are unclear?",
      "Should schools begin using AI tutoring tools before independent evidence of long-term benefit is complete?",
      "Should hospitals adopt promising new diagnostic systems before bias and safety testing is fully mature?",
    ],
    baseYesRate: 0.35,
  },
  {
    slug: "immediate-support",
    title: "Immediate Support vs Future Resilience",
    spectrum: "Economics & Time Horizon",
    definition:
      "Whether solving urgent problems now should take priority over protecting long-term stability later.",
    yesMeans: "Immediate support should be prioritized.",
    prompts: [
      "Should governments lower consumer costs now even if doing so increases long-term economic risk?",
      "Should companies avoid layoffs now even if it weakens long-term financial stability?",
      "Should public programs expand immediate aid even if future budgets become harder to manage?",
      "Should climate policy focus first on lowering current household energy costs even if long-term transition slows?",
      "Should central banks act quickly to reduce unemployment even if inflation risks remain?",
    ],
    baseYesRate: 0.58,
  },
  {
    slug: "individual-rights",
    title: "Individual Rights vs Outcome Maximization",
    spectrum: "Rights & Utility",
    definition:
      "Whether individual rights should be protected even when overriding them could improve overall outcomes.",
    yesMeans: "Individual rights should be protected.",
    prompts: [
      "Should personal privacy be protected even when violating it could help many people?",
      "Should free expression be protected even when restricting it might reduce social harm?",
      "Should equal treatment be preserved even when unequal allocation could save more lives?",
      "Should due process be preserved even when bypassing it could speed up punishment of dangerous people?",
      "Should workers keep control over personal data even when sharing it could improve company performance?",
    ],
    baseYesRate: 0.62,
  },
  {
    slug: "free-choice",
    title: "Free Choice vs Protective Restrictions",
    spectrum: "Autonomy & Protection",
    definition:
      "Whether people should be free to make risky choices for themselves or be restricted for their own protection.",
    yesMeans: "Free choice should be preserved.",
    prompts: [
      "Should adults be allowed to use highly addictive digital products if they choose to do so?",
      "Should employees be free to reject workplace wellness rules that limit unhealthy behavior?",
      "Should consumers be allowed to buy risky products if the risks are clearly disclosed?",
      "Should students be free to use distracting apps even when schools believe restrictions would help them focus?",
      "Should people be allowed to ignore recommended health behaviors when the main harm falls on themselves?",
    ],
    baseYesRate: 0.49,
  },
];

function hash(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max));
}

function answerFromProbability(probability, seed) {
  const noise = (hash(seed) % 1000) / 1000;
  if (noise < probability) return "Yes";
  if (noise > clamp(0.5, probability + 0.32, 0.95)) return "No";
  return "Maybe";
}

function majorityOutcome(votes) {
  const yesVotes = votes.filter((vote) => vote === "Yes").length;
  const noVotes = votes.filter((vote) => vote === "No").length;
  if (yesVotes > noVotes) return "Yes";
  if (noVotes > yesVotes) return "No";
  return "Maybe";
}

function buildQuestion(topic, prompt, promptIndex) {
  const id = `${topic.slug}-${promptIndex + 1}`;
  const conditionSummary = {};
  const agentVotes = {};

  for (const condition of CONDITIONS) {
    const conditionBase =
      topic.baseYesRate +
      (condition === "single_role" ? -0.18 : 0) +
      (condition === "debate_role" ? -0.05 : 0) +
      (condition === "debate_no_role" ? 0.03 : 0);

    const votesForCondition = {};
    for (const agent of AGENTS) {
      const agentShift =
        (agent === "Claude" ? 0.06 : 0) +
        (agent === "ChatGPT" && condition.includes("role") ? -0.12 : 0) +
        (agent === "Grok" ? -0.05 : 0) +
        (agent === "Gemini" ? 0.02 : 0);

      const probability = clamp(0.05, conditionBase + agentShift, 0.9);
      votesForCondition[agent] = answerFromProbability(
        probability,
        `${id}-${condition}-${agent}`
      );
    }

    const votesArray = Object.values(votesForCondition);
    conditionSummary[condition] = {
      outcome: majorityOutcome(votesArray),
      yesVotes: votesArray.filter((vote) => vote === "Yes").length,
      noVotes: votesArray.filter((vote) => vote === "No").length,
    };
    agentVotes[condition] = votesForCondition;
  }

  return {
    id,
    topicSlug: topic.slug,
    prompt,
    tags: [topic.spectrum, topic.title.split(" vs ")[0]],
    conditionSummary,
    agentVotes,
  };
}

function buildConversation(topic, question) {
  const id = `${question.id}-conversation-1`;
  const finalOutcome = question.conditionSummary.debate_role.outcome;
  const roleAssignments = AGENTS.map((agent) => ({
    agent,
    role: ROLE_BY_AGENT[agent],
  }));

  return {
    id,
    topicSlug: topic.slug,
    questionId: question.id,
    runMode: "debate",
    roleMode: "role",
    roleAssignments,
    turns: [
      {
        speaker: "Moderator",
        text: `Opening prompt: ${question.prompt}`,
      },
      {
        speaker: "ChatGPT",
        text: "I challenge the default intuition and want stronger evidence before agreement.",
      },
      {
        speaker: "Claude",
        text: "A constructive framing suggests a pragmatic path that balances outcomes and norms.",
      },
      {
        speaker: "Gemini",
        text: "From a utility view, the larger population effect matters more than edge cases.",
      },
      {
        speaker: "Grok",
        text: "I prioritize rule consistency and clear boundaries unless there is explicit override.",
      },
    ],
    finalConsensus: finalOutcome,
    roundsCompleted: 1 + (hash(question.id) % 3),
  };
}

function buildMetrics(topics, questionsByTopic) {
  const conditionKeyToLabel = {
    single_no_role: "Single, No Role",
    single_role: "Single, Role",
    debate_no_role: "Debate, No Role",
    debate_role: "Debate, Role",
  };

  return topics.map((topic) => {
    const questions = questionsByTopic[topic.slug] ?? [];
    const yesRateByCondition = {};
    for (const condition of CONDITIONS) {
      const yesCount = questions.filter(
        (question) => question.conditionSummary[condition].outcome === "Yes"
      ).length;
      yesRateByCondition[conditionKeyToLabel[condition]] = Number(
        (yesCount / questions.length).toFixed(3)
      );
    }

    const anyMindChangedRate = Number(
      (
        (questions.filter((question) => {
          const initial = question.agentVotes.debate_no_role.ChatGPT;
          const final = question.agentVotes.debate_role.ChatGPT;
          return initial !== final;
        }).length /
          questions.length) *
        100
      ).toFixed(1)
    );

    return {
      topicSlug: topic.slug,
      yesRateByCondition,
      avgDebateRoundsNoRole: Number((0.4 + (hash(topic.slug) % 30) / 100).toFixed(2)),
      avgDebateRoundsRole: Number((1 + (hash(`${topic.slug}-role`) % 100) / 100).toFixed(2)),
      anyMindChangedRate,
    };
  });
}

async function ensureDirs() {
  await fs.mkdir(questionsDir, { recursive: true });
  await fs.mkdir(conversationsDir, { recursive: true });
  await fs.mkdir(metricsDir, { recursive: true });
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function main() {
  await ensureDirs();

  const questionsByTopic = {};
  const conversationsByTopic = {};

  for (const topic of TOPICS) {
    const topicQuestions = topic.prompts.map((prompt, index) =>
      buildQuestion(topic, prompt, index)
    );
    const topicConversations = topicQuestions.map((question) =>
      buildConversation(topic, question)
    );

    questionsByTopic[topic.slug] = topicQuestions;
    conversationsByTopic[topic.slug] = topicConversations;

    await writeJson(path.join(questionsDir, `${topic.slug}.json`), {
      topicSlug: topic.slug,
      items: topicQuestions,
    });
    await writeJson(path.join(conversationsDir, `${topic.slug}.json`), {
      topicSlug: topic.slug,
      items: topicConversations,
    });
  }

  const metrics = buildMetrics(TOPICS, questionsByTopic);
  await writeJson(path.join(metricsDir, "overview.json"), { items: metrics });

  const manifest = {
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    topics: TOPICS.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      spectrum: topic.spectrum,
      definition: topic.definition,
      yesMeans: topic.yesMeans,
      questionCount: topic.prompts.length,
    })),
    paths: {
      questionsByTopic: Object.fromEntries(
        TOPICS.map((topic) => [topic.slug, [`/data/questions/${topic.slug}.json`]])
      ),
      conversationsByTopic: Object.fromEntries(
        TOPICS.map((topic) => [topic.slug, [`/data/conversations/${topic.slug}.json`]])
      ),
      metrics: "/data/metrics/overview.json",
    },
    conditionMeta: CONDITION_META,
    roleMap: ROLE_BY_AGENT,
  };

  await writeJson(path.join(publicDir, "manifest.json"), manifest);
}

main();
