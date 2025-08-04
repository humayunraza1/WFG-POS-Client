import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Clock, User, Loader2, Monitor, X } from 'lucide-react';
import { useState } from 'react';

const ActiveRegisters = ({
  activeRegisters,
  handleGetAllSummary,
  selectedSessionId,
  handleRegisterClick,
  setActiveView,
  managerLoading
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleRegisterSelect = (sessionId) => {
    handleRegisterClick(sessionId);
    setIsDrawerOpen(false);
  };

  const handleViewAllSummary = () => {
    handleGetAllSummary();
    setActiveView('registers');
    setIsDrawerOpen(false);
  };

  const RegisterContent = ({ isMobile = false }) => (
    <div className={`space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
      {/* Get All Summary Button */}
      {managerLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : activeRegisters.length === 0 ? (
        <div className="text-center py-8">
          <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground font-medium">No active registers found</p>
          <p className="text-xs text-muted-foreground mt-1">All registers are currently closed</p>
        </div>
      ) : (
        <ScrollArea className={isMobile ? "max-h-80" : "max-h-96"}>
          <div className="space-y-3">
            {activeRegisters.map((register) => {
              const { date, time } = formatDate(register.openedAt);
              const isSelected = selectedSessionId === register.sessionId;
              
              return (
                <Card 
                  key={register._id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                      : 'hover:border-primary/30'
                  }`}
                  onClick={() => handleRegisterSelect(register.sessionId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {register.cashier.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isSelected ? 'text-primary' : ''
                          }`}>
                            {register.cashier.username}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Cashier</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          isSelected 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Opened: {date} at {time}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Session: {register.sessionId.slice(-8)}...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:block">
        <Card className="w-80 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Registers</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {activeRegisters.length} Active
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <RegisterContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Version - Floating Button with Drawer */}
      <div className="lg:hidden">
        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 z-50">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span>Click to see all active registers</span>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="ml-2 hover:text-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          )}

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button 
                size="lg" 
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl relative"
                onClick={() => setShowTooltip(false)}
              >
                <Monitor className="h-6 w-6" />
                {activeRegisters.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeRegisters.length}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-lg">Active Registers</DrawerTitle>
                  <Badge variant="secondary" className="text-xs">
                    {activeRegisters.length} Active
                  </Badge>
                </div>
              </DrawerHeader>
              
              <div className="flex-1 overflow-auto">
                <RegisterContent isMobile={true} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default ActiveRegisters;