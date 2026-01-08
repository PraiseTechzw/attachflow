
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, Book, FolderKanban, Loader2, Info, Cloud, AlertCircle, TrendingUp, Award, Target, Sparkles, Brain, Code, Zap,
  // Programming Languages
  FileCode2, Terminal, Braces, Hash, Coffee, Gem, 
  // Frontend Technologies
  Palette, Layout, Smartphone, Monitor, Paintbrush, Eye, MousePointer, Layers,
  // Backend Technologies
  Server, Database, Globe, Shield, Key, Cpu, HardDrive, Network,
  // Databases
  Archive, Table, Search, Lock, FileSpreadsheet, Cylinder,
  // DevOps & Tools
  Container, Cloud as CloudIcon, Settings, Wrench, GitBranch, Package, Rocket, Activity,
  // Design & UI
  Figma, Pen, Image, Crop, Type, Grid, Brush, Scissors,
  // General Tech & Support
  Laptop, Wifi, Bug, TestTube, FileText, Folder, Download, Upload, Users, LifeBuoy, Printer, HardHat
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NotificationDemo } from "@/components/demo/notification-demo";

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

// Comprehensive skill-specific icon mapping
const getSkillIcon = (skillName: string) => {
  const skill = skillName.toLowerCase();
  
  // IT Support & Hardware
  if (skill.includes('troubleshooting')) return Bug;
  if (skill.includes('maintenance')) return Wrench;
  if (skill.includes('hardware')) return HardHat;
  if (skill.includes('printer')) return Printer;
  if (skill.includes('toner')) return Printer;
  if (skill.includes('repair')) return Wrench;
  if (skill.includes('support')) return LifeBuoy;
  if (skill.includes('service')) return Users;
  if (skill.includes('network') || skill.includes('ethernet')) return Network;
  if (skill.includes('cable') || skill.includes('cabling')) return Network;
  if (skill.includes('install')) return HardHat;

  // Programming Languages
  if (skill.includes('javascript') || skill.includes('js')) return FileCode2;
  if (skill.includes('typescript') || skill.includes('ts')) return Braces;
  if (skill.includes('python')) return Terminal;
  if (skill.includes('java') && !skill.includes('javascript')) return Coffee;
  if (skill.includes('c++') || skill.includes('cpp')) return Hash;
  if (skill.includes('c#') || skill.includes('csharp')) return Hash;
  if (skill.includes('php')) return Code;
  if (skill.includes('ruby')) return Gem;
  if (skill.includes('go') || skill.includes('golang')) return Zap;
  if (skill.includes('rust')) return Settings;
  if (skill.includes('swift')) return Smartphone;
  if (skill.includes('kotlin')) return Smartphone;
  
  // Frontend Frameworks & Libraries
  if (skill.includes('react')) return Layers;
  if (skill.includes('vue')) return Eye;
  if (skill.includes('angular')) return Target;
  if (skill.includes('svelte')) return Sparkles;
  if (skill.includes('next')) return Rocket;
  if (skill.includes('nuxt')) return Rocket;
  if (skill.includes('gatsby')) return Globe;
  
  // Frontend Technologies
  if (skill.includes('html')) return Layout;
  if (skill.includes('css')) return Palette;
  if (skill.includes('sass') || skill.includes('scss')) return Paintbrush;
  if (skill.includes('tailwind')) return Brush;
  if (skill.includes('bootstrap')) return Grid;
  if (skill.includes('jquery')) return MousePointer;
  if (skill.includes('webpack')) return Package;
  if (skill.includes('vite')) return Zap;
  
  // Backend Frameworks & Technologies
  if (skill.includes('node') || skill.includes('nodejs')) return Server;
  if (skill.includes('express')) return Network;
  if (skill.includes('django')) return Shield;
  if (skill.includes('flask')) return Server;
  if (skill.includes('spring')) return Coffee;
  if (skill.includes('laravel')) return Globe;
  if (skill.includes('rails')) return Gem;
  if (skill.includes('asp.net') || skill.includes('dotnet')) return Hash;
  if (skill.includes('fastapi')) return Zap;
  
  // Databases
  if (skill.includes('mysql')) return Database;
  if (skill.includes('postgresql') || skill.includes('postgres')) return Cylinder;
  if (skill.includes('mongodb') || skill.includes('mongo')) return Archive;
  if (skill.includes('redis')) return HardDrive;
  if (skill.includes('sqlite')) return FileSpreadsheet;
  if (skill.includes('firebase')) return CloudIcon;
  if (skill.includes('supabase')) return Database;
  if (skill.includes('prisma')) return Table;
  if (skill.includes('sql')) return Search;
  
  // Cloud & DevOps
  if (skill.includes('aws')) return CloudIcon;
  if (skill.includes('azure')) return CloudIcon;
  if (skill.includes('gcp') || skill.includes('google cloud')) return CloudIcon;
  if (skill.includes('docker')) return Container;
  if (skill.includes('kubernetes') || skill.includes('k8s')) return Settings;
  if (skill.includes('jenkins')) return Activity;
  if (skill.includes('github')) return GitBranch;
  if (skill.includes('gitlab')) return GitBranch;
  if (skill.includes('git')) return GitBranch;
  if (skill.includes('ci/cd') || skill.includes('cicd')) return Rocket;
  if (skill.includes('terraform')) return Settings;
  if (skill.includes('ansible')) return Wrench;
  
  // Design & UI/UX
  if (skill.includes('figma')) return Pen;
  if (skill.includes('sketch')) return Pen;
  if (skill.includes('adobe') || skill.includes('photoshop')) return Image;
  if (skill.includes('illustrator')) return Brush;
  if (skill.includes('xd')) return Layout;
  if (skill.includes('ui') || skill.includes('user interface')) return Monitor;
  if (skill.includes('ux') || skill.includes('user experience')) return Eye;
  if (skill.includes('design')) return Palette;
  if (skill.includes('prototype')) return Layers;
  
  // Testing & Quality
  if (skill.includes('jest')) return TestTube;
  if (skill.includes('cypress')) return Bug;
  if (skill.includes('selenium')) return Bug;
  if (skill.includes('testing')) return TestTube;
  if (skill.includes('unit test')) return TestTube;
  if (skill.includes('e2e')) return TestTube;
  
  // Mobile Development
  if (skill.includes('react native')) return Smartphone;
  if (skill.includes('flutter')) return Smartphone;
  if (skill.includes('ionic')) return Smartphone;
  if (skill.includes('xamarin')) return Smartphone;
  if (skill.includes('mobile')) return Smartphone;
  if (skill.includes('ios')) return Smartphone;
  if (skill.includes('android')) return Smartphone;
  
  // Data & Analytics
  if (skill.includes('pandas')) return Table;
  if (skill.includes('numpy')) return Hash;
  if (skill.includes('matplotlib')) return TrendingUp;
  if (skill.includes('tensorflow')) return Brain;
  if (skill.includes('pytorch')) return Brain;
  if (skill.includes('machine learning') || skill.includes('ml')) return Brain;
  if (skill.includes('data science')) return TrendingUp;
  if (skill.includes('analytics')) return TrendingUp;
  
  // API & Integration
  if (skill.includes('rest') || skill.includes('api')) return Network;
  if (skill.includes('graphql')) return Globe;
  if (skill.includes('websocket')) return Wifi;
  if (skill.includes('oauth')) return Key;
  if (skill.includes('jwt')) return Shield;
  
  // Content Management & Documentation
  if (skill.includes('wordpress')) return FileText;
  if (skill.includes('drupal')) return FileText;
  if (skill.includes('strapi')) return Folder;
  if (skill.includes('contentful')) return FileText;
  if (skill.includes('documentation')) return FileText;
  
  // General categories fallback
  if (skill.includes('programming') || skill.includes('coding')) return Code;
  if (skill.includes('frontend') || skill.includes('front-end')) return Monitor;
  if (skill.includes('backend') || skill.includes('back-end')) return Server;
  if (skill.includes('database') || skill.includes('db')) return Database;
  if (skill.includes('devops') || skill.includes('deployment')) return Rocket;
  if (skill.includes('design')) return Palette;
  if (skill.includes('web')) return Globe;
  if (skill.includes('development')) return Laptop;
  
  // Default fallback
  return Brain;
};

