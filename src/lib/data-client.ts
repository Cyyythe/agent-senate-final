import {
  type DataManifest,
  type MetricsChunk,
  type TopicConversationsChunk,
  type TopicQuestionsChunk,
} from "@/lib/types";

const responseCache = new Map<string, Promise<unknown>>();

async function fetchJson<T>(path: string): Promise<T> {
  if (!responseCache.has(path)) {
    responseCache.set(
      path,
      fetch(path, { cache: "force-cache" }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to fetch ${path}: ${response.status}`);
        }
        return response.json();
      })
    );
  }
  return responseCache.get(path) as Promise<T>;
}

export async function getManifest(): Promise<DataManifest> {
  return fetchJson<DataManifest>("/data/manifest.json");
}

export async function getTopicQuestions(topicSlug: string) {
  const manifest = await getManifest();
  const paths = manifest.paths.questionsByTopic[topicSlug] ?? [];
  const chunks = await Promise.all(
    paths.map((chunkPath) => fetchJson<TopicQuestionsChunk>(chunkPath))
  );
  return chunks.flatMap((chunk) => chunk.items);
}

export async function getTopicConversations(topicSlug: string) {
  const manifest = await getManifest();
  const paths = manifest.paths.conversationsByTopic[topicSlug] ?? [];
  const chunks = await Promise.all(
    paths.map((chunkPath) => fetchJson<TopicConversationsChunk>(chunkPath))
  );
  return chunks.flatMap((chunk) => chunk.items);
}

export async function getAllQuestions() {
  const manifest = await getManifest();
  const questions = await Promise.all(
    manifest.topics.map((topic) => getTopicQuestions(topic.slug))
  );
  return questions.flat();
}

export async function getOverviewMetrics() {
  const manifest = await getManifest();
  const chunk = await fetchJson<MetricsChunk>(manifest.paths.metrics);
  return chunk.items;
}
