import { differenceInWeeks, differenceInMonths, startOfWeek, startOfMonth, format } from 'date-fns';

/**
 * Calculate the attachment week number based on the first log date
 * Week 1 starts from the user's first log date
 */
export const calculateAttachmentWeek = (currentDate: Date, firstLogDate: Date): number => {
  const weeksDiff = differenceInWeeks(
    startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday as start of week
    startOfWeek(firstLogDate, { weekStartsOn: 1 })
  );
  return weeksDiff + 1; // Start from week 1, not 0
};

/**
 * Calculate the attachment month number based on the first log date
 * Month 1 starts from the user's first log date
 */
export const calculateAttachmentMonth = (currentDate: Date, firstLogDate: Date): number => {
  const monthsDiff = differenceInMonths(
    startOfMonth(currentDate),
    startOfMonth(firstLogDate)
  );
  return monthsDiff + 1; // Start from month 1, not 0
};

/**
 * Get a formatted month-year string for grouping
 */
export const getAttachmentMonthYear = (currentDate: Date, firstLogDate: Date): string => {
  const monthNumber = calculateAttachmentMonth(currentDate, firstLogDate);
  const monthName = format(currentDate, 'MMMM yyyy');
  return `Month ${monthNumber} (${monthName})`;
};

/**
 * Get a formatted week string for grouping
 */
export const getAttachmentWeekString = (currentDate: Date, firstLogDate: Date): string => {
  const weekNumber = calculateAttachmentWeek(currentDate, firstLogDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return `Week ${weekNumber} (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`;
};

/**
 * Calculate both week and month numbers for a log entry
 */
export const calculateLogNumbers = (logDate: Date, firstLogDate: Date) => {
  return {
    weekNumber: calculateAttachmentWeek(logDate, firstLogDate),
    monthNumber: calculateAttachmentMonth(logDate, firstLogDate),
    monthYear: getAttachmentMonthYear(logDate, firstLogDate)
  };
};