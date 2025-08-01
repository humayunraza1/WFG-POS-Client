import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Package2,
  ArrowDown,
  Info,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const CategoryHintPopover = ({ 
  isVisible = true, 
  onDismiss,
  showOnce = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const hints = [
    {
      id: 'category',
      title: 'Quick Category Access',
      description: 'Tap the category button below to quickly browse and switch between product categories without going back to the menu.',
      icon: Package2,
      position: 'bottom-24 left-6', // Above category button
      arrowDirection: 'down',
      buttonColor: 'bg-primary',
      storageKey: 'category-hint-seen'
    },
    {
      id: 'temp-orders',
      title: 'Temp Orders Tracker',
      description: 'Use the clipboard button to track orders placed but not yet delivered. Perfect for managing multiple customer orders.',
      icon: ClipboardList,
      position: 'bottom-24 right-6', // Above temp orders button
      arrowDirection: 'down',
      buttonColor: 'bg-orange-500',
      storageKey: 'temp-orders-hint-seen'
    }
  ];

useEffect(() => {
  const isMobile = window.innerWidth < 1024;

  if (!isVisible || !isMobile) return;

  const currentHint = hints[currentStep];
  const hasSeenHint = localStorage.getItem(currentHint.storageKey);

  // Only auto-open if not seen yet
  if (showOnce && !hasSeenHint) {
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }

  // If already seen, do nothing (prevent auto-skip)
  if (!showOnce) {
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }
}, [currentStep, isVisible, showOnce]);


  const checkNextUnseenHint = () => {
    for (let i = currentStep + 1; i < hints.length; i++) {
      const hasSeenHint = localStorage.getItem(hints[i].storageKey);
      if (!hasSeenHint) {
        setCurrentStep(i);
        setTimeout(() => setIsOpen(true), 1500);
        return;
      }
    }
    // All hints have been seen
    if (onDismiss) onDismiss();
  };

  const handleNext = () => {
    const currentHint = hints[currentStep];
    
    if (showOnce) {
      localStorage.setItem(currentHint.storageKey, 'true');
    }

    if (currentStep < hints.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsOpen(false);
      
      // Show next hint after a brief delay
      setTimeout(() => {
        if (showOnce) {
          const nextHint = hints[currentStep + 1];
          const hasSeenNextHint = localStorage.getItem(nextHint.storageKey);
          if (!hasSeenNextHint) {
            setIsOpen(true);
          } else {
            checkNextUnseenHint();
          }
        } else {
          setIsOpen(true);
        }
      }, 1000);
    } else {
      // Last hint
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    const currentHint = hints[currentStep];
    setIsOpen(false);
    
    if (showOnce) {
      localStorage.setItem(currentHint.storageKey, 'true');
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleSkipAll = () => {
    if (showOnce) {
      hints.forEach(hint => {
        localStorage.setItem(hint.storageKey, 'true');
      });
    }
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  if (!isOpen) return null;

  const currentHint = hints[currentStep];
  const IconComponent = currentHint.icon;
  const isLastStep = currentStep === hints.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 lg:hidden" />
      
      {/* Popover positioned based on current hint */}
      <div className={`fixed ${currentHint.position} z-50 lg:hidden`}>
        {/* Animated arrow pointing to the button */}
        <div className="flex justify-center mb-2">
          <div className="animate-bounce">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        {/* Main popover card */}
        <Card className="w-80 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-full ${currentHint.buttonColor}/10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <IconComponent className={`h-4 w-4 ${currentHint.buttonColor.replace('bg-', 'text-')}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{currentHint.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {currentStep + 1}/{hints.length}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {currentHint.description}
                </p>
                
                {/* Progress dots */}
                <div className="flex justify-center gap-1 mb-4">
                  {hints.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-primary' 
                          : index < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {currentStep > 0 && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handlePrevious}
                        className="text-xs h-7 px-2"
                      >
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={handleSkipAll}
                      className="text-xs h-7 px-2 text-muted-foreground"
                    >
                      Skip All
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={handleNext}
                      className="text-xs h-7 px-3"
                    >
                      {isLastStep ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Close button */}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-6 w-6 p-0 absolute top-2 right-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CategoryHintPopover;