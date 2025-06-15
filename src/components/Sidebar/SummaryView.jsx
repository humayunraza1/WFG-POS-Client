import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3, User, Filter } from 'lucide-react';
import useRegister from '@/hooks/useRegister';
import DateRangeFilter from '../Summary/DateFilter';
import RegisterSessionsTable from '../Summary/RegisterSessionTable';
import SessionDetailDrawer from '../Summary/SessionDetailDrawer';

const SummaryView = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedManager, setSelectedManager] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { 
    sessions, 
    sessionsLoading, 
    sessionsError, 
    fetchSessions,
    managers,
    managersLoading
  } = useRegister();

  useEffect(() => {
    fetchSessions({
      ...dateRange,
      manager: selectedManager
    });
  }, [dateRange, selectedManager]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleManagerChange = (manager) => {
    setSelectedManager(manager);
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSession(null);
  };

  // Function to get manager badge style (same as in table)
  const getManagerBadgeStyle = (manager) => {
    const styles = {
      'Hamza': { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }, // Red
      'Wajeeh': { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }, // Green
      'Talal': { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' } // Blue
    };
    return styles[manager] || {};
  };

  if (sessionsLoading && !sessions.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading register sessions...</div>
        </CardContent>
      </Card>
    );
  }

  if (sessionsError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading sessions: {sessionsError}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Register Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Date Range Filter */}
            <div className="flex-1">
              <DateRangeFilter 
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
            
            {/* Manager Filter */}
            <div className="w-full lg:w-auto lg:min-w-[200px]">
              <Label htmlFor="manager-filter" className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Manager
              </Label>
              <Select
                value={selectedManager}
                onValueChange={handleManagerChange}
                disabled={managersLoading}
              >
                <SelectTrigger id="manager-filter">
                  <SelectValue>
                    {selectedManager === 'ALL' ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        All Managers
                      </div>
                    ) : (
                      <Badge 
                        style={getManagerBadgeStyle(selectedManager)}
                        className="font-medium"
                      >
                        {selectedManager}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      All Managers
                    </div>
                  </SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager} value={manager}>
                      <Badge 
                        style={getManagerBadgeStyle(manager)}
                        className="font-medium"
                      >
                        {manager}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results Summary */}
          {sessions.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              {selectedManager !== 'ALL' && ` for ${selectedManager}`}
              {(dateRange.start || dateRange.end) && (
                <>
                  {dateRange.start && dateRange.end
                    ? ` from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`
                    : dateRange.start
                    ? ` from ${dateRange.start.toLocaleDateString()}`
                    : ` until ${dateRange.end.toLocaleDateString()}`
                  }
                </>
              )}
            </div>
          )}
          
          <RegisterSessionsTable 
            sessions={sessions}
            onViewSession={handleViewSession}
          />
        </CardContent>
      </Card>

      <SessionDetailDrawer
        session={selectedSession}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default SummaryView;