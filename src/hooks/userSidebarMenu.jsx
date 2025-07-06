import {
  Package2, Receipt, History, FileText,
  BarChart3, Plus, Edit3,
  User,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const useSidebarMenu = (products) => {
  const { user } = useAuth();
  const access = user?.access || {};
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


  if (access.canManageExpenses) {
    menuItems.push({
      key: 'expenses',
      icon: Receipt,
      label: 'Expenses'
    });
  }

  if (access.isManager || access.isAdmin) {
    menuItems.push({
      key: 'registers',
      icon: DollarSign,
      label: 'Overview'
    });
    menuItems.push({
      key: 'history',
      icon: History,
      children: ["Orders History", "Register History"],
      label: 'History'
    });
         menuItems.push({
      key: 'manage-product',
      icon: Package2,
      children: ["Add Product", "Edit Product"],
      label: 'Manage Product'
    });
            menuItems.push({
      key: 'employees',
      icon: User,
      label: 'Employees'
    });
  }

  if (access.canViewReport || access.canGenReport || access.isManager) {
    menuItems.push({
      key: 'reports',
      icon: BarChart3,
      label: 'Reports'
    });

  }

  return menuItems;
};

export default useSidebarMenu;
