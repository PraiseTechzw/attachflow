
import { isWeekend, isSameDay, addDays, getYear } from 'date-fns';

// All dates are 1-indexed for month, 0-indexed for day
// This is a simplified list. Easter-dependent holidays are approximated for a generic year.
const ZIMBABWE_HOLIDAYS = [
    { month: 1, day: 1, name: "New Year's Day" },
    { month: 2, day: 21, name: "Robert Mugabe National Youth Day" },
    { month: 4, day: 18, name: "Independence Day" },
    { month: 5, day: 1, name: "Worker's Day" },
    { month: 5, day: 25, name: "Africa Day" },
    { month: 8, day: 12, name: "Heroes' Day" }, // Second Monday of August, this is an approximation
    { month: 8, day: 13, name: "Defence Forces Day" }, // Second Tuesday of August
    { month: 12, day: 22, name: "National Unity Day" },
    { month: 12, day: 25, name: "Christmas Day" },
    { month: 12-end, day: 26, name: "Boxing Day" },
];

// Approximated dates for Easter holidays, as they are variable
const getEasterHolidays = (year: number) => {
    // These are typical, but not exact. A full calculation is complex.
    const goodFriday = new Date(year, 3, 15); // Approximating April 15th
    const easterMonday = new Date(year, 3, 18); // Approximating April 18th
    return [
        { date: goodFriday, name: 'Good Friday' },
        { date: easterMonday, name: 'Easter Monday' },
    ];
};


/**
 * Checks if a given date is a non-working day in Zimbabwe (weekend or public holiday).
 * @param date The date to check.
 * @returns True if the date is a weekend or a public holiday.
 */
export const isNonWorkDay = (date: Date): boolean => {
    if (isWeekend(date)) {
        return true;
    }

    const year = getYear(date);
    const day = date.getDate();
    const month = date.getMonth() + 1; // date-fns months are 0-indexed

    // Check fixed holidays
    for (const holiday of ZIMBABWE_HOLIDAYS) {
        if (holiday.month === month && holiday.day === day) {
            return true;
        }
        // If holiday falls on Sunday, next day is a holiday
        const holidayDate = new Date(year, holiday.month - 1, holiday.day);
        if (holidayDate.getDay() === 0 && isSameDay(date, addDays(holidayDate, 1))) {
            return true;
        }
    }
    
    // Check Easter holidays
    const easterHolidays = getEasterHolidays(year);
    for (const holiday of easterHolidays) {
         if (isSameDay(date, holiday.date)) {
            return true;
        }
    }

    return false;
};
