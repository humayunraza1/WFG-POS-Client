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
  ClipboardList
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
import useRegister from '../hooks/useRegister';
import ProductsView from '../components/ProductsView';
import OrdersTableView from '../components/OrdersTableView';
import useProducts from '../hooks/useProducts';
import StartCashModal from '../components/StartCashModal';
import FinalCashModal from '../components/FinalCashModal';
import OrdersHistory from '../components/Sidebar/OrderHistory';
import NewVariantsView from '../components/Sidebar/NewVariantsView';
import MobileCategoryDrawer from '../components/Mobile/MobileCategoryDrawer';
import CategoryHintPopover from '../components/Mobile/CategoryHintPopover';
import EmployeeStatsTable from '@/components/stats/EmployeeStatsTable'
import TempOrdersDrawer from '../components/Mobile/TempOrdersDrawer';
import { useTempOrders } from '../hooks/useTempOrders';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { checkRegisterStatus, closeRegister, openRegister } from '../features/registers/registerSlice';
import { addOrder } from '@/features/orders/ordersSlice';
import { updatePayment } from '../features/orders/ordersSlice';
import { useGetDailyStatsQuery } from '../features/orders/ordersAPI';
import { addExpense, deleteExpense, updateExpense } from '../features/expense/expenseSlice';

