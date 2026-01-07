'use client';
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFirebase } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { DailyLog } from "@/types";

export default function LogsPage() {
    const { firestore, user } = useFirebase();

    const logsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/dailyLogs`), orderBy('date', 'desc'));
    }, [firestore, user]);

    const { data: logs, isLoading } = useCollection<DailyLog>(logsQuery);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : logs && logs.length > 0 ? (
                            logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                                <TableCell className="text-muted-foreground truncate max-w-sm">{log.content.substring(0, 100)}...</TableCell>
                                <TableCell>{log.feedback ? 'Provided' : 'Pending'}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/logs/${log.id}`} passHref>
                                        <Button variant="outline" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
