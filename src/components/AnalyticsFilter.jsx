import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import useRegister from '@/hooks/useRegister';

const AnalyticsFilters = ({ filters, onFiltersChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableSessions, setAvailableSessions] = useState([]);
  const { registerData } = useRegister();

  useEffect(() => {
    // Fetch available register sessions for filtering
    fetchAvailableSessions();
  }, []);

  const fetchAvailableSessions = async () => {
    try {
      // This would be an API call to get all register sessions
      // For now, we'll use mock data
      setAvailableSessions([
        { id: 'session-1', date: '2024-01-15', sessionId: 'abc123' },
        { id: 'session-2', date: '2024-01-16', sessionId: 'def456' },
        // Add more sessions
      ]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const periods = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'quarterly', label: 'This Quarter' },
    { key: 'yearly', label: 'This Year' }
  ];

  const handlePeriodChange = (period) => {
    onFiltersChange({
      ...filters,
      period,
      dateRange: { start: null, end: null }, // Clear custom range when period changes
      sessionId: null // Clear session filter
    });
  };

  const handleSessionChange = (sessionId) => {
    onFiltersChange({
      ...filters,
      sessionId: sessionId === 'all' ? null : sessionId,
      period: 'all', // Reset period when filtering by session
      dateRange: { start: null, end: null }
    });
  };

  const handleDateSelect = (date) => {
    if (!filters.dateRange.start || (filters.dateRange.start && filters.dateRange.end)) {
      // Start new range
      onFiltersChange({
        ...filters,
        dateRange: { start: date, end: null },
        period: 'custom',
        sessionId: null
      });
    } else {
      // Complete the range
      const start = filters.dateRange.start;
      const end = date;
      onFiltersChange({
        ...filters,
        dateRange: {
          start: start < end ? start : end,
          end: start < end ? end : start
        },
        period: 'custom',
        sessionId: null
      });
      setIsCalendarOpen(false);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      period: 'all',
      dateRange: { start: null, end: null },
      sessionId: null
    });
  };

  const hasActiveFilters = filters.period !== 'all' || filters.sessionId || filters.dateRange.start;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter Analytics:</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <div className="flex gap-1">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={filters.period === period.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Or:</span>
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
                selected={filters.dateRange.start}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="p-3 border-t">
                <div className="text-sm text-muted-foreground mb-2">
                  {filters.dateRange.start && !filters.dateRange.end && "Select end date"}
                  {filters.dateRange.start && filters.dateRange.end && "Range selected"}
                  {!filters.dateRange.start && "Select start date"}
                </div>
                {filters.dateRange.start && (
                  <div className="text-xs">
                    From: {format(filters.dateRange.start, 'PPP')}
                    {filters.dateRange.end && (
                      <> to {format(filters.dateRange.end, 'PPP')}</>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Session Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Session:</span>
          <Select value={filters.sessionId || 'all'} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {availableSessions.map((session) => (
                <SelectItem key={session.sessionId} value={session.sessionId}>
                  {format(new Date(session.date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.period !== 'all' && (
            <Badge variant="secondary">
              {periods.find(p => p.key === filters.period)?.label}
            </Badge>
          )}
          {filters.sessionId && (
            <Badge variant="secondary">
              Session: {filters.sessionId.slice(-6)}
            </Badge>
          )}
          {filters.dateRange.start && filters.dateRange.end && (
            <Badge variant="secondary">
              {format(filters.dateRange.start, 'MMM d')} - {format(filters.dateRange.end, 'MMM d')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;