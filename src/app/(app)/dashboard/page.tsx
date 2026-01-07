'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Book, FolderKanban, Loader2, Info, Cloud, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ComposedChart, Line } from "recharts"
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirebase } from "@/firebase/provider";
import { useMemo, useState, useEffect } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { subMonths, format, differenceInHours } from 'date-fns';
import type { DailyLog, Project, Skill } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const chartConfig = {
  logs: {
    label: "Logs",
    color: "hsl(var(--primary))",
  },
  sentiment: {
    label: "Sentiment",
    color: "hsl(var(--accent-foreground))",
  }
}

const sentimentToScore = {
  'Positive': 1,
  'Neutral': 0,
  'Negative': -1,
}

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  const [showInactivityReminder, setShowInactivityReminder] = useState(false);
  const [showBurnoutWarning, setShowBurnoutWarning] = useState(false);

  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'dailyLogs'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const projectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'projects');
  }, [firestore, user]);
  
  const skillsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'skills'), orderBy('frequency', 'desc'));
  }, [firestore, user]);

  const { data: logs, isLoading: logsLoading } = useCollection<DailyLog>(logsQuery);
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: skills, isLoading: skillsLoading } = useCollection<Skill>(skillsQuery);

  useEffect(() => {
    if (logs) {
      if (logs.length > 0) {
        const lastLogDate = logs[0].date?.toDate();
        if (lastLogDate) {
          const hoursSinceLastLog = differenceInHours(new Date(), lastLogDate);
          setShowInactivityReminder(hoursSinceLastLog > 48);
        }

        // Burnout detection
        if (logs.length >= 3) {
            const recentSentiments = logs.slice(0, 3).map(log => log.sentiment);
            if(recentSentiments.every(s => s === 'Negative')) {
                setShowBurnoutWarning(true);
            }
        }

      } else {
        // If there are no logs at all, show the reminder.
        setShowInactivityReminder(true);
      }
    }
  }, [logs]);

  const chartData = useMemo(() => {
    if (!logs) return [];
    
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
    
    const monthlyData = months.map(monthDate => {
      const monthKey = format(monthDate, 'yyyy-MM');
      return {
        month: format(monthDate, 'MMMM'),
        logs: 0,
        sentimentScore: 0,
        sentimentCount: 0,
        monthKey: monthKey,
      };
    });

    logs.forEach(log => {
      if (log.date && log.date.toDate) {
        const logDate = log.date.toDate();
        const monthKey = format(logDate, 'yyyy-MM');
        const monthData = monthlyData.find(m => m.monthKey === monthKey);
        if (monthData) {
          monthData.logs += 1;
          if (log.sentiment && sentimentToScore[log.sentiment] !== undefined) {
            monthData.sentimentScore += sentimentToScore[log.sentiment];
            monthData.sentimentCount += 1;
          }
        }
      }
    });

    return monthlyData.map(({ month, logs, sentimentScore, sentimentCount }) => ({ 
        month, 
        logs,
        sentiment: sentimentCount > 0 ? parseFloat((sentimentScore / sentimentCount).toFixed(2)) : 0
    }));

  }, [logs]);


  const totalLogs = logs?.length ?? 0;
  const totalProjects = projects?.length ?? 0;
  const pendingProjects = projects?.filter(p => p.status === 'Pending').length ?? 0;

  const isLoading = logsLoading || projectsLoading || skillsLoading;

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  const getFontSize = (frequency: number, maxFrequency: number) => {
    if (maxFrequency <= 1) return '1.2rem';
    const minFontSize = 0.8; // rem
    const maxFontSize = 2.5; // rem
    const scale = (maxFontSize - minFontSize) / (maxFrequency - 1);
    return `${minFontSize + ((frequency - 1) * scale)}rem`;
  }

  const maxSkillFrequency = skills && skills.length > 0 ? Math.max(...skills.map(s => s.frequency)) : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome back! Here&apos;s a beautiful overview of your attachment progress and achievements.
        </p>
      </div>

      {showBurnoutWarning && (
         <Alert variant="destructive" className="backdrop-blur-sm bg-destructive/10 border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feeling Overwhelmed?</AlertTitle>
            <AlertDescription>
                Your recent logs suggest you might be facing some challenges. Remember to document solutions and learnings, and don&apos;t hesitate to ask your supervisor for help.
            </AlertDescription>
        </Alert>
      )}

      {showInactivityReminder && !showBurnoutWarning && (
        <Alert className="backdrop-blur-sm bg-primary/10 border-primary/50">
            <Info className="h-4 w-4" />
          <AlertTitle>Friendly Reminder</AlertTitle>
          <AlertDescription>
            Don&apos;t forget to log your activities! Consistent logs make reports much easier to write.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalLogs}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep up the great work!</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Submitted</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingProjects > 0 ? `${pendingProjects} pending approval` : 'All projects approved!'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover group bg-gradient-to-br from-primary/5 to-chart-4/5 border-primary/20">
            <Link href="/logs/new" className="w-full h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center space-y-3">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                      <PlusCircle className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Add New Log</h3>
                      <p className="text-sm text-muted-foreground">Record your activities for today</p>
                    </div>
                </CardContent>
            </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
            <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  Log Activity & Sentiment
                </CardTitle>
                <CardDescription>Your log count and average sentiment over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ComposedChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        yAxisId="left"
                        dataKey="logs"
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        allowDecimals={false}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        dataKey="sentiment"
                        type="number"
                        domain={[-1, 1]}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar yAxisId="left" dataKey="logs" fill="var(--color-logs)" radius={6} />
                    <Line yAxisId="right" dataKey="sentiment" type="monotone" stroke="var(--color-sentiment)" strokeWidth={3} dot={{ fill: "var(--color-sentiment)", strokeWidth: 2, r: 4 }}/>
                </ComposedChart>
            </ChartContainer>
            </CardContent>
        </Card>
        
        <Card className="card-hover">
            <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-4 animate-pulse"></div>
                  Skills Word Cloud
                </CardTitle>
                <CardDescription>Skills identified from your logs with frequency visualization</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-center gap-4 min-h-[280px] p-6">
              {skills && skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span 
                    key={skill.id}
                    className="text-foreground/80 hover:text-primary transition-all duration-300 cursor-default hover:scale-110 px-2 py-1 rounded-md hover:bg-primary/10"
                    style={{ 
                      fontSize: getFontSize(skill.frequency, maxSkillFrequency), 
                      fontWeight: 500,
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <div className="text-center text-muted-foreground space-y-4">
                  <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto">
                    <Cloud className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-medium">No skills logged yet</p>
                    <p className="text-sm">Start adding daily logs to see your skills grow!</p>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
