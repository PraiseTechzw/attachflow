
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import type { Project, MonthlyReport, DailyLog, FinalReportAIStructure } from '@/types';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { generateFinalReportDoc } from '@/lib/docx-generator';
import { generateFinalReport } from '@/ai/flows/generate-final-report-flow';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useMemoFirebase } from "@/firebase";
import { 
  FileDown, Loader2, Calendar, Eye, FileSignature, Sparkles, 
  TrendingUp, BarChart3, Clock, CheckCircle, AlertCircle, 
  FileText, Star, Zap, Award, Target, BookOpen, PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { eachMonthOfInterval, format, startOfToday, sub, isThisMonth, isPast } from 'date-fns';

// Utility function to safely format dates from Firestore
const safeFormatDate = (date: any, formatString: string = 'PPP'): string => {
  try {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return format(date.toDate(), formatString);
    }
    
    // Handle regular Date object or date string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'N/A';
  }
};

export default function ReportsPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  const [isDocxLoading, setIsDocxLoading] = useState(false);

  // Generate the last 12 months for the report timeline
  const monthIds = useMemo(() => {
    const today = startOfToday();
    const lastYear = sub(today, { years: 1 });
    return eachMonthOfInterval({ start: lastYear, end: today })
           .map(d => format(d, 'yyyy-MM'))
           .reverse();
  }, []);

  const reportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/monthlyReports`), orderBy('id', 'desc'));
  }, [firestore, user]);

  const { data: monthlyReports, isLoading: isReportsLoading } = useCollection<MonthlyReport>(reportsQuery);
  
  const reportsMap = useMemo(() => {
    return new Map(monthlyReports?.map(report => [report.id, report]));
  }, [monthlyReports]);

  // Calculate statistics
  const reportStats = useMemo(() => {
    if (!monthlyReports) return { total: 0, finalized: 0, drafts: 0, completionRate: 0 };
    
    const total = monthlyReports.length;
    const finalized = monthlyReports.filter(r => r.status === 'Finalized').length;
    const drafts = monthlyReports.filter(r => r.status === 'Draft').length;
    const completionRate = total > 0 ? Math.round((finalized / total) * 100) : 0;
    
    return { total, finalized, drafts, completionRate };
  }, [monthlyReports]);

  const handleDownloadFinalReport = async () => {
    if (!user || !userProfile) {
        toast({ 
          variant: 'destructive', 
          title: 'Authentication Required', 
          description: 'Please ensure you are logged in before generating the final report.' 
        });
        return;
    }
    setIsDocxLoading(true);
    try {
        const projectsQuery = query(collection(firestore, `users/${user.uid}/projects`));
        const logsQuery = query(collection(firestore, `users/${user.uid}/dailyLogs`), orderBy('date', 'asc'));

        const [projectSnapshot, logSnapshot] = await Promise.all([getDocs(projectsQuery), getDocs(logsQuery)]);

        // For simplicity, we'll use the first project found.
        const project = projectSnapshot.docs[0]?.data() as Project | undefined;
        const logs = logSnapshot.docs.map(doc => doc.data() as DailyLog);

        if (!project) {
            toast({ 
              title: 'No Project Found', 
              description: 'Please create a project before generating your final report.',
              variant: 'destructive'
            });
            setIsDocxLoading(false);
            return;
        }

        toast({ 
          title: "AI is analyzing your data... 🤖", 
          description: "This might take a moment while we structure your comprehensive report." 
        });

        // Map logs to the simplified schema expected by the AI flow
        const mappedLogs = logs.map(log => ({
          content: log.content ?? log.activitiesRaw ?? '',
          date: log.date
        }));

        const aiGeneratedContent = await generateFinalReport({
            project: {
                title: project.title,
                description: project.description,
            },
            logs: mappedLogs,
            studentName: userProfile.displayName || 'Student',
        });
        
        toast({ title: "Generating professional Word document... 📄" });

        const doc = generateFinalReportDoc(
            project,
            userProfile.displayName || 'Student',
            aiGeneratedContent as FinalReportAIStructure
        );

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "Final_Attachment_Report.docx");

        toast({
          title: "Final Report Generated Successfully! 🎉",
          description: "Your comprehensive attachment report has been downloaded."
        });

    } catch (error) {
        console.error("Failed to generate DOCX report:", error);
        toast({ 
          variant: 'destructive', 
          title: 'Report Generation Failed',
          description: 'There was an error generating your final report. Please try again.' 
        });
    } finally {
        setIsDocxLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5 rounded-3xl -z-10"></div>
        <div className="py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight gradient-text">
              Reports Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track your progress, generate monthly reports, and create your comprehensive final attachment summary.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
              <FileText className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{reportStats.total}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Monthly reports created
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalized</CardTitle>
            <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{reportStats.finalized}</div>
            <p className="text-xs text-muted-foreground">
              Completed and locked reports
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <div className="p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-all duration-300">
              <Clock className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-1">{reportStats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              Reports in progress
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300">
              <Target className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">{reportStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Reports finalized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Final Report Generation Card */}
      <Card className="card-hover bg-gradient-to-br from-primary/10 via-primary/5 to-chart-4/10 border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-4/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-primary">AI-Powered Final Report</CardTitle>
              <CardDescription className="text-base">
                Generate a comprehensive Word document summarizing your entire attachment experience
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AI-Generated
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileDown className="h-3 w-3" />
                  Word Format
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Professional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically structures all your logs and projects into a comprehensive final report
              </p>
            </div>
            <Button 
              onClick={handleDownloadFinalReport} 
              disabled={isDocxLoading}
              size="lg"
              className="font-semibold bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 transition-all duration-300 hover:scale-[1.02]"
            >
              {isDocxLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-5 w-5" />
                  Generate Final Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Monthly Reports Timeline</h2>
            <p className="text-muted-foreground">
              Track your monthly progress and generate professional reports
            </p>
          </div>
        </div>

        {isReportsLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your reports timeline...</p>
          </div>
        )}

        {!isReportsLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {monthIds.map((monthId, index) => {
              const report = reportsMap.get(monthId);
              const monthDate = new Date(`${monthId}-02`); // Use day 2 to avoid timezone issues
              const monthName = format(monthDate, 'MMMM yyyy');
              const isCurrentMonth = isThisMonth(monthDate);
              const isPastMonth = isPast(monthDate) && !isCurrentMonth;

              return (
                <Card 
                  key={monthId} 
                  className={`card-hover flex flex-col relative overflow-hidden ${
                    isCurrentMonth ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isCurrentMonth && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">Current</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        report?.status === 'Finalized' ? 'bg-green-500/10' :
                        report?.status === 'Draft' ? 'bg-orange-500/10' :
                        'bg-gray-500/10'
                      }`}>
                        {report?.status === 'Finalized' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : report?.status === 'Draft' ? (
                          <Clock className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{monthName}</CardTitle>
                        {report ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={report.status === 'Finalized' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {report.status}
                            </Badge>
                          </div>
                        ) : (
                          <CardDescription className="text-sm">
                            {isPastMonth ? 'Not generated yet' : 'Ready to generate'}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {report ? (
                    <CardContent className="flex-grow space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Log Entries</p>
                          <p className="text-2xl font-bold text-primary">{report.logCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="text-sm font-medium">
                            {safeFormatDate(report.lastUpdated, 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="flex-grow flex items-center justify-center py-8">
                      <div className="text-center space-y-2">
                        <div className="p-3 rounded-full bg-muted/20 w-fit mx-auto">
                          <PlusCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isPastMonth ? 'Generate report for this month' : 'Start logging to generate'}
                        </p>
                      </div>
                    </CardContent>
                  )}
                  
                  <CardFooter className="pt-0">
                    {report ? (
                      <Link href={`/reports/${monthId}`} className="w-full">
                        <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors duration-200">
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/reports/generate/${monthId}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90">
                          <FileSignature className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!isReportsLoading && monthIds.length === 0 && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-4/5 opacity-50"></div>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="p-8 rounded-full bg-gradient-to-br from-primary/10 to-chart-4/10 w-fit mx-auto">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Start Your Reporting Journey! 📊</h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Begin logging your daily activities to automatically generate monthly reports and track your attachment progress.
                </p>
              </div>
              <Link href="/logs/new">
                <Button size="lg" className="font-semibold">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Your First Log
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
