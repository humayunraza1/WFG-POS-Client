import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calculator
} from 'lucide-react';

// Add this component to your Report.jsx file
const FinancialDiscrepancyChart = ({ sessions }) => {
  if (!sessions || sessions.length === 0) return null;

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return 'PKR 0';
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate discrepancies for each session
  const sessionsWithDiscrepancies = sessions.map(session => {
    const closingBalance = session.closingBalance || 0;
    const expectedBalance = session.expectedBalance || 0;
    const discrepancy = closingBalance - expectedBalance;
    
    return {
      ...session,
      discrepancy,
      discrepancyType: discrepancy > 0 ? 'excess' : discrepancy < 0 ? 'shortage' : 'balanced'
    };
  });

  // Calculate totals
  const totalDiscrepancy = sessionsWithDiscrepancies.reduce((sum, session) => sum + session.discrepancy, 0);
  const totalSessions = sessionsWithDiscrepancies.length;
  const balancedSessions = sessionsWithDiscrepancies.filter(s => s.discrepancy === 0).length;
  const excessSessions = sessionsWithDiscrepancies.filter(s => s.discrepancy > 0).length;
  const shortageSessions = sessionsWithDiscrepancies.filter(s => s.discrepancy < 0).length;

  const getDiscrepancyIcon = (type) => {
    switch (type) {
      case 'excess':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'shortage':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDiscrepancyBadge = (type, amount) => {
    switch (type) {
      case 'excess':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">+{formatCurrency(Math.abs(amount))}</Badge>;
      case 'shortage':
        return <Badge variant="destructive">-{formatCurrency(Math.abs(amount))}</Badge>;
      default:
        return <Badge variant="outline">Balanced</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Financial Discrepancy Analysis
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Sessions</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{totalSessions}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Balanced</span>
            </div>
            <p className="text-lg font-bold text-green-900">{balancedSessions}</p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Excess</span>
            </div>
            <p className="text-lg font-bold text-amber-900">{excessSessions}</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Shortage</span>
            </div>
            <p className="text-lg font-bold text-red-900">{shortageSessions}</p>
          </div>
        </div>
        
        {/* Overall Discrepancy Summary */}
        <div className={`p-4 rounded-lg border-2 mt-4 ${
          totalDiscrepancy > 0 
            ? 'bg-green-50 border-green-200' 
            : totalDiscrepancy < 0 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {totalDiscrepancy > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : totalDiscrepancy < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-gray-600" />
              )}
              <span className="font-semibold">Overall Cash Discrepancy:</span>
            </div>
            <div className={`text-xl font-bold ${
              totalDiscrepancy > 0 
                ? 'text-green-600' 
                : totalDiscrepancy < 0 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {totalDiscrepancy > 0 ? '+' : ''}{formatCurrency(totalDiscrepancy)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {totalDiscrepancy > 0 
              ? 'Extra cash reported across all sessions' 
              : totalDiscrepancy < 0 
                ? 'Cash shortage across all sessions' 
                : 'All sessions balanced perfectly'}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {sessionsWithDiscrepancies.map((session, index) => (
              <div key={session.sessionId || index} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getDiscrepancyIcon(session.discrepancyType)}
                    <div>
                      <h3 className="font-semibold">{session.manager || 'Unknown Manager'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.openedAt)} • {formatTime(session.openedAt)}
                        {session.closedAt && ` - ${formatDate(session.closedAt)} • ${formatTime(session.closedAt)}`}
                      </p>
                    </div>
                  </div>
                  {getDiscrepancyBadge(session.discrepancyType, session.discrepancy)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-blue-700 font-medium mb-1">Expected Balance:</p>
                    <p className="text-blue-900 font-semibold">{formatCurrency(session.expectedBalance)}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-purple-700 font-medium mb-1">Actual Closing:</p>
                    <p className="text-purple-900 font-semibold">{formatCurrency(session.closingBalance)}</p>
                  </div>
                  
                  <div className={`p-3 rounded-md ${
                    session.discrepancyType === 'excess' 
                      ? 'bg-green-50' 
                      : session.discrepancyType === 'shortage' 
                        ? 'bg-red-50' 
                        : 'bg-gray-50'
                  }`}>
                    <p className={`font-medium mb-1 ${
                      session.discrepancyType === 'excess' 
                        ? 'text-green-700' 
                        : session.discrepancyType === 'shortage' 
                          ? 'text-red-700' 
                          : 'text-gray-700'
                    }`}>
                      Discrepancy:
                    </p>
                    <p className={`font-semibold ${
                      session.discrepancyType === 'excess' 
                        ? 'text-green-900' 
                        : session.discrepancyType === 'shortage' 
                          ? 'text-red-900' 
                          : 'text-gray-900'
                    }`}>
                      {session.discrepancy > 0 ? '+' : ''}{formatCurrency(session.discrepancy)}
                    </p>
                  </div>
                </div>
                
                {session.discrepancy !== 0 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">
                        {session.discrepancyType === 'excess' 
                          ? 'Cash surplus needs investigation' 
                          : 'Cash shortage needs investigation'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FinancialDiscrepancyChart;