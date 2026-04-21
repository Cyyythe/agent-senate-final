import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="grid gap-5">
      <section className="senate-panel p-6">
        <h1 className="text-3xl">About This Application</h1>
        <p className="mt-2 max-w-4xl text-[var(--muted-foreground)]">
          Senate Insight is a Milestone 3 proof-of-concept focused on making model-comparison
          research legible: questions first, visual evidence second, and user interpretation built
          into the workflow.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>What this demo solves</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Structured way to communicate LLM behavior across roles, single vs debate conditions,
            and domain-specific tradeoff topics.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What is intentionally mocked</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Persistence, authentication, production API routes, and final chart semantics are
            placeholders in this initial skeleton.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What is ready to scale</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Route structure, filter system, reusable chart components, and manifest/chunk data
            loading for large local JSON packages.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
