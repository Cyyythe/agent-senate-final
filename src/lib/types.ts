export type AgentName = "ChatGPT" | "Claude" | "Gemini" | "Grok";
export type RunMode = "single" | "debate";
export type RoleMode = "role" | "no-role";
export type AnswerValue = "Yes" | "No" | "Maybe";

export type ConditionKey =
  | "single_no_role"
  | "single_role"
  | "debate_no_role"
  | "debate_role";

export interface TopicDescriptor {
  slug: string;
  title: string;
  spectrum: string;
  definition: string;
  yesMeans: string;
  questionCount: number;
}

export interface ConditionSummary {
  outcome: AnswerValue;
  yesVotes: number;
  noVotes: number;
}

export interface QuestionItem {
  id: string;
  topicSlug: string;
  prompt: string;
  tags: string[];
  conditionSummary: Record<ConditionKey, ConditionSummary>;
  agentVotes: Record<ConditionKey, Record<AgentName, AnswerValue>>;
}

export interface TopicQuestionsChunk {
  topicSlug: string;
  items: QuestionItem[];
}

export interface ConversationRoleAssignment {
  agent: AgentName;
  role: string;
}

export interface ConversationTurn {
  speaker: string;
  text: string;
}

export interface ConversationItem {
  id: string;
  topicSlug: string;
  questionId: string;
  runMode: RunMode;
  roleMode: RoleMode;
  roleAssignments: ConversationRoleAssignment[];
  turns: ConversationTurn[];
  finalConsensus: AnswerValue;
  roundsCompleted: number;
}

export interface TopicConversationsChunk {
  topicSlug: string;
  items: ConversationItem[];
}

export interface TopicMetric {
  topicSlug: string;
  yesRateByCondition: Record<
    "Single, No Role" | "Single, Role" | "Debate, No Role" | "Debate, Role",
    number
  >;
  avgDebateRoundsNoRole: number;
  avgDebateRoundsRole: number;
  anyMindChangedRate: number;
}

export interface MetricsChunk {
  items: TopicMetric[];
}

export interface DataManifest {
  version: string;
  generatedAt: string;
  topics: TopicDescriptor[];
  paths: {
    questionsByTopic: Record<string, string[]>;
    conversationsByTopic: Record<string, string[]>;
    metrics: string;
  };
  conditionMeta: Record<ConditionKey, { runMode: RunMode; roleMode: RoleMode }>;
  roleMap: Record<AgentName, string>;
}

export interface FilterState {
  runMode: "all" | RunMode;
  roleMode: "all" | RoleMode;
  topicSlug: "all" | string;
  spectrum: "all" | string;
  agent: "all" | AgentName;
  role: "all" | string;
}

export interface FeedbackEntry {
  id: string;
  createdAt: string;
  pagePath: string;
  topicSlug: string | null;
  perceptionGap: number;
  clarity: number;
  chartUsefulness: number;
  comment: string;
}
