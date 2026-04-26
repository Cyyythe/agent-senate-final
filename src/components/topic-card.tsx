import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type TopicDescriptor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TopicCard({
  topic,
  order,
  total,
}: {
  topic: TopicDescriptor;
  order?: number;
  total?: number;
}) {
  return (
    <Card className="topic-card h-full transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--bronze)] hover:shadow-[0_12px_30px_rgba(58,35,18,.13)]">
      <div
        className={cn(
          "relative z-10 grid h-full gap-4 p-5 pt-6",
          order && "md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        )}
      >
        <div className="flex min-w-0 gap-4">
          {order ? (
            <div className="roman-index flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-[var(--line)] leading-none">
              <span className="font-serif text-lg font-semibold">
                {String(order).padStart(2, "0")}
              </span>
              {total ? (
                <span className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  of {total}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="min-w-0">
            <CardHeader className="p-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{topic.spectrum}</Badge>
                <Badge variant="subtle">{topic.questionCount} prompts</Badge>
              </div>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent className="mt-3 grid gap-2 p-0 text-sm">
              <p className="text-[var(--muted-foreground)]">{topic.definition}</p>
              <p>
                <span className="font-semibold">Yes means:</span> {topic.yesMeans}
              </p>
            </CardContent>
          </div>
        </div>
        <CardFooter className={cn("p-0", order && "md:justify-end")}>
          <Button asChild className={cn("w-full", order && "md:w-auto")}>
            <Link href={`/topics/${topic.slug}`}>
              Start <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
