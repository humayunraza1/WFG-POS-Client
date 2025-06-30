import {
  Package2, Receipt, History, FileText,
  BarChart3, Plus, Edit3
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


  if (access.canViewExpenses) {
    menuItems.push({
      key: 'expenses',
      icon: Receipt,
      label: 'Expenses'
    });
  }

  if (access.isManager || access.isAdmin) {
    menuItems.push({
      key: 'summary',
      icon: History,
      label: 'Register History'
    });
    menuItems.push({
      key: 'orders-history',
      icon: FileText,
      label: 'Orders History'
    });
  }

  if (access.canViewReport || access.canGenReport) {
    menuItems.push({
      key: 'reports',
      icon: BarChart3,
      label: 'Reports'
    });
  }

  if (access.canAddProducts) {
    menuItems.push({
      key: 'add-product',
      icon: Plus,
      label: 'Add Product'
    });
  }

  if (access.canEditProducts) {
    menuItems.push({
      key: 'edit-product',
      icon: Edit3,
      label: 'Edit Product'
    });
  }

  return menuItems;
};

export default useSidebarMenu;
