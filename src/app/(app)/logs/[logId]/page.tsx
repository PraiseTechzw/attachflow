import { AIFeedback } from "@/components/logs/ai-feedback";
import { LogForm } from "@/components/logs/log-form";

// This is mock data. In a real app, you would fetch this based on the logId.
const mockLog = {
    id: '1',
    userId: 'user123',
    date: new Date(),
    content: `Today, I focused on setting up the initial project structure for the Attachment Management System. I initialized a new Next.js project with the App Router and TypeScript. I also integrated Tailwind CSS and Shadcn/UI for styling.

I spent a good amount of time drafting the Firestore security rules to ensure data ownership, which was a key requirement. For example, I made sure that a user can only read/write their own logs using 'request.auth.uid == resource.data.userId'.

The next step is to set up Firebase Authentication and create the login/signup pages.`,
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
}

const studentGoals = "My goals are to improve my full-stack development skills, specifically with Next.js and Firebase. I also want to learn how to model data effectively for NoSQL databases and implement robust security rules.";

export default function LogDetailPage({ params }: { params: { logId: string } }) {
    const logDate = new Date(mockLog.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Log for {logDate}</h1>
        <p className="text-muted-foreground">
          Review and edit your log, and see AI-powered feedback.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <LogForm log={mockLog as any}/>
        </div>
        <div className="lg:col-span-1">
            <AIFeedback logText={mockLog.content} studentGoals={studentGoals} />
        </div>
      </div>
    </div>
  );
}
