import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileSpreadsheet, FileText, HandCoins, PackageSearch, Percent, ShoppingCart } from 'lucide-react';
import {
  buildPartnershipSessionReport,
  downloadPartnershipSessionCsv,
  downloadPartnershipSessionPdf,
  formatPartnershipCurrency,
  formatPartnershipDateTime,
  getSessionOptionLabel,
} from '@/utils/partnershipSession';

const PartnershipSessionReport = ({ sessions }) => {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    if (!sessions?.length) {
      setSelectedSessionId('');
      return;
    }

    const hasSelectedSession = sessions.some((session) => session._id === selectedSessionId);
    if (hasSelectedSession) {
      return;
    }

    const preferredSession = sessions.find((session) => buildPartnershipSessionReport(session).hasPartnershipSales) || sessions[0];
    setSelectedSessionId(preferredSession?._id || '');
  }, [sessions, selectedSessionId]);

  const selectedSession = sessions?.find((session) => session._id === selectedSessionId) || null;
  const report = buildPartnershipSessionReport(selectedSession);

  const handleOpenExportDialog = () => {
    if (!selectedSession || !report.hasPartnershipSales) {
      return;
    }

    setIsExportDialogOpen(true);
  };

  const handleExportCsv = () => {
    downloadPartnershipSessionCsv(selectedSession, report);
    setIsExportDialogOpen(false);
  };

  const handleExportPdf = () => {
    downloadPartnershipSessionPdf(selectedSession, report);
    setIsExportDialogOpen(false);
  };

  if (!sessions?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No register sessions available for the current filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Partnership Sales
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Review partnership-category sales per session and export line-item payout data.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger className="w-full md:min-w-[320px]">
                <SelectValue placeholder="Select register session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session._id} value={session._id}>
                    {getSessionOptionLabel(session)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleOpenExportDialog} disabled={!report.hasPartnershipSales}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {selectedSession && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={selectedSession.isOpen ? 'destructive' : 'secondary'}>
                {selectedSession.isOpen ? 'Open Session' : 'Closed Session'}
              </Badge>
              <span>{selectedSession.manager || 'Unknown manager'}</span>
              <span>Opened {formatPartnershipDateTime(selectedSession.openedAt)}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Orders With Partnership Items</div>
                <div className="mt-2 text-2xl font-semibold">{report.orderCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Partnership Quantity</div>
                <div className="mt-2 text-2xl font-semibold">{report.totalQuantity}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Partnership Base Sales</div>
                <div className="mt-2 text-2xl font-semibold">{formatPartnershipCurrency(report.grossSales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Our Share</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-700">{formatPartnershipCurrency(report.retainedSales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Partner Payout</div>
                <div className="mt-2 text-2xl font-semibold text-amber-700">{formatPartnershipCurrency(report.partnerPayout)}</div>
              </CardContent>
            </Card>
          </div>

          {!report.hasPartnershipSales ? (
            <div className="rounded-lg border border-dashed px-6 py-10 text-center text-muted-foreground">
              <PackageSearch className="mx-auto mb-3 h-8 w-8" />
              No partnership-category items were sold in this session.
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Item Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[1070px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[320px] whitespace-nowrap">Item</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap">Category</TableHead>
                            <TableHead className="w-[90px] whitespace-nowrap text-right">Share %</TableHead>
                            <TableHead className="w-[80px] whitespace-nowrap text-right">Qty</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap text-right">Base Sales</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap text-right">Our Share</TableHead>
                            <TableHead className="w-[160px] whitespace-nowrap text-right">Partner Payout</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.itemSummaries.map((item) => (
                            <TableRow key={`${item.itemLabel}-${item.sharePercent}`}>
                              <TableCell className="font-medium">
                                <div className="whitespace-nowrap">{item.itemLabel}</div>
                                {item.addOnAmount > 0 && (
                                  <div className="text-xs text-muted-foreground">Extras on us: {formatPartnershipCurrency(item.addOnAmount)}</div>
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{item.categoryName}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{item.sharePercent}%</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{item.quantity}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{formatPartnershipCurrency(item.grossSales)}</TableCell>
                              <TableCell className="whitespace-nowrap text-right text-emerald-700">{formatPartnershipCurrency(item.retainedSales)}</TableCell>
                              <TableCell className="whitespace-nowrap text-right text-amber-700">{formatPartnershipCurrency(item.partnerPayout)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-4 w-4" />
                    Partnership Order Lines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[1420px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px] whitespace-nowrap">Ordered At</TableHead>
                            <TableHead className="w-[110px] whitespace-nowrap">Order #</TableHead>
                            <TableHead className="w-[360px] whitespace-nowrap">Item</TableHead>
                            <TableHead className="w-[100px] whitespace-nowrap">Payment</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap text-right">Receipt Total</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap text-right">Line Sales</TableHead>
                            <TableHead className="w-[90px] whitespace-nowrap text-right">Share %</TableHead>
                            <TableHead className="w-[140px] whitespace-nowrap text-right">Our Share</TableHead>
                            <TableHead className="w-[160px] whitespace-nowrap text-right">Partner Payout</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.lineItems.map((lineItem) => (
                            <TableRow key={lineItem.id}>
                              <TableCell className="whitespace-nowrap">{formatPartnershipDateTime(lineItem.orderedAt)}</TableCell>
                              <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">{lineItem.orderNumber}</TableCell>
                              <TableCell className="font-medium">
                                <div className="whitespace-nowrap">{`${lineItem.itemLabel} (${lineItem.categoryName}, Qty ${lineItem.quantity})`}</div>
                                {lineItem.addOnAmount > 0 && (
                                  <div className="text-xs text-muted-foreground">Extras on us: {formatPartnershipCurrency(lineItem.addOnAmount)}</div>
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap capitalize">{lineItem.paymentType}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{formatPartnershipCurrency(lineItem.receiptTotal)}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{formatPartnershipCurrency(lineItem.grossSales)}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">
                                <span className="inline-flex items-center gap-1">
                                  <Percent className="h-3 w-3" />
                                  {lineItem.sharePercent}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-emerald-700">{formatPartnershipCurrency(lineItem.retainedSales)}</TableCell>
                              <TableCell className="whitespace-nowrap text-right text-amber-700">{formatPartnershipCurrency(lineItem.partnerPayout)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Export Format</DialogTitle>
            <DialogDescription>
              Export the selected partnership session as a CSV spreadsheet or a structured PDF settlement statement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 gap-3 py-2">
            <Button variant="outline" className="h-auto min-w-0 w-full shrink basis-auto items-start justify-start gap-3 whitespace-normal px-4 py-4 text-left" onClick={handleExportCsv}>
              <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                <span className="block font-medium">CSV</span>
                <span className="block whitespace-normal text-xs text-muted-foreground">Spreadsheet-ready export with item and order-line breakdowns.</span>
              </span>
            </Button>

            <Button variant="outline" className="h-auto min-w-0 w-full shrink basis-auto items-start justify-start gap-3 whitespace-normal px-4 py-4 text-left" onClick={handleExportPdf}>
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
              <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                <span className="block font-medium">PDF</span>
                <span className="block whitespace-normal text-xs text-muted-foreground">Invoice-style settlement document with session summary, item totals, and order lines.</span>
              </span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnershipSessionReport;