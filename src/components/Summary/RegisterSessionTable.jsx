import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Calendar, Clock, User, DollarSign } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { getManagerBadgeStyle } from '@/utils/managerColors'; // Import the utility

const RegisterSessionsTable = ({ sessions, onViewSession }) => {
  const formatDateRange = (openedAt, closedAt) => {
    if (!openedAt) return 'N/A';
    
    const openDate = new Date(openedAt);
    const closeDate = closedAt ? new Date(closedAt) : null;
    
    if (!closeDate) {
      return format(openDate, 'dd MMM yyyy');
    }
    
    if (isSameDay(openDate, closeDate)) {
      return format(openDate, 'dd MMM yyyy');
    }
    
    return `${format(openDate, 'dd MMM')} - ${format(closeDate, 'dd MMM yyyy')}`;
  };

  const formatTimeRange = (openedAt, closedAt) => {
    if (!openedAt) return 'N/A';
    
    const openTime = format(new Date(openedAt), 'h:mm a');
    const closeTime = closedAt ? format(new Date(closedAt), 'h:mm a') : 'Open';
    
    return `${openTime} - ${closeTime}`;
  };

  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No register sessions found for the selected filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manager
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell className="font-medium">
                      {formatDateRange(session.openedAt, session.closedAt)}
                    </TableCell>
                    <TableCell>
                      {formatTimeRange(session.openedAt, session.closedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={getManagerBadgeStyle(session.manager)}
                        className="font-medium"
                      >
                        {session.manager}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.isOpen ? 'destructive' : 'default'}>
                        {session.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(session.totalSales)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSession(session)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sessions.map((session) => (
          <Card key={session._id} className="border">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {formatDateRange(session.openedAt, session.closedAt)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange(session.openedAt, session.closedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.isOpen ? 'destructive' : 'default'}>
                    {session.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSession(session)}
                    className="h-8 px-3"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Manager
                  </div>
                  <Badge 
                    style={getManagerBadgeStyle(session.manager)}
                    className="font-medium text-xs"
                  >
                    {session.manager}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total Sales
                  </div>
                  <div className="font-medium">
                    {formatCurrency(session.totalSales)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default RegisterSessionsTable;