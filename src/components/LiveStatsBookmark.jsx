import { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { axiosPrivate } from '@/api/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// LiveStatsBookmark - JSX version
const LiveStatsBookmark = ({ sessionId, isRegisterOpen = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [itemSummary, setItemSummary] = useState([]);
    const [categorySummary, setCategorySummary] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const openAndFetch = async () => {
      if (!isRegisterOpen) {
        toast.error('Register Session Required', { description: 'Please open the register to view live item counts' });
        return;
      }

      setLoading(true);
      try {
        // Real API call to fetch live summary from backend
        const res = await axiosPrivate.get('/register/live-summary', {
          params: { sessionId },
        });

        // Response shape may vary; attempt common shapes
        const data = res.data || {};
        const summary = data.summary || data.data || data;

        // Prefer explicit keys if present
        const categories = summary.categorySummary || summary.categories || summary.category || [];
        const items = summary.itemSummary || summary.items || summary.item || [];

        // Normalize to expected structure
        setCategorySummary(Array.isArray(categories) ? categories : []);
        setItemSummary(Array.isArray(items) ? items : []);

        setIsOpen(true);
      } catch (err) {
        console.error('Live summary fetch error', err);
        const message = err?.response?.data?.message || err.message || 'Failed to load live summary';
        toast.error('Failed to load live summary', { description: message });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!isRegisterOpen) {
        setIsOpen(false);
      }
    }, [isRegisterOpen]);

    const filteredItems = selectedCategory
      ? itemSummary.filter((i) => i.category === selectedCategory)
      : [];

    return (
      <>
        {/* Floating Bookmark Tab - fixed middle-right */}
          <button
            onClick={openAndFetch}
            disabled={loading}
            aria-busy={loading}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground rounded-l-xl py-2 px-2 sm:py-4 sm:px-3 shadow-lg hover:bg-primary/90 transition-all duration-300 hover:pr-4 sm:hover:pr-5 group"
            aria-label="Open Live Items"
            style={{ transform: 'translateY(-50%)' }}
          >
            <div className="flex flex-col items-center gap-1 relative">
              <div className="relative">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                {loading && (
                  <Loader2 className="absolute -top-1 -right-1 w-4 h-4 text-white animate-spin" aria-hidden="true" />
                )}
              </div>
              {/* <span className="text-[10px] sm:text-xs font-medium writing-mode-vertical">LIVE</span> */}
            </div>
          </button>

        {/* Desktop dialog (visible on lg and up) */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="flex z-50 w-[95vw] max-w-2xl overflow-hidden flex-col mx-auto my-8">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                Live Items Sold
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category Grid */}
                  {categorySummary.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No sales yet in this session.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {categorySummary.map((cat) => (
                        <button
                          key={cat.category}
                          onClick={() =>
                            setSelectedCategory(selectedCategory === cat.category ? null : cat.category)
                          }
                          className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selectedCategory === cat.category
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <p className="font-semibold text-sm sm:text-base text-foreground truncate">{cat.category}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{cat.totalCount} sold</p>
                          <p className="text-xs sm:text-sm font-medium text-primary mt-0.5">PKR {cat.totalRevenue?.toLocaleString?.() || 0}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Items Table - shown when category is selected */}
                  {selectedCategory && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 border-b">
                        <h3 className="font-semibold text-sm sm:text-base">{selectedCategory} - Items</h3>
                      </div>
                      {filteredItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6 text-sm">No items in this category.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm">Item Name</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Qty Sold</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Revenue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                                <TableCell className="text-right text-xs sm:text-sm">{item.totalCount}</TableCell>
                                <TableCell className="text-right text-xs sm:text-sm text-primary font-medium">PKR {item.totalRevenue?.toLocaleString?.() || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* mobile handled by the same DialogContent now - responsive sizing applied */}
      </>
    );
  };

  export default LiveStatsBookmark;
