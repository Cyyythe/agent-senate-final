import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type TopicMetric } from "@/lib/types";

const CONDITIONS = [
  "Single, No Role",
  "Single, Role",
  "Debate, No Role",
  "Debate, Role",
] as const;

function heatColor(rate: number) {
  const clamped = Math.max(0, Math.min(rate, 1));
  const lightness = 92 - clamped * 38;
  return `hsl(38 60% ${lightness}%)`;
}

export function TopicHeatmap({ metrics }: { metrics: TopicMetric[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Topic Heatmap: Percent Yes by Condition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-semibold">Topic</th>
                {CONDITIONS.map((condition) => (
                  <th key={condition} className="px-2 py-1 text-center font-semibold">
                    {condition.replace("Debate", "Group")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.topicSlug}>
                  <td className="rounded bg-[var(--card-muted)] px-2 py-1 capitalize">
                    {metric.topicSlug.replaceAll("-", " ")}
                  </td>
                  {CONDITIONS.map((condition) => {
                    const rate = metric.yesRateByCondition[condition];
                    return (
                      <td
                        key={condition}
                        className="rounded px-2 py-1 text-center font-medium"
                        style={{ backgroundColor: heatColor(rate) }}
                      >
                        {(rate * 100).toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
