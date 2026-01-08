'use client';
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useFirebase } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { DailyLog } from "@/types";
import { useMemo } from "react";
import { format } from "date-fns";

type GroupedLogs = {
    [week: string]: DailyLog[];
}

export default function LogsPage() {
    const { firestore, user } = useFirebase();

    const logsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/dailyLogs`), orderBy('date', 'desc'));
    }, [firestore, user]);

    const { data: logs, isLoading } = useCollection<DailyLog>(logsQuery);

    const groupedLogs = useMemo(() => {
        if (!logs) return {};
        return logs.reduce((acc: GroupedLogs, log) => {
            const weekKey = `Week ${log.weekNumber}`;
            if (!acc[weekKey]) {
                acc[weekKey] = [];
            }
            acc[weekKey].push(log);
            return acc;
        }, {});
    }, [logs]);

    const sortedWeeks = useMemo(() => {
        return Object.keys(groupedLogs).sort((a, b) => {
            const weekA = parseInt(a.replace('Week ', ''));
            const weekB = parseInt(b.replace('Week ', ''));
            return weekB - weekA;
        });
    }, [groupedLogs]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'EEEE, MMMM d, yyyy');
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily Logs</h1>
                    <p className="text-muted-foreground">Review your progress week by week.</p>
                </div>
                <Link href="/logs/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Log
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                 <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : logs && logs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue={sortedWeeks.length > 0 ? sortedWeeks[0] : undefined}>
                    {sortedWeeks.map(week => (
                        <AccordionItem value={week} key={week}>
                            <AccordionTrigger className="text-lg font-semibold">{week}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    {groupedLogs[week].map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                                            <div>
                                                <p className="font-medium">{formatDate(log.date)}</p>
                                                <p className="text-sm text-muted-foreground truncate max-w-lg">{typeof log.activitiesRaw === 'string' ? log.activitiesRaw.substring(0,120) : ''}{typeof log.activitiesRaw === 'string' && log.activitiesRaw.length > 120 ? '...' : ''}</p>
                                            </div>
                                            <Link href={`/logs/${log.id}`} passHref>
                                                <Button variant="outline">View Details</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-20 border rounded-lg">
                    <h2 className="text-xl font-semibold">No logs found.</h2>
                    <p className="text-muted-foreground mt-2">Start by creating your first daily log entry.</p>
                </div>
            )}
        </div>
    );
}
