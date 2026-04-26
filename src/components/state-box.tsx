import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StateBox({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Card className="stage-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-[var(--muted-foreground)]">{message}</CardContent>
    </Card>
  );
}
