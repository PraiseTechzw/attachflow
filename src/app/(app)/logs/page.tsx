'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, PlusCircle, Calendar, Clock, TrendingUp, Search, Filter, 
  BookOpen, Sparkles, Eye, Edit, ChevronRight, Heart, Meh, Frown,
  Star, Award, Target, Zap, Brain, Activity, BarChart3
} from "lucide-react";
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
import { useMemo, useState } from "react";
import { format, isThisWeek, isThisMonth, differenceInDays } from "date-fns";

type GroupedLogs = {
    [week: string]: DailyLog[];
}

const getSentimentIcon = (sentiment: string | undefined) => {
  switch (sentiment) {
    case 'Positive': return <Heart className="h-4 w-4 text-green-500" />;
    case 'Negative': return <Frown className="h-4 w-4 text-red-500" />;
    default: return <Meh className="h-4 w-4 text-yellow-500" />;
  }
};

const getSentimentColor = (sentiment: string | undefined) => {
  switch (sentiment) {
    case 'Positive': return 'from-green-500/10 to-green-600/5 border-green-500/20';
    case 'Negative': return 'from-red-500/10 to-red-600/5 border-red-500/20';
    default: return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20';
  }
};

const getRecentBadge = (date: any) => {
  if (!date) return null;
  const logDate = date.toDate();
  const daysAgo = differenceInDays(new Date(), logDate);
  
  if (daysAgo === 0) return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">Today</Badge>;
  if (daysAgo === 1) return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Yesterday</Badge>;
  if (isThisWeek(logDate)) return <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 border-purple-500/20">This Week</Badge>;
  if (isThisMonth(logDate)) return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/20">This Month</Badge>;
  return null;
};

