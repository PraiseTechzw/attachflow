import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Book, FolderKanban } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { month: "January", logs: 186 },
  { month: "February", logs: 305 },
  { month: "March", logs: 237 },
  { month: "April", logs: 73 },
  { month: "May", logs: 209 },
  { month: "June", logs: 214 },
]

const chartConfig = {
  logs: {
    label: "Logs",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your attachment progress.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Submitted</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 pending approval</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center bg-primary/5 border-dashed">
            <Link href="/logs/new" className="w-full h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center">
                    <PlusCircle className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold text-primary">Add New Log</h3>
                    <p className="text-sm text-muted-foreground">Record your activities for today.</p>
                </CardContent>
            </Link>
        </Card>
      </div>

      <div className="mt-8 grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Log Activity</CardTitle>
                <CardDescription>Your daily log submissions over the past 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="logs" fill="var(--color-logs)" radius={4} />
                </BarChart>
            </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
