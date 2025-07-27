import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Package2,
  ArrowDown,
  Info
} from 'lucide-react';

const CategoryHintPopover = ({ 
  isVisible = true, 
  onDismiss,
  showOnce = true // Show only once per session by default
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show on mobile devices and if visible
    const isMobile = window.innerWidth < 1024;
    
    if (isVisible && isMobile && showOnce) {
      // Check if user has seen this hint before
      const hasSeenHint = localStorage.getItem('category-hint-seen');
      if (!hasSeenHint) {
        // Show after a short delay for better UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else if (isVisible && isMobile && !showOnce) {
      // Always show if showOnce is false
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, showOnce]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (showOnce) {
      // Mark as seen so it doesn't show again
      localStorage.setItem('category-hint-seen', 'true');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - subtle for hint */}
      <div className="fixed inset-0 z-40 lg:hidden" />
      
      {/* Popover positioned above the float button */}
      <div className="fixed bottom-24 left-6 z-50 lg:hidden">
        {/* Animated arrow pointing down to the button */}
        <div className="flex justify-center mb-2">
          <div className="animate-bounce">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        {/* Main popover card */}
        <Card className="w-72 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm">Quick Category Access</h4>
                  <Badge variant="secondary" className="text-xs">Tip</Badge>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Tap the <Package2 className="inline h-3 w-3 mx-1" /> button below to quickly browse and switch between product categories without going back to the menu.
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={handleDismiss}
                    className="text-xs h-7"
                  >
                    Got it!
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs h-7 p-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CategoryHintPopover;