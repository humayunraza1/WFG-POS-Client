import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';

const SummaryFilters = ({ selectedPeriod, onPeriodChange, dateRange, onDateRangeChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const periods = [
    { key: 'all', label: 'All Time', color: 'default' },
    { key: 'weekly', label: 'This Week', color: 'secondary' },
    { key: 'monthly', label: 'This Month', color: 'secondary' },
    { key: 'quarterly', label: 'This Quarter', color: 'secondary' },
    { key: 'yearly', label: 'This Year', color: 'secondary' }
  ];

  const handleDateSelect = (date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // Start new range
      onDateRangeChange({ start: date, end: null });
    } else {
      // Complete the range
      const start = dateRange.start;
      const end = date;
      onDateRangeChange({
        start: start < end ? start : end,
        end: start < end ? end : start
      });
      setIsCalendarOpen(false);
      onPeriodChange('custom');
    }
  };

  const clearCustomRange = () => {
    onDateRangeChange({ start: null, end: null });
    onPeriodChange('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Period:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {periods.map((period) => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(period.key)}
          >
            {period.label}
          </Button>
        ))}
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.start}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="p-3 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                {dateRange.start && !dateRange.end && "Select end date"}
                {dateRange.start && dateRange.end && "Range selected"}
                {!dateRange.start && "Select start date"}
              </div>
              {dateRange.start && (
                <div className="text-xs">
                  From: {format(dateRange.start, 'PPP')}
                  {dateRange.end && (
                    <> to {format(dateRange.end, 'PPP')}</>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {selectedPeriod === 'custom' && dateRange.start && (
          <Button variant="ghost" size="sm" onClick={clearCustomRange}>
            Clear
          </Button>
        )}
      </div>
      
      {selectedPeriod === 'custom' && dateRange.start && dateRange.end && (
        <Badge variant="secondary">
          {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
        </Badge>
      )}
    </div>
  );
};

export default SummaryFilters;