import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

const DaySummaryModal = ({ isOpen, onClose, summary }) => {
  if (!summary) return null;

  const { itemSummary = [], absoluteTotal, totalDiscount, finalAmountSold } = summary;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Daily Summary Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Items Sold Table */}
          <div>
            <h3 className="font-medium mb-2">Items Sold</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Revenue (PKR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemSummary.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.totalCount}</TableCell>
                      <TableCell className="text-right">{item.totalRevenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 p-3 rounded">
              <p className="text-muted-foreground">Absolute Total</p>
              <p className="font-semibold text-lg">PKR {absoluteTotal.toLocaleString()}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded">
              <p className="text-muted-foreground">Discount Given</p>
              <p className="font-semibold text-lg text-red-600">- PKR {totalDiscount.toLocaleString()}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded col-span-2">
              <p className="text-muted-foreground">Final Amount Sold</p>
              <p className="font-semibold text-lg text-green-600">PKR {finalAmountSold.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DaySummaryModal;
