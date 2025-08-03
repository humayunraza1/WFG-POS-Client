import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronDown, 
  ChevronRight, 
  DollarSign, 
  ShoppingCart, 
  Calculator,
  Package2,
  BarChart3,
  Receipt,
  Plus,
  Edit3,
  Power,
  LogOut,
  Minus,
  Trash2,
  Menu,
  X,
  Loader2,
  History,
  Monitor,
  Clock,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import SummaryView from '../components/Sidebar/SummaryView';
import ExpensesView from '../components/Sidebar/ExpensesView';
import AllReports from '../components/Sidebar/AllReport';
import ProductManagement from '../components/Sidebar/ProductManagement';
import DashboardStats from '../components/DashboardStats';
import Cart from '../components/Cart';
import Sidebar from '../components/SideBar';
import MobileSidebar from '../components/Mobile/MobileSidebar';
import ActiveRegisters from '../components/ActiveRegisters';
import RegisterSummary from '../components/RegisterSummary';
import useExpenses from '../hooks/useExpenses';
import OrdersTableView from '../components/OrdersTableView';
import useProducts from '../hooks/useProducts';
import OrdersHistory from '../components/Sidebar/OrderHistory';
import useManager from '../hooks/userManager';
import EmployeesTable from '../components/EmployeesTable';
import BranchTable from '../components/BranchTable';
import AccountsTable from '../components/AccountsTable';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { updatePayment } from '../features/orders/ordersSlice';

