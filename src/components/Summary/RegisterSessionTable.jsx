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
import { Eye, Calendar, Clock, User } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

const RegisterSessionsTable = ({ sessions, onViewSession }) => {
  const formatDateRange = (openedAt, closedAt) => {
    if (!openedAt) return 'N/A';
    
    const openDate = new Date(openedAt);
    const closeDate = closedAt ? new Date(closedAt) : null;
    
    if (!closeDate) {
      return format(openDate, 'dd MMM yyyy');
    }
    
    // If same day, show only one date
    if (isSameDay(openDate, closeDate)) {
      return format(openDate, 'dd MMM yyyy');
    }
    
    // If different days, show range
    return `${format(openDate, 'dd MMM')} - ${format(closeDate, 'dd MMM yyyy')}`;
  };

  const formatTimeRange = (openedAt, closedAt) => {
    if (!openedAt) return 'N/A';
    
    const openTime = format(new Date(openedAt), 'h:mm a');
    const closeTime = closedAt ? format(new Date(closedAt), 'h:mm a') : 'Open';
    
    return `${openTime} - ${closeTime}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0);
  };

  // Function to get manager badge color
  const getManagerBadgeVariant = (manager) => {
    const colors = {
      'Hamza': 'default',
      'Wajeeh': 'secondary', 
      'Talal': 'outline'
    };
    return colors[manager] || 'default';
  };

  // Function to get manager badge style
  const getManagerBadgeStyle = (manager) => {
    const styles = {
      'Hamza': { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }, // Red
      'Wajeeh': { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }, // Green
      'Talal': { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' } // Blue
    };
    return styles[manager] || {};
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No register sessions found for the selected filters.
      </div>
    );
  }

  return (
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
  );
};

export default RegisterSessionsTable;