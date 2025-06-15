import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range) => {
    onDateRangeChange({
      start: range?.from || null,
      end: range?.to || null
    });
  };

  const handleClear = () => {
    onDateRangeChange({ start: null, end: null });
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) {
      return "Select date range";
    }
    
    if (dateRange.start && !dateRange.end) {
      return format(dateRange.start, "dd MMM yyyy");
    }
    
    if (dateRange.start && dateRange.end) {
      return `${format(dateRange.start, "dd MMM yyyy")} - ${format(dateRange.end, "dd MMM yyyy")}`;
    }
    
    return "Select date range";
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange.start && !dateRange.end && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.start}
            selected={{
              from: dateRange.start,
              to: dateRange.end
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      
      {(dateRange.start || dateRange.end) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DateRangeFilter;