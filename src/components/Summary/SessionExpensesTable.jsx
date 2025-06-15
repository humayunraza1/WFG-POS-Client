import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

const SessionExpensesTable = ({ expenses }) => {
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'h:mm a');
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses found for this session.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block border rounded-md">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Name
                  </div>
                </TableHead>
                <TableHead className="text-right w-[120px]">
                  <div className="flex items-center gap-2 justify-end">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell className="text-sm">
                    {formatDateTime(expense.dateAdded || expense.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.name || 'No name provided'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <Card key={expense._id} className="border">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <div className="font-medium text-sm">
                    {expense.name || 'No name provided'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(expense.dateAdded || expense.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {formatCurrency(expense.amount)}
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

export default SessionExpensesTable;