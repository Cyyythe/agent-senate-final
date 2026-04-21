import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type TopicDescriptor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TopicCard({ topic }: { topic: TopicDescriptor }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent">{topic.spectrum}</Badge>
          <Badge variant="subtle">{topic.questionCount} prompts</Badge>
        </div>
        <CardTitle>{topic.title}</CardTitle>
        <CardDescription>{topic.definition}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          <span className="font-semibold">Yes means:</span> {topic.yesMeans}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/topics/${topic.slug}`}>
            Explore Topic <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
