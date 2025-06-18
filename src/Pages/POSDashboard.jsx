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
  History
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import VariantsView from '../components/Sidebar/VariantsView';
import SummaryView from '../components/Sidebar/SummaryView';
import ExpensesView from '../components/Sidebar/ExpensesView';
import ProductManagement from '../components/Sidebar/ProductManagement';
import DashboardStats from '../components/DashboardStats';
import Cart from '../components/Cart';
import Sidebar from '../components/SideBar';
import MobileSidebar from '../components/Mobile/MobileSidebar';
import MobileCart from '../components/Mobile/MobileCart';
import useRegister from '../hooks/useRegister';
import useOrders from '../hooks/useOrders';
import useExpenses from '../hooks/useExpenses';
import ProductsView from '../components/ProductsView';
import OrdersTableView from '../components/OrdersTableView';
import useProducts from '../hooks/useProducts';
import StartCashModal from '../components/StartCashModal';
import FinalCashModal from '../components/FinalCashModal';
import { useAuth } from '../hooks/useAuth';
import OrdersHistory from '../components/Sidebar/OrderHistory';

// Main Dashboard Component
const POSDashboard = () => {
    const { logout, user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [activeSubView, setActiveSubView] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
    const [showStartCashModal, setShowStartCashModal] = useState(false);
    const [showFinalCashModal, setShowFinalCashModal] = useState(false);
    const [isOpeningRegister, setIsOpeningRegister] = useState(false);
    const [isClosingRegister, setIsClosingRegister] = useState(false);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [discount, setDiscount] = useState(null);
    
    const {
      isOpen: isRegisterOpen,
      sessionId,
      registerData,
      isLoading: registerLoading,
      error: registerError,
      openRegister,
      closeRegister,
      checkRegisterStatus,
      managers,
      managersLoading,
      managersError
    } = useRegister();

    const {
      products,
      isLoading: productsLoading,
      error: productsError,
      fetchProducts
    } = useProducts();

    const {
      orders,
      allOrders,
      isLoading: ordersLoading,
      isLoadingAllOrders,
      error: ordersError,
      dailyStats,
      statsLoading,
      fetchOrders,
      fetchAllOrders,
      fetchDailyStats,
      addOrder,
      updatePayment
    } = useOrders(sessionId, isRegisterOpen, checkRegisterStatus);

    // Pass callback to expenses hook to refresh dashboard stats
    const {
      expenses,
      isLoading: expensesLoading,
      error: expensesError,
      fetchExpenses,
      addExpense,
      updateExpense,
      deleteExpense
    } = useExpenses(sessionId, isRegisterOpen);

    // Fetch products initially and when register opens
    useEffect(() => {
      fetchProducts();
    }, []);

    // Additional fetch when register opens to ensure fresh data
    useEffect(() => {
      if (isRegisterOpen && sessionId) {
        fetchProducts();
      }
    }, [isRegisterOpen, sessionId]);

    // Show error toasts when errors occur
    useEffect(() => {
      if (registerError) {
        toast.error('Register Error', {
          description: registerError
        });
      }
      if (productsError) {
        toast.error('Products Error', {
          description: productsError
        });
      }
      if (ordersError) {
        toast.error('Orders Error', {
          description: ordersError
        });
      }
      if (expensesError) {
        toast.error('Expenses Error', {
          description: expensesError
        });
      }
      if (managersError) {
        toast.error('Managers Error', {
          description: managersError
        });
      }
    }, [registerError, productsError, ordersError, expensesError, managersError]);

    // Function to check if operation requires active session
    const requiresActiveSession = (operation) => {
      if (!isRegisterOpen) {
        toast.error('Register Session Required', {
          description: `Please open the register to ${operation}`
        });
        return false;
      }
      return true;
    };

    const handleViewChange = (view, subView = null) => {
      // Check if view requires active session
      if (['orders', 'expenses'].includes(view)) {
        if (!requiresActiveSession(`access ${view}`)) {
          return;
        }
      }
      
      console.log(`Switching to view: ${view}`, subView);
      setActiveView(view);
      setActiveSubView(subView);
    };
    
    const handleOpenRegister = () => {
      if (isRegisterOpen) {
        toast.error('Register Already Open', {
          description: 'Please close the current session before opening a new one'
        });
        return;
      }
      setShowStartCashModal(true);
    };

    const handleStartCashSubmit = async (registerData) => {
      try {
        setIsOpeningRegister(true);
        await openRegister(registerData);
        toast.success('Register opened successfully', {
          description: `Manager: ${registerData.manager}, Starting cash: PKR ${registerData.startCash.toLocaleString()}`
        });
        setShowStartCashModal(false);
        
        // The useOrders and useExpenses hooks will automatically fetch fresh data
        // due to the sessionId change, so we don't need to manually call fetch here
      } catch (error) {
        toast.error('Failed to open register', {
          description: error.message
        });
      } finally {
        setIsOpeningRegister(false);
      }
    };
    
    const handleCloseRegister = () => {
      if (!isRegisterOpen) {
        toast.error('No Active Session', {
          description: 'There is no active register session to close'
        });
        return;
      }
      setShowFinalCashModal(true);
    };

    const handleFinalCashSubmit = async (finalCash) => {
      try {
        setIsClosingRegister(true);
        await closeRegister(finalCash);
        toast.success('Register closed successfully', {
          description: `Final cash: PKR ${finalCash.toLocaleString()}`
        });
        setShowFinalCashModal(false);
        
        // Clear cart items and switch to dashboard view
        setCartItems([]);
        setActiveView('dashboard');
        setActiveSubView(null);
      } catch (error) {
        toast.error('Failed to close register', {
          description: error.message
        });
      } finally {
        setIsClosingRegister(false);
      }
    };
    
    const handleAddToCart = (category, product) => {
      if (!requiresActiveSession('add items to cart')) {
        return;
      }
      console.log('product', product);
      console.log('category', category);

      const productId = category._id;
      const variantId = product._id;
      console.log(category);
      console.log(`Adding to cart: ${product.name} (ID: ${variantId}) from category ${category.name} (ID: ${productId})`);
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.varID === variantId);

        if (existingItem) {
          return prevItems.map(item =>
            item.varID === variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [
            ...prevItems,
            {
              prodID: productId,
              varID: variantId,
              name: product.name,
              price: product.price,
              category: category.name,
              quantity: 1
            }
          ];
        }
      });

      toast.success('Added to cart', {
        description: `${category.name} - ${product.name} added to cart`
      });
    };
    
    const handleUpdateQuantity = (variantId, newQuantity) => {
      console.log(`Updating quantity for variant ${variantId} to ${newQuantity}`);
      if (newQuantity === 0) {
        handleRemoveFromCart(variantId);
        return;
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.varID === variantId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    };
    
    const handleRemoveFromCart = (productId) => {
      console.log(`Removing item with ID ${productId} from cart`);
      console.log(cartItems)
      setCartItems(prevItems => prevItems.filter(item => item.varID !== productId));
      toast.success('Item removed from cart');
    };
    
    const handleClearCart = () => {
      setCartItems([]);
      toast.success('Cart cleared');
    };
    
    const handleCheckout = async (orderData) => {
      if (!requiresActiveSession('process orders')) {
        return;
      }

      console.log('Processing order:', orderData);
      setIsProcessingOrder(true);
      
      try {
        await addOrder(orderData);
        
        // Show success message with payment status
        const paymentStatus = orderData.outstandingPayment > 0 ? 'partial payment' : 'full payment';
        const description = orderData.outstandingPayment > 0 
          ? `Paid: PKR ${orderData.amountPaid.toLocaleString()}, Outstanding: PKR ${orderData.outstandingPayment.toLocaleString()}`
          : `Total: PKR ${orderData.finalPrice.toLocaleString()}`;
        
        toast.success(`Order processed successfully (${paymentStatus})`, {
          description: description
        });
        
        setCartItems([]);
        setDiscount(0);
        setIsCartSheetOpen(false);
        // Daily stats will be refreshed automatically in useOrders hook
      } catch (error) {
        toast.error('Failed to process order', {
          description: error.message
        });
        throw error; // Re-throw to let the cart component handle it
      } finally {
        setIsProcessingOrder(false);
      }
    };

    // New function to handle payment updates from orders table
    const handleUpdatePayment = async (orderId, amount) => {
      try {
        const result = await updatePayment(orderId, amount);
        toast.success('Payment updated successfully', {
          description: result.message
        });
        return result;
      } catch (error) {
        toast.error('Failed to update payment', {
          description: error.message
        });
        throw error;
      }
    };

    // Wrapped expense functions with session validation
    const handleAddExpense = async (expenseData) => {
      if (!requiresActiveSession('add expenses')) {
        return;
      }
      return await addExpense(expenseData);
    };

    const handleUpdateExpense = async (id, expenseData) => {
      if (!requiresActiveSession('update expenses')) {
        return;
      }
      return await updateExpense(id, expenseData);
    };

    const handleDeleteExpense = async (id) => {
      if (!requiresActiveSession('delete expenses')) {
        return;
      }
      return await deleteExpense(id);
    };

    const handleLogout = async () => {
      try {
        await logout();
        // Navigation to login page will be handled automatically by the auth context
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const calculateTotalExpenses = () => {
      return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const isLoading = registerLoading || productsLoading || ordersLoading || expensesLoading;
    
    // Check if we should show the checkout button
    const shouldShowCheckoutButton = (activeView === 'products' || activeView === 'variants') && totalItems > 0;

    const renderMainContent = () => {
      if (isLoading) {
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      }

      switch(activeView) {
        case 'variants':
          return activeSubView ? 
            <VariantsView 
              category={activeSubView} 
              products={activeSubView} 
              onAddToCart={handleAddToCart}
              onViewChange={handleViewChange}
            /> :
            <div className="text-center p-8">
              <p className="text-muted-foreground">Select a product category from the sidebar</p>
            </div>;
        
        case 'products':
          return <ProductsView onViewChange={handleViewChange} products={products}/>;
        
        case 'summary':
          return <SummaryView period={activeSubView || 'All Orders'} orders={orders} />;
        
        // case 'analysis':
        //   // Handle analysis view with sub-tabs
        //   return <AnalysisView activeTab={activeSubView} />;
        
        case 'expenses':
          if (!isRegisterOpen) {
            return (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Please open the register to manage expenses</p>
              </div>
            );
          }
          return (
            <ExpensesView 
              expenses={expenses}
              addExpense={handleAddExpense}
              updateExpense={handleUpdateExpense}
              deleteExpense={handleDeleteExpense}
              isLoading={expensesLoading}
            />
          );

        case 'orders':
          if (!isRegisterOpen) {
            return (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Please open the register to view orders</p>
              </div>
            );
          }
          return (
            <OrdersTableView 
              orders={orders} 
              onRefresh={fetchOrders}
              onUpdatePayment={handleUpdatePayment}
              isLoading={isLoading}
            />
          );

        case 'orders-history':
          return (
            <OrdersHistory 
              onUpdatePayment={handleUpdatePayment}
              fetchAllOrders={fetchAllOrders}
              allOrders={allOrders}
              isLoadingAllOrders={isLoadingAllOrders}
            />
          );

        case 'add-product':
        case 'edit-product':
          return <ProductManagement mode={activeView} />;
        
        default:
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Welcome to your POS system. Use the sidebar to navigate between different sections.
              </p>
              {!isRegisterOpen && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">Register Session Required</p>
                  <p className="text-yellow-700 text-sm">Please open the register to start processing orders and managing expenses.</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewChange('products', products)}>
                  <CardContent className="p-6 text-center">
                    <Package2 className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">Browse Products</h3>
                    <p className="text-sm text-muted-foreground">View and add items to cart</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow`} 
                  onClick={() => handleViewChange('summary', 'All Orders')}
                >
                  <CardContent className="p-6 text-center">
                    <History className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">View History</h3>
                    <p className="text-sm text-muted-foreground">Check Register History</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${!isRegisterOpen ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  onClick={() => handleViewChange('expenses')}
                >
                  <CardContent className="p-6 text-center">
                    <Receipt className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="font-semibold">Manage Expenses</h3>
                    <p className="text-sm text-muted-foreground">Track business expenses</p>
                    {!isRegisterOpen && <p className="text-xs text-red-500 mt-1">Session required</p>}
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
              {/* Logo placeholder - replace src with your actual logo */}
            <img src='/images/wfg-logo.png' className='h-25 w-25'/>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">POS Dashboard</h1>
                <p className="text-muted-foreground">Manage your point of sale operations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Card - Always show logged in user */}
              {user && (
                <>
<Card 
              className="border-0 h-15  bg-muted/50 hidden lg:block"
            >
              <CardContent className="p-2 h-full flex items-center">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback 
                      className="bg-primary text-primary-foreground font-semibold text-xs"
                    >
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
                        </>
                
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
                
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => setIsMobileCartOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Top Stats - Now using API data with pending payment */}
          <DashboardStats 
            cash={isRegisterOpen ? dailyStats.cashRecvd : 0}
            sales={isRegisterOpen ? dailyStats.totalSales : 0}
            orders={isRegisterOpen ? dailyStats.orderCount : 0}
            pendingPayment={isRegisterOpen ? (dailyStats.totalPendingPayment || 0) : 0}
            totalExpenses={isRegisterOpen ? calculateTotalExpenses() : 0}
            cashInHand={isRegisterOpen ? (registerData?.startCash || 0) : 0}
            isRegisterOpen={isRegisterOpen}
            isLoading={statsLoading}
          />
                    
          {/* Main Layout - Now without cart, extended width */}
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar 
                activeView={activeView}
                onViewChange={handleViewChange}
                products={products}
                onCloseRegister={handleCloseRegister}
                onOpenRegister={handleOpenRegister}
                registerData={registerData}
                isRegisterOpen={isRegisterOpen}
              />
            </div>
            
            {/* Main Content - Now takes full remaining width */}
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
          
          {/* Floating Checkout Button */}
          {shouldShowCheckoutButton && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                size="lg"
                onClick={() => setIsCartSheetOpen(true)}
                className="shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Checkout ({totalItems})
                <Badge variant="secondary" className="ml-1">
                  PKR {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                </Badge>
              </Button>
            </div>
          )}
          
          {/* Cart Sheet */}
          <Cart
            isOpen={isCartSheetOpen}
            onClose={() => setIsCartSheetOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
            discount={discount}
            setDiscount={setDiscount}
            isProcessingOrder={isProcessingOrder}
          />
          
          {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            activeView={activeView}
            onViewChange={handleViewChange}
            products={products}
            onCloseRegister={handleCloseRegister}
            registerData={registerData}
            isRegisterOpen={isRegisterOpen}
            user={user}
            onLogout={handleLogout}
          />
          
          {/* Mobile Cart */}
          <MobileCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
            isOpen={isMobileCartOpen}
            onClose={() => setIsMobileCartOpen(false)}
            isProcessingOrder={isProcessingOrder}
          />

          {/* Start Cash Modal with Managers */}
          <StartCashModal
            isOpen={showStartCashModal}
            onClose={() => setShowStartCashModal(false)}
            onSubmit={handleStartCashSubmit}
            isLoading={isOpeningRegister}
            managers={managers}
          />

          {/* Final Cash Modal */}
          <FinalCashModal
            isOpen={showFinalCashModal}
            onClose={() => setShowFinalCashModal(false)}
            onSubmit={handleFinalCashSubmit}
            isLoading={isClosingRegister}
            registerData={registerData}
            totalSales={dailyStats.totalSales}
            totalExpenses={calculateTotalExpenses()}
          />
        </div>
      </div>
    );
  };
  
  export default POSDashboard;