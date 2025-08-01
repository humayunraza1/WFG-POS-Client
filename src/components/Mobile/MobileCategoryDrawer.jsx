import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Menu, 
  X, 
  Package2
} from 'lucide-react';

const MobileCategoryDrawer = ({ categories, onViewChange,isOpen, setIsOpen  }) => {
  // const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (category) => {
    onViewChange('variants', category);
    setIsOpen(false); // Close drawer after selection
  };

  return (
    <>
      {/* Floating Action Button - matches your theme */}
      {/* <div className="z-40 lg:hidden">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90"
          aria-label="Browse Categories"
        >
          <Package2 className="h-6 w-6" />
        </Button>
      </div> */}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer - matches your card styling */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '75vh' }}
      >
        {/* Header - matches your dashboard header style */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <Package2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Browse Categories</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories List with ScrollArea - Simple list design */}
        <ScrollArea className="flex-1" style={{ maxHeight: 'calc(75vh - 80px)' }}>
          <div className="p-4">
            {categories && categories.length > 0 ? (
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category._id || category.id}
                    variant="ghost"
                    size="lg"
                    onClick={() => handleCategoryClick(category)}
                    className="w-full justify-start text-left h-14 px-4 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Package2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-medium text-base">
                        {category.name || category.title}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No categories available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default MobileCategoryDrawer;