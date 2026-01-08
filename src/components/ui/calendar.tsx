"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border shadow-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-semibold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-gradient-to-br from-primary/10 to-chart-4/10 border-primary/20 p-0 opacity-70 hover:opacity-100 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/20 hover:to-chart-4/20 transition-all duration-300 rounded-full shadow-sm hover:shadow-md"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground rounded-md w-10 h-10 font-medium text-xs uppercase tracking-wider flex items-center justify-center bg-muted/30",
        row: "flex w-full mt-1",
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-gradient-to-br [&:has([aria-selected])]:from-primary/10 [&:has([aria-selected])]:to-chart-4/10",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium aria-selected:opacity-100 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md relative overflow-hidden group"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-lg",
          "hover:from-primary/90 hover:to-chart-4/90",
          "focus:from-primary focus:to-chart-4",
          "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        ),
        day_today: cn(
          "bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 font-bold",
          "ring-2 ring-orange-500/30 ring-offset-2 ring-offset-background",
          "hover:from-orange-500/30 hover:to-red-500/30"
        ),
        day_outside:
          "day-outside text-muted-foreground/50 aria-selected:bg-accent/30 aria-selected:text-muted-foreground hover:text-muted-foreground/70",
        day_disabled: "text-muted-foreground/30 opacity-50 cursor-not-allowed hover:scale-100",
        day_range_middle: cn(
          "aria-selected:bg-gradient-to-r aria-selected:from-primary/20 aria-selected:to-chart-4/20",
          "aria-selected:text-accent-foreground"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