// Enhanced skill categories with more specific categorization
const skillCategories = {
  'Programming': { color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30', textColor: 'text-blue-600' },
  'Frontend': { color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30', textColor: 'text-purple-600' },
  'Backend': { color: 'from-green-500/20 to-green-600/20 border-green-500/30', textColor: 'text-green-600' },
  'Database': { color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30', textColor: 'text-orange-600' },
  'DevOps': { color: 'from-red-500/20 to-red-600/20 border-red-500/30', textColor: 'text-red-600' },
  'Design': { color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30', textColor: 'text-pink-600' },
  'Mobile': { color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30', textColor: 'text-indigo-600' },
  'Data': { color: 'from-teal-500/20 to-teal-600/20 border-teal-500/30', textColor: 'text-teal-600' },
  'Testing': { color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30', textColor: 'text-yellow-600' },
  'Support & Hardware': { color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30', textColor: 'text-cyan-600' },
  'Default': { color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30', textColor: 'text-gray-600' }
};

function getSkillCategory(skillName: string): keyof typeof skillCategories {
  const skill = skillName.toLowerCase();
  
  // IT Support & Hardware
  if (skill.includes('support') || skill.includes('hardware') || skill.includes('maintenance') || 
      skill.includes('troubleshooting') || skill.includes('printer') || skill.includes('repair') ||
      skill.includes('install') || skill.includes('network') || skill.includes('ethernet') || skill.includes('cabling')) return 'Support & Hardware';

  // Mobile Development
  if (skill.includes('react native') || skill.includes('flutter') || skill.includes('ionic') || 
      skill.includes('xamarin') || skill.includes('mobile') || skill.includes('ios') || 
      skill.includes('android') || skill.includes('swift') || skill.includes('kotlin')) return 'Mobile';
  
  // Data Science & Analytics
  if (skill.includes('pandas') || skill.includes('numpy') || skill.includes('matplotlib') || 
      skill.includes('tensorflow') || skill.includes('pytorch') || skill.includes('machine learning') || 
      skill.includes('data science') || skill.includes('analytics') || skill.includes('ml')) return 'Data';
  
  // Testing
  if (skill.includes('jest') || skill.includes('cypress') || skill.includes('selenium') || 
      skill.includes('testing') || skill.includes('unit test') || skill.includes('e2e')) return 'Testing';
  
  // Frontend
  if (skill.includes('react') || skill.includes('vue') || skill.includes('angular') || 
      skill.includes('html') || skill.includes('css') || skill.includes('frontend') || 
      skill.includes('javascript') || skill.includes('typescript') || skill.includes('tailwind') || 
      skill.includes('bootstrap') || skill.includes('sass') || skill.includes('next') || 
      skill.includes('nuxt') || skill.includes('svelte')) return 'Frontend';
  
  // Backend
  if (skill.includes('node') || skill.includes('express') || skill.includes('api') || 
      skill.includes('backend') || skill.includes('server') || skill.includes('django') || 
      skill.includes('flask') || skill.includes('spring') || skill.includes('laravel') || 
      skill.includes('rails') || skill.includes('asp.net') || skill.includes('fastapi')) return 'Backend';
  
  // Database
  if (skill.includes('database') || skill.includes('sql') || skill.includes('mongodb') || 
      skill.includes('firebase') || skill.includes('mysql') || skill.includes('postgresql') || 
      skill.includes('redis') || skill.includes('sqlite') || skill.includes('prisma') || 
      skill.includes('supabase')) return 'Database';
  
  // DevOps
  if (skill.includes('docker') || skill.includes('kubernetes') || skill.includes('aws') || 
      skill.includes('deploy') || skill.includes('devops') || skill.includes('ci/cd') || 
      skill.includes('jenkins') || skill.includes('terraform') || skill.includes('ansible') || 
      skill.includes('azure') || skill.includes('gcp')) return 'DevOps';
  
  // Design
  if (skill.includes('design') || skill.includes('ui') || skill.includes('ux') || 
      skill.includes('figma') || skill.includes('photoshop') || skill.includes('sketch') || 
      skill.includes('adobe') || skill.includes('prototype')) return 'Design';
  
  // Programming Languages
  if (skill.includes('python') || skill.includes('java') || skill.includes('c++') || 
      skill.includes('c#') || skill.includes('php') || skill.includes('ruby') || 
      skill.includes('go') || skill.includes('rust') || skill.includes('programming')) return 'Programming';
  
  return 'Default';
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

  // Enhanced skills processing with specific icons
  const processedSkills = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    
    const maxFrequency = Math.max(...skills.map(s => s.frequency));
    
    return skills.map(skill => {
      const category = getSkillCategory(skill.name);
      const categoryInfo = skillCategories[category];
      const skillIcon = getSkillIcon(skill.name);
      const progressPercentage = (skill.frequency / maxFrequency) * 100;
      
      return {
        ...skill,
        category,
        categoryInfo,
        skillIcon,
        progressPercentage,
        level: skill.frequency >= maxFrequency * 0.8 ? 'Expert' : 
               skill.frequency >= maxFrequency * 0.5 ? 'Advanced' : 
               skill.frequency >= maxFrequency * 0.3 ? 'Intermediate' : 'Beginner'
      };
    });
  }, [skills]);

  const totalLogs = logs?.length ?? 0;
  const totalProjects = projects?.length ?? 0;
  const pendingProjects = projects?.filter(p => p.status === 'Pending').length ?? 0;
  const totalSkills = skills?.length ?? 0;

  const isLoading = logsLoading || projectsLoading || skillsLoading;

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading your beautiful dashboard...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5 rounded-3xl -z-10"></div>
        <div className="py-12">
          <h1 className="text-5xl font-bold tracking-tight gradient-text mb-4">
            Welcome Back! 🚀
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your journey of growth and learning continues. Here&apos;s your beautiful progress overview.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {showBurnoutWarning && (
         <Alert variant="destructive" className="backdrop-blur-sm bg-destructive/10 border-destructive/50 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feeling Overwhelmed?</AlertTitle>
            <AlertDescription>
                Your recent logs suggest you might be facing some challenges. Remember to document solutions and learnings, and don&apos;t hesitate to ask your supervisor for help.
            </AlertDescription>
        </Alert>
      )}

      {showInactivityReminder && !showBurnoutWarning && (
        <Alert className="backdrop-blur-sm bg-primary/10 border-primary/50 animate-in slide-in-from-top-2">
            <Info className="h-4 w-4" />
          <AlertTitle>Friendly Reminder</AlertTitle>
          <AlertDescription>
            Don&apos;t forget to log your activities! Consistent logs make reports much easier to write.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300">
              <Book className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{totalLogs}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Keep up the great work!
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300">
              <FolderKanban className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {pendingProjects > 0 ? `${pendingProjects} pending approval` : 'All projects approved! ✨'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300">
              <Brain className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">{totalSkills}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Growing every day!
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover group bg-gradient-to-br from-primary/10 via-primary/5 to-chart-4/10 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-4/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Link href="/logs/new" className="w-full h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center space-y-3">
                    <div className="p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-110">
                      <PlusCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">Add New Log</h3>
                      <p className="text-sm text-muted-foreground">Record today&apos;s achievements</p>
                    </div>
                </CardContent>
            </Link>
        </Card>
      </div>

      {/* Charts and Skills Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <Card className="card-hover h-full">
              <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary to-chart-4 animate-pulse"></div>
                    Activity & Sentiment Trends
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your logging consistency and emotional journey over the past 6 months
                  </CardDescription>
              </CardHeader>
              <CardContent>
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
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
                      <Bar yAxisId="left" dataKey="logs" fill="var(--color-logs)" radius={8} />
                      <Line yAxisId="right" dataKey="sentiment" type="monotone" stroke="var(--color-sentiment)" strokeWidth={3} dot={{ fill: "var(--color-sentiment)", strokeWidth: 2, r: 5 }}/>
                  </ComposedChart>
              </ChartContainer>
              </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Skills Section - spans 1 column */}
        <Card className="card-hover h-full">
            <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-chart-4 to-purple-500 animate-pulse"></div>
                  Skills Mastery
                </CardTitle>
                <CardDescription className="text-base">
                  Your technical expertise and growth areas
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {processedSkills && processedSkills.length > 0 ? (
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {processedSkills.slice(0, 8).map((skill, index) => {
                    const SkillIcon = skill.skillIcon;
                    return (
                      <div 
                        key={skill.id}
                        className="group p-3 rounded-xl border bg-gradient-to-r hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          background: `linear-gradient(135deg, ${skill.categoryInfo.color.split(' ')[0].replace('from-', '')} 0%, ${skill.categoryInfo.color.split(' ')[1].replace('to-', '')} 100%)`
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-white/80 ${skill.categoryInfo.textColor}`}>
                              <SkillIcon className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {skill.name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs font-medium">
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Frequency: {skill.frequency}</span>
                            <span>{Math.round(skill.progressPercentage)}%</span>
                          </div>
                          <Progress 
                            value={skill.progressPercentage} 
                            className="h-2 bg-white/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {processedSkills.length > 8 && (
                    <div className="text-center py-2">
                      <Badge variant="outline" className="text-xs">
                        +{processedSkills.length - 8} more skills
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground space-y-6 py-8">
                  <div className="relative">
                    <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-chart-4/10 w-fit mx-auto">
                      <Cloud className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">Ready to Grow? 🌱</p>
                    <p className="text-sm leading-relaxed">
                      Start logging your daily activities to discover and track your amazing skills!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      </div>

      {/* Notification System Demo - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Enhanced System Demo
              </CardTitle>
              <CardDescription>
                Test the new notification system, search functionality, and enhanced UI components.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <NotificationDemo />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      Try these keyboard shortcuts and features:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Command Palette</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Search</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">Click search icon</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">Click bell icon</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sidebar Toggle</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘B</kbd>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
