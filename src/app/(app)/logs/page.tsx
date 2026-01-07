import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const logs = [
    { id: '1', date: '2024-07-22', snippet: 'Initial project setup and configuration...', feedback: 'Provided' },
    { id: '2', date: '2024-07-21', snippet: 'Met with supervisor to discuss project goals...', feedback: 'Pending' },
    { id: '3', date: '2024-07-20', snippet: 'Researched Next.js App Router features...', feedback: 'Provided' },
    { id: '4', date: '2024-07-19', snippet: 'Drafted initial Firestore security rules...', feedback: 'Pending' },
]


export default function LogsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily Logs</h1>
                    <p className="text-muted-foreground">Manage and review your attachment logs.</p>
                </div>
                <Link href="/logs/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Log
                    </Button>
                </Link>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead>Log Snippet</TableHead>
                        <TableHead className="w-[150px]">AI Feedback</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.date}</TableCell>
                            <TableCell className="text-muted-foreground">{log.snippet}</TableCell>
                            <TableCell>{log.feedback}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/logs/${log.id}`} passHref>
                                    <Button variant="outline" size="sm">View</Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
