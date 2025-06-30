import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Loader2, Monitor } from 'lucide-react';

    const ActiveRegisters = ({activeRegisters,handleGetAllSummary,selectedSessionId,handleRegisterClick,setActiveView, managerLoading}) => {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      };

      return (
        <Card className="w-80 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Registers</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {activeRegisters.length} Active
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Get All Summary Button */}
            <Button 
              onClick={()=>{handleGetAllSummary(); setActiveView('registers');}}
              variant={selectedSessionId === null ? "default" : "outline"}
              className="w-full"
              size="sm"
            >
              View All Summary
            </Button>
            
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
              <ScrollArea className="max-h-96">
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
                        onClick={() => {
                          setActiveView('registers');
                          handleRegisterClick(register.sessionId);
                        }}
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
          </CardContent>
        </Card>
      );
    };

export default ActiveRegisters;