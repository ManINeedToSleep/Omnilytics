/**
 * @fileoverview Reusable Date Range Picker component with presets.
 * Displays a button triggering a popover containing preset range buttons and a calendar
 * for custom range selection. Uses shadcn/ui components and date-fns.
 * Notifies parent component of changes via onDateRangeChange prop.
 * Connects to:
 *   - Parent component (e.g., src/app/dashboard/page.tsx) via props
 *   - Shadcn UI components (Button, Popover, Calendar)
 *   - date-fns (for date calculations)
 *   - lucide-react (for CalendarIcon)
 */
'use client';

import React, { useState } from 'react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  initialDateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string; // Allow passing custom classes for the trigger button
}

// Add type for presets
type PresetValue = '7d' | '30d' | '90d' | 'thisWeek' | 'thisMonth' | 'thisYear';

export default function DateRangePicker({ 
  initialDateRange, 
  onDateRangeChange, 
  className 
}: DateRangePickerProps) {
  
  // Internal state for the selected date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange || {
      from: subDays(new Date(), 30), // Default initial range if none provided
      to: new Date(),
    }
  );
  
  // State to control popover visibility
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // State to track the active preset button
  const [activePreset, setActivePreset] = useState<PresetValue | undefined>(undefined);

  // Handler for preset date range buttons
  const setPresetRange = (preset: PresetValue) => {
    const today = new Date();
    let fromDate: Date;

    switch (preset) {
      case '7d':
        fromDate = subDays(today, 6); 
        break;
      case '30d':
        fromDate = subDays(today, 29); 
        break;
      case '90d':
        fromDate = subDays(today, 89); 
        break;
      case 'thisWeek':
        fromDate = startOfWeek(today); 
        break;
      case 'thisMonth':
        fromDate = startOfMonth(today); 
        break;
      case 'thisYear':
        fromDate = startOfYear(today); 
        break;
      default:
        fromDate = subDays(today, 29);
    }
    const newRange = { from: fromDate, to: today };
    setDateRange(newRange);
    setActivePreset(preset); // Set the active preset
    onDateRangeChange(newRange); // Notify parent
    setIsPopoverOpen(false); // Close popover after preset selection
  };

  // Handler for when the calendar selection changes
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setActivePreset(undefined); // Clear active preset on manual selection
    onDateRangeChange(range); // Notify parent
    // Optional: Close popover only when a complete range is selected?
    // if (range?.from && range?.to) {
    //  setIsPopoverOpen(false);
    // }
  }

  // Effect to potentially close popover if parent changes range? (Optional)
  // useEffect(() => {
  //  // Sync internal state if initialDateRange prop changes from parent
  //  // This makes it a more "controlled" component if needed
  //  setDateRange(initialDateRange); 
  // }, [initialDateRange]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          size="sm"
          className={cn(
            "w-[260px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className // Allow parent to pass additional classes
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} - 
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {/* Preset Buttons Section */}
        <div className="flex flex-wrap justify-center gap-2 p-3 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => setPresetRange('7d')}>Last 7 Days</Button>
          <Button variant="ghost" size="sm" onClick={() => setPresetRange('30d')}>Last 30 Days</Button>
          <Button variant="ghost" size="sm" onClick={() => setPresetRange('90d')}>Last 90 Days</Button>
          <Button variant="ghost" size="sm" onClick={() => setPresetRange('thisMonth')}>This Month</Button>
          <Button variant="ghost" size="sm" onClick={() => setPresetRange('thisYear')} className={cn(activePreset === 'thisYear' && "bg-accent text-accent-foreground")}>This Year</Button>
        </div>
        <Calendar
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center items-center h-10 mb-2 space-x-2",
            caption_label: "text-sm font-medium",
            nav: "",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center",
            nav_button_previous: "order-first before:content-['<']",
            nav_button_next:     "order-last before:content-['>']",
            table: "w-full border-collapse space-y-1 px-3 pb-3",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
            day_today: "bg-accent text-accent-foreground rounded-full",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleCalendarSelect}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
} 