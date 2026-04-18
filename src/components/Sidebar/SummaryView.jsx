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
import PartnershipSessionReport from '../Summary/PartnershipSessionReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {getManagerBadgeStyle} from '@/utils/managerColors'
import useManager from '../../hooks/userManager';
const SummaryView = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedManager, setSelectedManager] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {fetchEmployeesByRole} = useManager();
  const [managers,setManagers] = useState([])
  
  useEffect(()=>{
    const fetchManagers = async() =>{
      const data = await fetchEmployeesByRole('manager');
      setManagers(data)
    }
    fetchManagers()
  },[])
  const { 
    sessions, 
    sessionsLoading, 
    sessionsError, 
    fetchSessions,
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
                    <SelectItem key={manager._id} value={manager.name}>
                      <Badge 
                        style={getManagerBadgeStyle(manager.name)}
                        className="font-medium"
                      >
                        {manager.name}
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

          <Tabs defaultValue="sessions" className="w-full">
            <TabsList>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="partnership">Partnership</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="pt-4">
              <RegisterSessionsTable 
                sessions={sessions}
                onViewSession={handleViewSession}
              />
            </TabsContent>

            <TabsContent value="partnership" className="pt-4">
              <PartnershipSessionReport sessions={sessions} />
            </TabsContent>
          </Tabs>
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