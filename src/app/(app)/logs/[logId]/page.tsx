
'use client';

import React from "react";
import { AIFeedback } from "@/components/logs/ai-feedback";
import { LogForm } from "@/components/logs/log-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase/provider";
import { useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  Loader2, ArrowLeft, Calendar, Clock, Brain, Heart, Meh, Frown, 
  Sparkles, TrendingUp, Award, Edit, Eye, BookOpen, Target
} from "lucide-react";
import { useFirstLogDate } from "@/hooks/use-first-log-date";
import { calculateAttachmentWeek, calculateAttachmentMonth } from "@/lib/date-utils";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { DailyLog } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

const logFormSchema = z.object({
  activitiesRaw: z.string().min(10, {
    message: "Log content must be at least 10 characters.",
  }),
  activitiesProfessional: z.string().optional(),
});

type LogFormValues = z.infer<typeof logFormSchema>;

const getSentimentIcon = (sentiment: string | undefined) => {
  switch (sentiment) {
    case 'Positive': return <Heart className="h-5 w-5 text-green-500" />;
    case 'Negative': return <Frown className="h-5 w-5 text-red-500" />;
    default: return <Meh className="h-5 w-5 text-yellow-500" />;
  }
};

const getSentimentColor = (sentiment: string | undefined) => {
  switch (sentiment) {
    case 'Positive': return 'from-green-500/10 to-green-600/5 border-green-500/20';
    case 'Negative': return 'from-red-500/10 to-red-600/5 border-red-500/20';
    default: return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20';
  }
};

const getSentimentText = (sentiment: string | undefined) => {
  switch (sentiment) {
    case 'Positive': return 'Positive Day';
    case 'Negative': return 'Challenging Day';
    default: return 'Neutral Day';
  }
};

export default function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
    const { logId } = React.use(params);
    const { firestore, user } = useFirebase();
    const { firstLogDate } = useFirstLogDate();
    const { userProfile, isLoading: profileLoading } = useUserProfile();
    
    const logRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}/dailyLogs`, logId);
    }, [firestore, user, logId]);

    const { data: log, isLoading: logLoading } = useDoc<DailyLog>(logRef);

    const form = useForm<LogFormValues>({
        resolver: zodResolver(logFormSchema),
        defaultValues: {
          activitiesRaw: "",
          activitiesProfessional: "",
        },
      });
    
      React.useEffect(() => {
        if (log) {
          form.reset({
            activitiesRaw: log.activitiesRaw || "",
            activitiesProfessional: log.activitiesProfessional || "",
          });
        }
      }, [log, form]);

    if (logLoading || profileLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading your log details...</p>
                </div>
            </div>
        )
    }
    
    if (!log) {
        return (
            <div className="container mx-auto py-8">
                <Card className="text-center py-20 bg-gradient-to-br from-muted/50 to-muted/20">
                    <CardContent className="space-y-6">
                        <div className="p-6 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 w-fit mx-auto">
                            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Log Not Found</h1>
                            <p className="text-muted-foreground">The requested log could not be located.</p>
                        </div>
                        <Link href="/logs">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Logs
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const logDate = log.date.toDate();
    const formattedDate = format(logDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(logDate, 'h:mm a');

  return (
    <FormProvider {...form}>
        <div className="container mx-auto py-8 space-y-8">
            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/logs">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Logs
                        </Button>
                    </Link>
                </div>
                
                <div className="text-center space-y-4 relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${getSentimentColor(log.sentiment)} rounded-3xl -z-10`}></div>
                    <div className="py-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {getSentimentIcon(log.sentiment)}
                            <h1 className="text-4xl font-bold tracking-tight gradient-text">
                                {formattedDate}
                            </h1>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formattedTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {firstLogDate && log.date 
                                        ? `Attachment Week ${calculateAttachmentWeek(log.date.toDate(), firstLogDate)}`
                                        : `Week ${log.weekNumber}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="card-hover group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getSentimentColor(log.sentiment)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mood</CardTitle>
                        <div className="p-2 rounded-full bg-muted/20 group-hover:bg-muted/30 transition-all duration-300">
                            {getSentimentIcon(log.sentiment)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold mb-1">{getSentimentText(log.sentiment)}</div>
                        <p className="text-xs text-muted-foreground">Overall feeling</p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Skills</CardTitle>
                        <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                            <Brain className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-1">{log.skills?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Skills identified</p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Week</CardTitle>
                        <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300">
                            <Target className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {firstLogDate && log.date 
                                ? calculateAttachmentWeek(log.date.toDate(), firstLogDate)
                                : log.weekNumber
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Attachment week</p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
                            <Award className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-green-600 mb-1">Complete</div>
                        <p className="text-xs text-muted-foreground">Log status</p>
                    </CardContent>
                </Card>
            </div>

            {/* Skills Section */}
            {log.skills && log.skills.length > 0 && (
                <Card className="card-hover">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-chart-4 animate-pulse"></div>
                            Skills Identified
                        </CardTitle>
                        <CardDescription>
                            Skills and technologies you worked with on this day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {log.skills.map((skill, index) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Log Content
                            </CardTitle>
                            <CardDescription>
                                Review and edit your daily activities and reflections
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LogForm log={log} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                AI Feedback
                            </CardTitle>
                            <CardDescription>
                                Personalized insights and suggestions for your growth
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AIFeedback log={log} studentGoals={userProfile?.goals || "No goals set."} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </FormProvider>
  );
}