// Main Dashboard Component
const POSDashboard = () => {
  const dispatch = useDispatch();
    const { user,isAuthenticated } = useSelector((state)=>state.auth);
    const {isLoading:registerLoading,sessionId,registerData,isOpen:isRegisterOpen} = useSelector((state)=>state.register)
    const { refetch: refetchStats } = useGetDailyStatsQuery(sessionId, {
    skip: !sessionId,
    });
    const {expenses} = useSelector((state) => state.expense)
    const [activeView, setActiveView] = useState('dashboard');
    const [activeSubView, setActiveSubView] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
    const [showStartCashModal, setShowStartCashModal] = useState(false);
    const [showFinalCashModal, setShowFinalCashModal] = useState(false);
    const [isOpeningRegister, setIsOpeningRegister] = useState(false);
    const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
const [isTempOrdersOpen, setTempOrdersOpen] = useState(false);
    const [discount, setDiscount] = useState(null);
    const {
      error: registerError,
      managers,
      managersError
    } = useRegister();
    const {tempOrders,clearAllOrders} = useTempOrders();

    const {
      products,
      categories,
      isLoading: productsLoading,
      error: productsError,
      fetchCategories,
      fetchProducts,
      fetchProductsByCategory
    } = useProducts();

    // Fetch products initially and when register opens
    useEffect(() => {
      fetchCategories();
      fetchProducts();
    }, []);

    useEffect(() => {
    if (isAuthenticated) {
      dispatch(checkRegisterStatus());
    }
  }, [dispatch, isAuthenticated]);

    // Additional fetch when register opens to ensure fresh data
    useEffect(() => {
      if (isRegisterOpen && sessionId) {
        fetchCategories();
      }
    }, [isRegisterOpen, sessionId]);

    // Close mobile sidebar when screen size changes to desktop
    useEffect(() => {
      const handleResize = () => {
        // Check if screen is now large (lg breakpoint is 1024px)
        if (window.innerWidth >= 1024 && isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
        }
      };

      // Add event listener
      window.addEventListener('resize', handleResize);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [isMobileSidebarOpen]);

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
      if (managersError) {
        toast.error('Managers Error', {
          description: managersError
        });
      }
    }, [registerError, productsError, managersError]);

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
          
          // If switching to variants view, fetch products for the selected category
          if (view === 'variants' && subView) {
            fetchProductsByCategory(subView._id);
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
      }else{
        toast("Opening Register")
        setShowStartCashModal(true);
      }
    };

    const handleStartCashSubmit = async (registerData) => {
      console.log(registerData)
      try {
        setIsOpeningRegister(true);
        dispatch(openRegister(registerData))
        toast.success('Register opened successfully', {
          description: `Manager: ${registerData.manager}, Starting cash: PKR ${registerData.startCash.toLocaleString()}`
        });
        setShowStartCashModal(false);
      
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
     
        const res = await dispatch(closeRegister(finalCash));
        if(res.meta.requestStatus == 'fulfilled'){

          toast.success('Register closed successfully', {
            description: `Final cash: PKR ${finalCash.toLocaleString()}`
          });
          clearAllOrders()
          setCartItems([]);
          // Clear cart items and switch to dashboard view
          setActiveView('dashboard');
          setActiveSubView(null);
        }else{
          toast.error('Failed to close register', {
            description: error.message
          });
        }
        setShowFinalCashModal(false);
     
    };
    
    const handleAddToCart = (category, product) => {
      if (!requiresActiveSession('add items to cart')) {
        return;
      }
      console.log('Adding to cart - product:', product);
      console.log('Adding to cart - category:', category);
  
      const existingItem = cartItems.find(item => item.option._id === product.option._id);
      console.log("Cart: ",cartItems)
      if (existingItem) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.varID === product.varID
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems(prevItems => [...prevItems, product]);
      }

      toast.success('Added to cart', {
        description: `${product.name} - ${product.option.name} added to cart`
      });
    };
    
    const handleUpdateQuantity = (variantId, newQuantity) => {
      console.log(`Updating quantity for variant ${variantId} to ${newQuantity}`);
      if (newQuantity === 0) {
        handleRemoveFromCart(variantId);
        return;
      }
      console.log("update quantity: ",cartItems)
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.option._id === variantId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    };
    
    const handleRemoveFromCart = (productId) => {
      console.log(`Removing item with ID ${productId} from cart`);
      console.log(cartItems)
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
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

      const finalOrderData = {...orderData,registerSession: sessionId,
          paymentStatus: orderData.outstandingPayment > 0 ? 'pending' : 'paid'}
      console.log("final order data: ",finalOrderData)
      try {
        const res = await dispatch(addOrder(finalOrderData));
        console.log("order placed using thunk: ",res)
        // Show success message with payment status
        const paymentStatus = orderData.outstandingPayment > 0 ? 'partial payment' : 'full payment';
        const description = orderData.outstandingPayment > 0 
          ? `Paid: PKR ${orderData.amountPaid.toLocaleString()}, Outstanding: PKR ${orderData.outstandingPayment.toLocaleString()}`
          : `Total: PKR ${orderData.finalPrice.toLocaleString()}`;
        refetchStats()
        toast.success(`Order processed successfully (${paymentStatus})`, {
          description: description
        });
        
        setCartItems([]);
        setDiscount(0);
        setIsCartSheetOpen(false);
        // Daily stats will be refreshed automatically in useOrders hook
      } catch (error) {
        console.log(error)
        toast.error('Failed to process order', {
          description: error.message
        });
        throw error; // Re-throw to let the cart component handle it
      } 
    };

    // New function to handle payment updates from orders table
    const handleUpdatePayment = async (orderId, amount) => {
      try {
        const result = await dispatch(updatePayment({orderId, amountReceived:amount}));
        console.log(result)
        toast.success('Payment updated successfully', {
          description: result.message
        });
        refetchStats()
        return result;
      } catch (error) {
        toast.error('Failed to update payment', {
          description: error.message
        });
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

  
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const isLoading = registerLoading || productsLoading;
    
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
        <NewVariantsView 
          selectedCategory={activeSubView}
          products={products} // This should be the products array from fetchProductsByCategory
          onAddToCart={handleAddToCart}
          onViewChange={handleViewChange}
        /> :
            <div className="text-center p-8">
              <p className="text-muted-foreground">Select a product category from the sidebar</p>
            </div>;
        
        case 'products':
          return         <ProductsView 
          categories={categories} // Pass categories, not products
          onViewChange={handleViewChange}
        />;
        case 'stats':
          return <EmployeeStatsTable/>  
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
            <ExpensesView />
          );

        case 'reports':
            return <AllReports />;

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
              onUpdatePayment={handleUpdatePayment}
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
                  onClick={() => setIsCartSheetOpen(true)}
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
          <DashboardStats />
                    
          {/* Main Layout - Now without cart, extended width */}
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar 
                activeView={activeView}
                onViewChange={handleViewChange}
                categories={categories}
                onCloseRegister={handleCloseRegister}
                onOpenRegister={handleOpenRegister}
              />
            </div>
            
            {/* Main Content - Now takes full remaining width */}
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
          
          {/* Floating Checkout Button */}
          {shouldShowCheckoutButton && (
            <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
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
          
          {/* Cart Sheet - Now responsive for both desktop and mobile */}
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
          />
          
          {/* Mobile Category Drawer */}
          <MobileCategoryDrawer
            categories={categories}
            onViewChange={handleViewChange}
            isOpen={isCategoryDrawerOpen}
            setIsOpen={setCategoryDrawerOpen}
          />
          {/* Category Hint Popover - show when on variants view */}
          <CategoryHintPopover
            isVisible={true}
            showOnce={true}
          />
          <TempOrdersDrawer   isOpen={isTempOrdersOpen}
  setIsOpen={setTempOrdersOpen}/>

          {/* Unified Floating Button Bar (Mobile Only) */}
{activeView != 'stats' && <div className="fixed bottom-4 inset-x-0 z-40 flex justify-around px-4 gap-2 sm:gap-4 md:gap-6 lg:hidden">
  {/* Category Button */}
  <Button
    onClick={() => setCategoryDrawerOpen(true)}
    size="icon"
    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
    aria-label="Browse Categories"
  >
    <Package2 className="h-5 w-5" />
  </Button>

  {/* Checkout Button */}
  {shouldShowCheckoutButton && (
    <Button
      onClick={() => setIsCartSheetOpen(true)}
      className="flex-1 min-w-0 px-2 py-3 sm:px-4 sm:py-3 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 text-sm sm:text-base gap-2 rounded-full whitespace-nowrap overflow-hidden text-ellipsis"
    >
      <ShoppingCart className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">Checkout ({totalItems})</span>
      <Badge variant="secondary" className="ml-1 truncate max-w-[5rem]">
        PKR {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
      </Badge>
    </Button>
  )}

  {/* Temp Orders Button */}
  <div className="relative">
    {tempOrders?.length > 0 && (
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] z-10"
      >
        {tempOrders.length}
      </Badge>
    )}
    <Button
      onClick={() => setTempOrdersOpen(true)}
      size="icon"
      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-orange-500 hover:bg-orange-600"
      aria-label="View Temp Orders"
    >
      <ClipboardList className="h-5 w-5" />
    </Button>
  </div>
</div>}


            {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
                activeView={activeView}
                onViewChange={handleViewChange}
                categories={categories}
                user={user}
                onCloseRegister={handleCloseRegister}
                onOpenRegister={handleOpenRegister}
                registerData={registerData}
                isRegisterOpen={isRegisterOpen}
            onLogout={handleLogout}
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
          />
        </div>
      </div>
    );
  };
  
  export default POSDashboard;