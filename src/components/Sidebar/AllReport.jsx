import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/DateRangepicker';
import { 
  FileText, 
  Loader2,
  ExternalLink,
  Download,
  Plus,
  Filter,
  Calendar,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useReports from '@/hooks/useReports';

const AllReports = () => {
  const {
    reports,
    isLoading,
    isGenerating,
    error,
    fetchReports,
    generateReport,
    clearError
  } = useReports();

  const [dateRange, setDateRange] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('30days');

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Set default date range to 30 days when component mounts
  useEffect(() => {
    const range = getPresetDateRange('30days');
    setDateRange(range);
  }, []);

  // Show error toasts
  useEffect(() => {
    if (error) {
      toast.error('Reports Error', {
        description: error
      });
      clearError();
    }
  }, [error, clearError]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateForBackend = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPresetDateRange = (preset) => {
    const today = new Date();
    // Set end date to end of today (23:59:59)
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    let startDate;

    switch (preset) {
      case '3days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 3);
        break;
      case '1week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarterly':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'halfyear':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 180);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        return null;
    }

    // Set start date to beginning of day (00:00:00)
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);

    return { from: startDate, to: endOfToday };
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset === 'custom') {
      // Keep current dateRange for custom selection
    } else {
      const range = getPresetDateRange(preset);
      setDateRange(range);
    }
  };

  const handleGenerateReport = async () => {
    try {
      let startDate = null;
      let endDate = null;

      if (dateRange?.from) {
        // Ensure we're using the beginning of the day for start date
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        startDate = formatDateForBackend(fromDate);
      }
      
      if (dateRange?.to) {
        // Ensure we're using the end of the day for end date
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        endDate = formatDateForBackend(toDate);
      }

      //console.log('Sending to backend:', { startDate, endDate }); // Debug log

      await generateReport(startDate, endDate);
      toast.success('Report generated successfully');
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const handleViewReport = (reportId) => {
    // Open in new tab
    window.open(`/report/${reportId}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}

        {/* Generate Report Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate New Report
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select a time period to generate a comprehensive business report
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preset Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period for Report</label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3days">Last 3 Days</SelectItem>
                    <SelectItem value="1week">Last Week</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="quarterly">Last Quarter (90 days)</SelectItem>
                    <SelectItem value="halfyear">Last 6 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {selectedPreset === 'custom' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Custom Date Range for Report</label>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={setDateRange}
                    placeholder="Select date range for report"
                  />
                </div>
              )}
            </div>

            {/* Generate Report Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating || !dateRange}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Generate Report
                {dateRange && (
                  <span className="text-xs opacity-75">
                    ({formatDate(dateRange.from?.toISOString())} - {formatDate(dateRange.to?.toISOString())})
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center p-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No reports found</p>
                <p className="text-gray-400 text-sm">Generate your first report using the filters above</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">
                          {formatDateTime(report.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(report.startDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(report.endDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report._id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllReports;