import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLLECTION_FIELDS = [
  "pagePath",
  "topicSlug (optional)",
  "perceptionGap (Likert 1-5)",
  "clarity (Likert 1-5)",
  "chartUsefulness (Likert 1-5)",
  "free-text comment",
  "createdAt timestamp",
];

export default function MethodologyPage() {
  return (
    <div className="grid gap-5">
      <section className="senate-panel p-6">
        <h1 className="text-3xl">Methodology & Study Design</h1>
        <p className="mt-2 max-w-4xl text-[var(--muted-foreground)]">
          The app is structured around tradeoff-oriented question families. Users move from a topic
          narrative to condition-level evidence and then broader visual summaries, matching the
          milestone goal of exploring toward a research answer.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Core Study Conditions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>Single, No Role</p>
            <p>Single, Role</p>
            <p>Debate, No Role</p>
            <p>Debate, Role</p>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Filters also support spectrum topic, AI agent, and role-focused exploration.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Packaging Strategy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>Manifest-driven static chunk loading (`/public/data`).</p>
            <p>Per-topic JSON files for questions and conversations.</p>
            <p>Separate metrics chunk for chart views.</p>
            <p className="text-[var(--muted-foreground)]">
              This structure is designed for large packaged JSON while keeping frontend routes
              unchanged if you later migrate to API endpoints.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Collection (Demo Mode)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              Feedback is non-invasive through a persistent dock button. Entries are local-only in
              this demo and exportable to JSON for manual analysis.
            </p>
            <p className="font-semibold">Fields collected:</p>
            <ul className="list-disc space-y-1 pl-5">
              {COLLECTION_FIELDS.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story-Driven User Flow</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              Home -&gt; Topic Entry -&gt; Blind Sample -&gt; Debate -&gt; Visual
              Summary.
            </p>
            <p>
              Each step broadens scope from individual prompts to aggregate patterns, helping users
              evaluate the core research question rather than just viewing charts in isolation.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
