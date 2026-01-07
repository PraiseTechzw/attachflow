import { LogForm } from "@/components/logs/log-form";

export default function NewLogPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Daily Log</h1>
        <p className="text-muted-foreground">
          Record your activities, challenges, and achievements for today.
        </p>
      </div>
      <LogForm />
    </div>
  );
}
