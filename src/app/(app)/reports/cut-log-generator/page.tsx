
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { DailyLog } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { 
  Loader2, CalendarIcon, FileText, Download, Eye, Sparkles, 
  Clock, User, Building, Hash, Calendar as CalendarDays,
  CheckCircle, AlertCircle, Info, Zap, TrendingUp, BarChart3,
  FileCheck, Printer, Share, Star
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { eachDayOfInterval, format, startOfMonth } from "date-fns"
import { isNonWorkDay } from '@/lib/holidays';
import dynamic from 'next/dynamic';

const ModernPDFGenerator = dynamic(() => import('@/components/reports/ModernPDFGenerator'), {
  ssr: false,
});

export default function CutLogGeneratorPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [logsForPdf, setLogsForPdf] = useState<DailyLog[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Calculate statistics for the selected date range, considering work days only
  const dateRangeStats = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    
    const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const workDays = allDays.filter(day => !isNonWorkDay(day));
    
    const totalWorkableDays = workDays.length;
    const logCount = logsForPdf?.length || 0;
    const completionRate = totalWorkableDays > 0 ? (logCount / totalWorkableDays) * 100 : 0;
    
    return {
      totalDays: allDays.length,
      totalWorkableDays,
      logCount,
      completionRate: Math.round(completionRate),
      missingDays: totalWorkableDays - logCount,
      dateRangeText: `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
    };
  }, [dateRange, logsForPdf]);

  const handleGenerate = async () => {
    if (!user || !userProfile) {
      toast({ 
        variant: 'destructive', 
        title: 'Profile Loading', 
        description: 'Please wait for your profile to load before generating the report.' 
      });
      return;
    }
    if (!dateRange || !dateRange.from || !dateRange.to) {
        toast({ 
          variant: 'destructive', 
          title: 'Date Range Required', 
          description: 'Please select a valid date range for your log sheet.' 
        });
        return;
    }

    setIsLoading(true);
    setLogsForPdf(null);
    setLoadingProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const logsQuery = query(
        collection(firestore, `users/${user.uid}/dailyLogs`),
        where('date', '>=', dateRange.from),
        where('date', '<=', dateRange.to),
        orderBy('date', 'asc')
      );
      
      const logSnapshot = await getDocs(logsQuery);
      const fetchedLogs = logSnapshot.docs.map(doc => doc.data() as DailyLog);

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (fetchedLogs.length === 0) {
        toast({ 
          title: 'No Logs Found', 
          description: 'There are no logs in the selected date range. Try selecting a different period.',
          variant: 'destructive'
        });
        setIsLoading(false);
        setLoadingProgress(0);
        return;
      }
      
      toast({ 
        title: "Logs Loaded Successfully! 🎉", 
        description: `Found ${fetchedLogs.length} log entries. Your CUT log sheet is ready for generation.` 
      });
      setLogsForPdf(fetchedLogs);

    } catch (error: any) {
      console.error("Failed to load logs:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to Load Logs',
        description: error.message || 'There was an error loading your logs. This could be due to a missing index. Please check the Firestore console.' 
      });
      setLoadingProgress(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Callback to reset loading state
  const onPdfRendered = () => {
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5 rounded-3xl -z-10"></div>
        <div className="py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight gradient-text">
              CUT Log Sheet Generator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Generate professional Chinhoyi University of Technology log sheets with beautiful formatting and comprehensive data visualization.
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <Card className="card-hover bg-gradient-to-r from-primary/5 to-chart-4/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{userProfile.displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Hash className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-semibold">{userProfile.regNumber || 'Not Set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-semibold">{userProfile.companyName || 'Not Set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Selection Card */}
      <Card className="card-hover">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary to-chart-4 animate-pulse"></div>
            Select Date Range
          </CardTitle>
          <CardDescription className="text-base">
            Choose the period for which you want to generate your official CUT log sheet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full lg:w-[350px] justify-start text-left font-normal h-12 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]"
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="font-medium">
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </span>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="text-muted-foreground">Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 calendar-popover backdrop-blur-sm bg-background/95 border-border/50 shadow-xl" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>

              {/* Date Range Statistics */}
              {dateRangeStats && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {dateRangeStats.totalWorkableDays} work days
                  </Badge>
                  {logsForPdf && (
                    <>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {dateRangeStats.logCount} logs
                      </Badge>
                      <Badge 
                        variant={dateRangeStats.completionRate >= 80 ? "default" : dateRangeStats.completionRate >= 50 ? "secondary" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {dateRangeStats.completionRate}% complete
                      </Badge>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || isProfileLoading}
                size="lg"
                className="min-w-[200px] h-12 font-semibold bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 transition-all duration-300 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Load Logs
                  </>
                )}
              </Button>
              
              {isLoading && (
                <div className="space-y-2">
                  <Progress value={loadingProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {loadingProgress < 50 ? 'Searching logs...' : 
                     loadingProgress < 90 ? 'Processing data...' : 'Almost ready!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {dateRangeStats && logsForPdf && (
        <Card className="card-hover bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <BarChart3 className="h-5 w-5" />
              Log Sheet Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center space-y-2">
                <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{dateRangeStats.totalWorkableDays}</div>
                <p className="text-sm text-muted-foreground">Workable Days</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-full bg-green-500/10 w-fit mx-auto">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{dateRangeStats.logCount}</div>
                <p className="text-sm text-muted-foreground">Log Entries</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-full bg-purple-500/10 w-fit mx-auto">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{dateRangeStats.completionRate}%</div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-full bg-orange-500/10 w-fit mx-auto">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{dateRangeStats.missingDays}</div>
                <p className="text-sm text-muted-foreground">Missing Days</p>
              </div>
            </div>
            
            {dateRangeStats.completionRate < 100 && dateRangeStats.missingDays > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Incomplete Log Coverage
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You have {dateRangeStats.missingDays} missing log entries on working days. Consider adding logs for those days to improve your completion rate.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Generator Section */}
      {logsForPdf && !isProfileLoading && userProfile && dateRange?.from && dateRange?.to && (
        <Card className="card-hover border-primary/20 bg-gradient-to-r from-primary/5 to-chart-4/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Generated CUT Log Sheet
            </CardTitle>
            <CardDescription>
              Your professional log sheet is ready! You can preview, download, or print it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Generated for {dateRangeStats?.dateRangeText}</span>
                <span>•</span>
                <span>{logsForPdf.length} log entries included</span>
              </div>
              
              <ModernPDFGenerator
                logs={logsForPdf}
                studentName={userProfile.displayName}
                regNumber={userProfile.regNumber || 'N/A'}
                companyName={userProfile.companyName || 'N/A'}
                startDate={format(dateRange.from, 'dd/MM/yyyy')}
                endDate={format(dateRange.to, 'dd/MM/yyyy')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      {!logsForPdf && !isLoading && (
        <Card className="card-hover bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-chart-4/10 w-fit mx-auto">
                <FileCheck className="h-12 w-12 mx-auto text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                <Star className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Ready to Generate Your Log Sheet? 📋</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Select a date range above to load your daily logs and generate a professional CUT log sheet. 
                The system will automatically format your entries according to university standards.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Official CUT Format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Professional Layout</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>PDF Download</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Print Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