export default function LogsPage() {
    const { firestore, user } = useFirebase();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSentiment, setFilterSentiment] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'accordion' | 'grid'>('accordion');

    const logsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/dailyLogs`), orderBy('date', 'desc'));
    }, [firestore, user]);

    const { data: logs, isLoading } = useCollection<DailyLog>(logsQuery);

    // Filter logs based on search and sentiment
    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        
        return logs.filter(log => {
            const matchesSearch = searchTerm === '' || 
                (log.activitiesRaw && log.activitiesRaw.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.activitiesProfessional && log.activitiesProfessional.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesSentiment = filterSentiment === 'all' || log.sentiment === filterSentiment;
            
            return matchesSearch && matchesSentiment;
        });
    }, [logs, searchTerm, filterSentiment]);

    const groupedLogs = useMemo(() => {
        if (!filteredLogs) return {};
        return filteredLogs.reduce((acc: GroupedLogs, log) => {
            const weekKey = `Week ${log.weekNumber}`;
            if (!acc[weekKey]) {
                acc[weekKey] = [];
            }
            acc[weekKey].push(log);
            return acc;
        }, {});
    }, [filteredLogs]);

    const sortedWeeks = useMemo(() => {
        return Object.keys(groupedLogs).sort((a, b) => {
            const weekA = parseInt(a.replace('Week ', ''));
            const weekB = parseInt(b.replace('Week ', ''));
            return weekB - weekA;
        });
    }, [groupedLogs]);

    // Statistics
    const stats = useMemo(() => {
        if (!logs) return { total: 0, thisWeek: 0, thisMonth: 0, positive: 0 };
        
        const now = new Date();
        return {
            total: logs.length,
            thisWeek: logs.filter(log => log.date && isThisWeek(log.date.toDate())).length,
            thisMonth: logs.filter(log => log.date && isThisMonth(log.date.toDate())).length,
            positive: logs.filter(log => log.sentiment === 'Positive').length
        };
    }, [logs]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'EEEE, MMMM d, yyyy');
    }

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        return format(timestamp.toDate(), 'h:mm a');
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5 rounded-3xl -z-10"></div>
                <div className="py-12">
                    <h1 className="text-5xl font-bold tracking-tight gradient-text mb-4">
                        Daily Logs 📚
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Track your journey, celebrate your progress, and reflect on your growth.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
                            <BookOpen className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Your learning journey
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
                            <Calendar className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-1">{stats.thisWeek}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Recent activity
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300">
                            <BarChart3 className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600 mb-1">{stats.thisMonth}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Monthly progress
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover group bg-gradient-to-br from-primary/10 via-primary/5 to-chart-2/10 border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Link href="/logs/new" className="w-full h-full">
                        <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center space-y-3">
                            <div className="p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-110">
                                <PlusCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-primary mb-1">Add New Log</h3>
                                <p className="text-sm text-muted-foreground">Record today&apos;s progress</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search your logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by mood" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Moods</SelectItem>
                                <SelectItem value="Positive">😊 Positive</SelectItem>
                                <SelectItem value="Neutral">😐 Neutral</SelectItem>
                                <SelectItem value="Negative">😔 Negative</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'accordion' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('accordion')}
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Weeks
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Grid
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading your amazing logs...</p>
                    </div>
                </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
                viewMode === 'accordion' ? (
                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={sortedWeeks.length > 0 ? sortedWeeks[0] : undefined}>
                        {sortedWeeks.map(week => (
                            <AccordionItem value={week} key={week} className="border rounded-lg px-6 bg-card/50 backdrop-blur-sm">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <span>{week}</span>
                                        <Badge variant="secondary" className="ml-2">
                                            {groupedLogs[week].length} {groupedLogs[week].length === 1 ? 'log' : 'logs'}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {groupedLogs[week].map(log => (
                                            <Card key={log.id} className={`card-hover group relative overflow-hidden bg-gradient-to-br ${getSentimentColor(log.sentiment)}`}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{formatDate(log.date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getSentimentIcon(log.sentiment)}
                                                            {getRecentBadge(log.date)}
                                                        </div>
                                                    </div>
                                                    {formatTime(log.date) && (
                                                        <p className="text-xs text-muted-foreground">{formatTime(log.date)}</p>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                        {log.activitiesProfessional || log.activitiesRaw || 'No content available'}
                                                    </p>
                                                    {log.skills && log.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-4">
                                                            {log.skills.slice(0, 3).map((skill, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                            {log.skills.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{log.skills.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Brain className="h-3 w-3" />
                                                            <span>{log.skills?.length || 0} skills</span>
                                                        </div>
                                                        <Link href={`/logs/${log.id}`}>
                                                            <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLogs.map(log => (
                            <Card key={log.id} className={`card-hover group relative overflow-hidden bg-gradient-to-br ${getSentimentColor(log.sentiment)}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{formatDate(log.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getSentimentIcon(log.sentiment)}
                                            {getRecentBadge(log.date)}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="w-fit text-xs">
                                        Week {log.weekNumber}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                                        {log.activitiesProfessional || log.activitiesRaw || 'No content available'}
                                    </p>
                                    {log.skills && log.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {log.skills.slice(0, 2).map((skill, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {log.skills.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{log.skills.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Brain className="h-3 w-3" />
                                            <span>{log.skills?.length || 0} skills</span>
                                        </div>
                                        <Link href={`/logs/${log.id}`}>
                                            <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                <Card className="text-center py-20 bg-gradient-to-br from-muted/50 to-muted/20">
                    <CardContent className="space-y-6">
                        <div className="relative">
                            <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-chart-2/10 w-fit mx-auto">
                                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                            </div>
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">
                                {searchTerm || filterSentiment !== 'all' ? 'No matching logs found' : 'Ready to Start Logging? 🚀'}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                                {searchTerm || filterSentiment !== 'all' 
                                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                                    : 'Begin your learning journey by creating your first daily log entry. Document your progress, celebrate your wins, and track your growth!'
                                }
                            </p>
                        </div>
                        {(!searchTerm && filterSentiment === 'all') && (
                            <Link href="/logs/new">
                                <Button size="lg" className="mt-4">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Create Your First Log
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
