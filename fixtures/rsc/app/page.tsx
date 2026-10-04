// No "use client": a server page, which is what a new App Router page is by default.
import { Card, Dialog } from "@usefragments/ui";

// Rendered on request, so a compound that fails reports a 500 instead of stopping the build.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <Card>
        <Card.Header>
          <Card.Title>Plan</Card.Title>
        </Card.Header>
      </Card>
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
      </Dialog>
    </main>
  );
}
