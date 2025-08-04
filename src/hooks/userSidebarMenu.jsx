import {
  Package2, Receipt, History, FileText,
  BarChart3, Plus, Edit3,
  User,
  DollarSign,
  User2,
  StoreIcon,
  Settings,
  ChartNoAxesColumn
} from 'lucide-react';
import { useSelector } from 'react-redux';

const useSidebarMenu = (products) => {
  const { user } = useSelector((state)=>state.auth);
  const access = user?.access || {};
  const {businessPrefs} = useSelector((state)=>state.settings);
    console.log('Access:', access);
  const menuItems = [];
  // Products with variants (Always shown if products exist)
  if (access.isCashier && (!access.isAdmin && !access.usManager)) {
    menuItems.push({
      key: 'variants',
      icon: Package2,
      label: 'Products',
      children: products,
      hasSubItems: true
    });
  }


    menuItems.push({
      key: 'orders',
      icon: Receipt,
      label: 'Orders'
    });

    if(access.isAdmin){
    menuItems.push({
      key:"branch",
      icon: StoreIcon,
      label: "Manage Branch"
    })
  }

  if(access.canAddExpense){
            menuItems.push({
      key: 'expenses',
      icon: Receipt,
      label: 'Expenses'
    });
  }

  if (access.isManager || access.isAdmin) {
    menuItems.push({
      key: 'history',
      icon: History,
      children: ["Orders History", "Register History"],
      label: 'History'
    });
         menuItems.push({
      key: 'manage-product',
      icon: Package2,
      label: 'Manage Product'
    });
            menuItems.push({
      key: 'employees',
      icon: User,
      label: 'Employees'
    });
        menuItems.push({
      key:'accounts',
      icon: User2,
      label: 'Manage Accounts'
    })

  }
  
  // if (access.canGenReport || access.isManager) {
  //   menuItems.push({
  //     key: 'reports',
  //     icon: BarChart3,
  //     label: 'Reports'
  //   });

  // }

  if(businessPrefs?.trackServers){
    // Settings - Available to all users
    menuItems.push({
      key: 'stats',
      icon: ChartNoAxesColumn,
      label: 'Server Stats'
    });
    
  }

  return menuItems;
};

export default useSidebarMenu;