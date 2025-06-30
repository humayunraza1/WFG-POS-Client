import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Loader2 } from 'lucide-react';

const ActiveRegisters = ({ 
  activeRegisters, 
  loading, 
  onRegisterClick, 
  onGetAllSummary,
  selectedSessionId 
}) => {
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
          onClick={onGetAllSummary}
          variant={selectedSessionId === null ? "default" : "outline"}
          className="w-full"
          size="sm"
        >
          View All Summary
        </Button>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : activeRegisters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No active registers</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {activeRegisters.map((register) => {
                const { date, time } = formatDate(register.openedAt);
                const isSelected = selectedSessionId === register.sessionId;
                
                return (
                  <Card 
                    key={register._id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onRegisterClick(register.sessionId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                              {register.cashier.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {register.cashier.username}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Active'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        Session: {register.sessionId.slice(-8)}...
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