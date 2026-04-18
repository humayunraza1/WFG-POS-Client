import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import useProducts from '@/hooks/useProducts';
import ProductForm from './ProductForm';
import BulkProductUploader from './BulkProductUploader';
import DealForm from './DealForm';

const ProductManagement = () => {
  const {
    deals,
    products,
    categories,
    fetchProducts,
    fetchCategories,
    fetchDeals,
    updateDealStatus,
    deleteDeal,
  } = useProducts();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit' | 'bulk' | 'deals' | 'deal-add' | 'deal-edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDeals({ status: 'all' });
  }, []);

  const handleToggleDealStatus = async (deal) => {
    try {
      await updateDealStatus(deal._id, !deal.isActive);
      toast.success(`Deal ${deal.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update deal status');
    }
  };

  const handleDeleteDeal = async (deal) => {
    const confirmed = window.confirm(`Delete deal "${deal.name}" permanently?`);
    if (!confirmed) return;

    try {
      await deleteDeal(deal._id);
      toast.success('Deal deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete deal');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      {view === 'list' && (
        <>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Product Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('deals')}>
                Manage Deals
              </Button>
              <Button variant="outline" onClick={() => setView('bulk')}>
                <Upload className="w-4 h-4 mr-2" /> Bulk Add
              </Button>
              <Button onClick={() => setView('add')}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3"
              />
              <Select onValueChange={value => setSelectedCategory(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full md:w-1/4">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={value => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder={`${itemsPerPage} per page`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results summary */}
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Options</th>
                    <th className="p-2">Price Range</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map(product => {
                    const prices = product.options.map(o => o.price);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return (
                      <tr key={product._id} className="border-b">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category.name}</td>
                        <td className="p-2">{product.options.length}</td>
                        <td className="p-2">Rs. {min}{min !== max && ` - Rs. ${max}`}</td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setView('edit');
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}
                    
                    {getPageNumbers().map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </>
      )}

      {view === 'deals' && (
        <>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Deal Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('list')}>
                Back To Products
              </Button>
              <Button onClick={() => setView('deal-add')}>
                <Plus className="w-4 h-4 mr-2" /> Add Deal
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {deals.length} deal{deals.length !== 1 ? 's' : ''} configured
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2">Deal</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Selection Groups</th>
                    <th className="p-2">Pricing</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal._id} className="border-b">
                      <td className="p-2 font-medium">{deal.name}</td>
                      <td className="p-2">{deal.category?.name || 'N/A'}</td>
                      <td className="p-2">{deal.selectionGroups?.length || 0}</td>
                      <td className="p-2">{deal.pricingMode === 'dynamic' ? 'Original + Delta' : 'Fixed'}</td>
                      <td className="p-2">Rs. {Number(deal.price || 0).toLocaleString()}</td>
                      <td className="p-2">{deal.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleDealStatus(deal)}
                          >
                            {deal.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setView('deal-edit');
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDeal(deal)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <ProductForm
          mode={view === 'add' ? 'Add Product' : 'Edit Product'}
          product={view === 'edit' ? selectedProduct : null}
          onBack={() => {
            setView('list');
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
            setView('list');
            setSelectedProduct(null);
          }}
        />
      )}

      {(view === 'deal-add' || view === 'deal-edit') && (
        <DealForm
          mode={view === 'deal-add' ? 'Add Deal' : 'Edit Deal'}
          deal={view === 'deal-edit' ? selectedDeal : null}
          onBack={() => {
            setView('deals');
            setSelectedDeal(null);
          }}
          onSuccess={() => {
            fetchDeals({ status: 'all' });
            setView('deals');
            setSelectedDeal(null);
          }}
        />
      )}

      {view === 'bulk' && (
        <BulkProductUploader onBack={() => setView('list')} />
      )}
    </Card>
  );
};

export default ProductManagement;