// Main Dashboard Component
const ManagerDashboard = () => {
    const { user } = useSelector((state)=>state.auth)
    const dispatch = useDispatch();
    const {isLoading:registerLoading,sessionId,registerData,isOpen:isRegisterOpen} = useSelector((state)=>state.register)
    const [activeView, setActiveView] = useState('dashboard');
    const [activeSubView, setActiveSubView] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [showRegisters, setShowRegisters] = useState(true)
    const {
      products,
      fetchProducts
    } = useProducts();

    const {
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      expensesLoading
    } = useExpenses();

    // Use the manager hook for register management
    const {
      summary: registerSummary,
      activeRegisters,
      loading: managerLoading,
      error: managerError,
      fetchSummary: fetchRegisterSummary,
      fetchActiveRegisters,
      allEmployees,
      fetchEmployees
    } = useManager();

    // Separate loading state for register summary
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Fetch products initially
    useEffect(() => {
      fetchProducts();
    }, []);

    // Fetch active registers on component mount
    useEffect(() => {
      fetchActiveRegisters();
    }, []);

    // Close mobile sidebar when screen size changes to desktop
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024 && isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [isMobileSidebarOpen]);

    // Handle register selection
    const handleRegisterClick = async (sessionId) => {
      setSelectedSessionId(sessionId);
      setSummaryLoading(true);
      try {
        await fetchRegisterSummary(sessionId);
      } finally {
        setSummaryLoading(false);
      }
    };

    // Handle view all summary
    const handleGetAllSummary = async () => {
      setSelectedSessionId(null);
      setSummaryLoading(true);
      try {
        await fetchRegisterSummary();
      } finally {
        setSummaryLoading(false);
      }
    };

    const handleViewChange = (view, subView = null) => {
      const dontShow = ['employees','manage-product','accounts','history','reports']
      if (dontShow.includes(view)){
        setShowRegisters(false)
      }else{
        setShowRegisters(true)
      }
      console.log("view: ", view)
      setActiveView(view);
      setActiveSubView(subView);
    };

    // Payment update handler
    const handleUpdatePayment = async (orderId, amount) => {
      try {
        const result = await dispatch(updatePayment({orderId, amountReceived:amount}));
        if(result.meta.message == 'fulfilled'){

          toast.success('Payment updated successfully', {
            description: result.message
          });
        }else{
          toast.error('Error updating order payment')
        }
          
        // Refresh register summary if viewing register data
        if (selectedSessionId || activeView === 'registers') {
          setSummaryLoading(true);
          try {
            await fetchRegisterSummary(selectedSessionId);
          } finally {
            setSummaryLoading(false);
          }
        }
        
        return result;
      } catch (error) {
        toast.error('Failed to update payment', {
          description: error.message
        });
        throw error;
      }
    };

    // Expense handlers
    const handleAddExpense = async (expenseData,sessionId) => {
      try {
        const result = await addExpense(expenseData,sessionId);
        
        // Refresh register summary if viewing register data
        if (selectedSessionId || activeView === 'registers') {
          setSummaryLoading(true);
          try {
            await fetchRegisterSummary(selectedSessionId);
          } finally {
            setSummaryLoading(false);
          }
        }
        
        return result;
      } catch (error) {
        throw error;
      }
    };

    const handleUpdateExpense = async (id, expenseData) => {
      try {
        const result = await updateExpense(id, expenseData);
        
        // Refresh register summary if viewing register data
        if (selectedSessionId || activeView === 'registers') {
          setSummaryLoading(true);
          try {
            await fetchRegisterSummary(selectedSessionId);
          } finally {
            setSummaryLoading(false);
          }
        }
        
        return result;
      } catch (error) {
        throw error;
      }
    };

    const handleDeleteExpense = async (id) => {
      try {
        const result = await deleteExpense(id);
        
        // Refresh register summary if viewing register data
        if (selectedSessionId || activeView === 'registers') {
          fetchRegisterSummary(selectedSessionId);
        }
        
        return result;
      } catch (error) {
        throw error;
      }
    };

    const handleLogout = async () => {
      try {
        dispatch(logout())
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const renderMainContent = () => { 
      if (isLoading) {
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      }

      switch(activeView) {
        case 'registers':
          return (
            <RegisterSummary
              summary={registerSummary}
              loading={summaryLoading}
              selectedSessionId={selectedSessionId}
            />
          );
        
        case 'branch':
          return <BranchTable user = {user}/>

        case 'accounts':
          return <AccountsTable user={user}/>
        case 'employees':
          return (
            <EmployeesTable
              employees={allEmployees}
              isLoading={managerLoading}
              user={user}
            />
          );
        
        case 'expenses':
          return (
            <ExpensesView 
              expenses={expenses}
              addExpense={handleAddExpense}
              sessionId = {selectedSessionId}
              updateExpense={handleUpdateExpense}
              deleteExpense={handleDeleteExpense}
              isLoading={expensesLoading}
            />
          );

        case 'reports':
          return <AllReports />;

        case 'orders':
          const filteredOrders = registerSummary?.orders || [];
          return (
            <div className="space-y-4">
              {/* Header showing which register's orders are being displayed */}
              {selectedSessionId && (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Register Orders</h3>
                    <p className="text-sm text-muted-foreground">
                      Showing orders from session: {selectedSessionId.slice(-8)}...
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {filteredOrders.length} Orders
                  </Badge>
                </div>
              )}
              
              <OrdersTableView 
                orders={filteredOrders}
                onRefresh={selectedSessionId && fetchRegisterSummary(selectedSessionId)}
                onUpdatePayment={handleUpdatePayment}
                isLoading={summaryLoading}
                selectedSessionId={selectedSessionId}
              />
            </div>
          );

        case 'history':
          return activeSubView == 'Orders History' ?  
            <OrdersHistory 
              onUpdatePayment={handleUpdatePayment}
              />:
          <SummaryView />;

        case 'manage-product':
          return <ProductManagement />;
        
        default:
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Welcome to your POS Manager Dashboard. Use the sidebar to navigate between different sections.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleViewChange('registers')}
                >
                  <CardContent className="p-6 text-center">
                    <Monitor className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">Active Registers</h3>
                    <p className="text-sm text-muted-foreground">Monitor active cash registers</p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleViewChange('summary', 'All Orders')}
                >
                  <CardContent className="p-6 text-center">
                    <History className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">View History</h3>
                    <p className="text-sm text-muted-foreground">Check Register History</p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleViewChange('expenses')}
                >
                  <CardContent className="p-6 text-center">
                    <Receipt className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">Manage Expenses</h3>
                    <p className="text-sm text-muted-foreground">Track business expenses</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
      }
    };
  
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Mobile Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src='/images/wfg-logo.png' className='h-25 w-25' alt="Logo" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">POS Manager Dashboard</h1>
                <p className="text-muted-foreground">Manage your point of sale operations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Card */}
              {user && (
                <Card className="border-0 h-15 bg-muted/50 hidden lg:block">
                  <CardContent className="p-2 h-full flex items-center">
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground leading-tight truncate">
                          Logged in as
                        </p>
                        <p className="font-semibold text-xs leading-tight truncate">
                          {user.username}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                        title="Logout"
                      >
                        <LogOut className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mobile Controls */}
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Layout */}
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar 
                user={user}
                activeView={activeView}
                onViewChange={handleViewChange}
              />
            </div>
            
            {/* Main Content - Dynamic width based on view */}
            <div className={`flex-1 ${!showRegisters ? 'w-full' : 'max-w-4xl'}`}>
              <div className={`${!showRegisters ? 'w-full mx-auto' : ''}`}>
                {renderMainContent()}
              </div>
            </div>

            {/* Right Sidebar - Only show for non-employees views */}
            {showRegisters && (
              <ActiveRegisters 
                activeRegisters={activeRegisters} 
                handleGetAllSummary={handleGetAllSummary} 
                selectedSessionId={selectedSessionId} 
                handleRegisterClick={handleRegisterClick} 
                setActiveView={setActiveView} 
                managerLoading={managerLoading}
              />
            )}
          </div>
          
          {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            activeView={activeView}
            onViewChange={handleViewChange}
            products={products}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  };
  
  export default ManagerDashboard;