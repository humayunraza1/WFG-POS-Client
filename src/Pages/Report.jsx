import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  Package2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useReports from '@/hooks/useReports'
import FinancialDiscrepancyChart from '../components/FinancialDiscrepancy';
const Report = () => {
  const { id: reportId } = useParams();
  const navigate = useNavigate();

  const {
    currentReport,
    isFetching,
    error,
    fetchReportById,
    clearError
  } = useReports();


  // Function to export as PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Function to update document title and meta tags
  const updateDocumentMeta = (startDate, endDate) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    // Update document title
    document.title = "The Waffle Guy - Report Dashboard";
    
    // Update or create meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = `Report from ${formattedStartDate} to ${formattedEndDate}`;
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = descriptionContent;
      document.head.appendChild(newMetaDescription);
    }

    // Update or create og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', "The Waffle Guy's - Report Dashboard");
    } else {
      const newOgTitle = document.createElement('meta');
      newOgTitle.setAttribute('property', 'og:title');
      newOgTitle.content = "The Waffle Guy's - Report Dashboard";
      document.head.appendChild(newOgTitle);
    }

    // Update or create og:description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', descriptionContent);
    } else {
      const newOgDescription = document.createElement('meta');
      newOgDescription.setAttribute('property', 'og:description');
      newOgDescription.content = descriptionContent;
      document.head.appendChild(newOgDescription);
    }

    // Update or create twitter:title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', "The Waffle Guy's - Report Dashboard");
    } else {
      const newTwitterTitle = document.createElement('meta');
      newTwitterTitle.name = 'twitter:title';
      newTwitterTitle.content = "The Waffle Guy's - Report Dashboard";
      document.head.appendChild(newTwitterTitle);
    }

    // Update or create twitter:description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', descriptionContent);
    } else {
      const newTwitterDescription = document.createElement('meta');
      newTwitterDescription.name = 'twitter:description';
      newTwitterDescription.content = descriptionContent;
      document.head.appendChild(newTwitterDescription);
    }
  };

  // Function to restore original meta tags when leaving the page
  const restoreOriginalMeta = () => {
    // Restore original title (you can customize this)
    document.title = "The Waffle Guy's";
    
    // Restore original meta description (you can customize this)
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "The Waffle Guy's - Premium Waffles & Delicious Treats");
    }
  };

  useEffect(() => {
    const loadReport = async () => {
      if (reportId) {
        try {
          await fetchReportById(reportId);
        } catch (err) {
          console.error('Failed to fetch report:', err);
          // Error will be handled by the error useEffect below
        }
      } else {
        // If no report ID, redirect to reports list
        navigate('/dashboard');
      }
    };

    loadReport();

    // Cleanup function to restore original meta tags when component unmounts
    return () => {
      restoreOriginalMeta();
    };
  }, [reportId]); // Removed fetchReportById and navigate from dependencies

  // Update meta tags when report data is loaded
  useEffect(() => {
    if (currentReport && currentReport.startDate && currentReport.endDate) {
      updateDocumentMeta(currentReport.startDate, currentReport.endDate);
    }
  }, [currentReport]);

  // Show error toasts
  useEffect(() => {
    if (error) {
      console.error('Report Error:', error);
      setError(null);
    }
  }, [error]);

  const handleBackToReports = () => {
    //console.log('Navigate back to dashboard');
  };

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

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return 'PKR 0';
    return `PKR ${amount.toLocaleString()}`;
  };

  // Report Summary Stats Component
  const ReportStats = ({ summary }) => {
    if (!summary) return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 print:break-inside-avoid">
        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Sales</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold">{formatCurrency(summary.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Gross revenue</p>
          </CardContent>
        </Card>

        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Cash Received</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold">{formatCurrency(summary.totalCashReceived)}</div>
            <p className="text-xs text-muted-foreground">Cash payments</p>
          </CardContent>
        </Card>

        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Digital Payments</CardTitle>
            <CreditCard className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold">{formatCurrency(summary.totalOnlinePayments)}</div>
            <p className="text-xs text-muted-foreground">Digital transfers</p>
          </CardContent>
        </Card>

        <Card className="min-h-32 bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-red-800">Outstanding</CardTitle>
            <AlertCircle className="h-3 w-3 text-red-600" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold text-red-600">{formatCurrency(summary.totalOutstanding)}</div>
            <p className="text-xs text-red-600">Pending payment</p>
          </CardContent>
        </Card>

        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold">{summary.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Order count</p>
          </CardContent>
        </Card>

        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold text-green-600">{formatCurrency(summary.netRevenue)}</div>
            <p className="text-xs text-muted-foreground">After expenses</p>
          </CardContent>
        </Card>

        <Card className="min-h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-3 w-3 text-red-600" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Business costs</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Manager Performance Component (No scroll)
  const ManagerPerformance = ({ salesByManager }) => {
    if (!salesByManager || Object.keys(salesByManager).length === 0) return null;
    
    return (
      <Card className="mb-6 print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manager Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(salesByManager).map(([manager, stats]) => (
              <Card key={manager} className="border-2 print:break-inside-avoid">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{manager}</h3>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Sales:</span>
                      <span className="font-medium">{formatCurrency(stats.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cash Received:</span>
                      <span className="font-medium">{formatCurrency(stats.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Digital Received:</span>
                      <span className="font-medium">{formatCurrency(stats.onlineReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sessions:</span>
                      <span className="font-medium">{stats.sessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Orders:</span>
                      <span className="font-medium">{stats.orders || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Product Performance Component (No scroll, shows all products)
  const ProductPerformance = ({ productSummary }) => {
    if (!productSummary || productSummary.length === 0) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="print:break-inside-avoid">
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Top Products (by quantity sold)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {productSummary.map((product, index) => (
              <div key={`${product.productId}-${product.variantId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg print:break-inside-avoid">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product.productName || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">{product.variantName || 'Default Variant'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.quantitySold || 0} sold</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  // No report found or error state
  if (!currentReport && !isFetching) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {error ? 'Failed to load report' : 'Report not found'}
          </p>
          <Button onClick={handleBackToReports} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  // Main render when report is loaded
  return (
    <>
      {/* Add print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:break-before-page { break-before: page; }
          @page { margin: 0.5in; }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header with Logo and Back Button */}
          <div className="bg-white rounded-lg shadow-sm border p-6 print:break-inside-avoid">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <Button
                variant="outline"
                onClick={handleBackToReports}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
              <Button
                onClick={handleExportPDF}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <img src="/images/wfg-logo.png" alt="Waffle Guy Logo" className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">The Waffle Guy's Report</h1>
                <p className="text-sm text-gray-600">
                  {formatDate(currentReport.startDate)} to {formatDate(currentReport.endDate)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Generated on {formatDate(currentReport.createdAt)}
              </p>
            </div>
          </div>

          {/* Report Stats */}
          <ReportStats summary={currentReport.summary} />

          {/* Manager Performance */}
          <ManagerPerformance salesByManager={currentReport.salesByManager} />

          {/* Product Performance */}
          <ProductPerformance productSummary={currentReport.productSummary} />

          <div className="print:break-before-page">
            {/* FinancialDiscrepancyChart would go here - replace with your actual chart component */}
                <FinancialDiscrepancyChart sessions={currentReport.sessions} />

          </div>
          
          {/* Sessions Summary */}
          <Card className="shadow-sm print:break-before-page">
            <CardHeader className="print:break-inside-avoid">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Register Sessions ({currentReport.sessions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentReport.sessions && currentReport.sessions.length > 0 ? (
                  currentReport.sessions.map((session, index) => (
                    <div key={session.sessionId || index} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors print:break-inside-avoid">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">Manager: {session.manager || 'Unknown'}</h3>
                        <Badge variant={session.isOpen ? "destructive" : "secondary"}>
                          {session.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-blue-700 font-medium mb-1">Session Opened:</p>
                          <p className="text-blue-900 font-semibold">{formatDateTime(session.openedAt)}</p>
                        </div>
                        {session.closedAt && (
                          <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-green-700 font-medium mb-1">Session Closed:</p>
                            <p className="text-green-900 font-semibold">{formatDateTime(session.closedAt)}</p>
                          </div>
                        )}
                        <div className="bg-emerald-50 p-3 rounded-md">
                          <p className="text-emerald-700 font-medium mb-1">Total Sales:</p>
                          <p className="text-emerald-900 font-semibold">{formatCurrency(session.totalSales)}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-red-700 font-medium mb-1">Total Expenses:</p>
                          <p className="text-red-900 font-semibold">{formatCurrency(session.totalExpenses)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No sessions found for this report</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Report;