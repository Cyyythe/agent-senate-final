import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto mt-10 w-full max-w-xl">
      <CardHeader>
        <CardTitle>Route Not Found</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          The page you requested is not part of this demo route map yet.
        </p>
        <Button asChild className="w-fit">
          <Link href="/">Return to Main Page</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
