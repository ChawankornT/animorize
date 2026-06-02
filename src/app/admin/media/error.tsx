"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function MediaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-sm space-y-4 p-6 text-center">
        <Card.Title>Failed to load media</Card.Title>
        <Card.Body>{error.message || "An unexpected error occurred."}</Card.Body>
        <Card.Actions className="justify-center">
          <Button variant="secondary" size="sm" onClick={reset}>
            Try again
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
