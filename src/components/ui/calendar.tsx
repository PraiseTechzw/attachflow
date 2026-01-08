"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format, addMonths, subMonths, addYears, subYears, setMonth, setYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  enableQuickNavigation?: boolean;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  enableQuickNavigation = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(props.month || new Date());
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthChange = (monthIndex: number) => {
    const newDate = setMonth(currentMonth, monthIndex);
    setCurrentMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = setYear(currentMonth, year);
    setCurrentMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subYears(currentMonth, 1) : addYears(currentMonth, 1);
    setCurrentMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    props.onMonthChange?.(today);
  };

  return (
    <div className={cn("p-6 bg-gradient-to-br from-background via-background/95 to-muted/30 rounded-2xl border shadow-2xl backdrop-blur-sm", className)}>
      {/* Enhanced Header with Quick Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear('prev')}
            className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {enableQuickNavigation ? (
          <div className="flex items-center gap-2">
            <Select value={currentMonth.getMonth().toString()} onValueChange={(value) => handleMonthChange(parseInt(value))}>
              <SelectTrigger className="w-auto border-none bg-transparent hover:bg-muted/50 transition-colors">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-1" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentYear.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
              <SelectTrigger className="w-auto border-none bg-transparent hover:bg-muted/50 transition-colors">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-1" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-lg font-semibold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateYear('next')}
            className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full transition-all duration-300"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-xs px-3 py-1 h-7 bg-gradient-to-r from-primary/10 to-chart-4/10 border-primary/20 hover:from-primary/20 hover:to-chart-4/20 transition-all duration-300"
        >
          Today
        </Button>
        <div className="text-xs text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Calendar Grid */}
      <DayPicker
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // We're using our custom header
          nav: "hidden", // We're using our custom navigation
          table: "w-full border-collapse space-y-1",
          head_row: "flex mb-3",
          head_cell: "text-muted-foreground rounded-lg w-12 h-8 font-semibold text-xs uppercase tracking-wider flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30",
          row: "flex w-full mt-1",
          cell: cn(
            "h-12 w-12 text-center text-sm p-0 relative rounded-lg",
            "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
            "[&:has([aria-selected].day-outside)]:bg-accent/50",
            "[&:has([aria-selected])]:bg-gradient-to-br [&:has([aria-selected])]:from-primary/15 [&:has([aria-selected])]:to-chart-4/15",
            "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
            "focus-within:relative focus-within:z-20"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-12 w-12 p-0 font-medium aria-selected:opacity-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group border border-transparent hover:border-primary/20"
          ),
          day_range_end: "day-range-end",
          day_selected: cn(
            "bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-xl border-primary/30",
            "hover:from-primary/90 hover:to-chart-4/90 hover:scale-105",
            "focus:from-primary focus:to-chart-4",
            "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          ),
          day_today: cn(
            "bg-gradient-to-br from-orange-500/25 to-red-500/25 text-orange-700 dark:text-orange-300 font-bold border-orange-500/40",
            "ring-2 ring-orange-500/40 ring-offset-2 ring-offset-background",
            "hover:from-orange-500/35 hover:to-red-500/35 hover:ring-orange-500/60"
          ),
          day_outside: "day-outside text-muted-foreground/40 aria-selected:bg-accent/30 aria-selected:text-muted-foreground hover:text-muted-foreground/60 hover:bg-muted/20",
          day_disabled: "text-muted-foreground/20 opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-none",
          day_range_middle: cn(
            "aria-selected:bg-gradient-to-r aria-selected:from-primary/25 aria-selected:to-chart-4/25",
            "aria-selected:text-accent-foreground border-primary/20"
          ),
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />

      {/* Footer with additional info */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Click a date to select</span>
        <span>Use dropdowns for quick navigation</span>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
