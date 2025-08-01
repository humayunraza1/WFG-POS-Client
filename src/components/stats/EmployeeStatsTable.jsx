import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Package, Eye, Filter } from 'lucide-react';
import EmployeeDetailsDrawer from './EmployeeDetailsDrawer';
import useStats from '@/hooks/useStats';

// Utility functions
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getPeriodTitle = (period) => {
  switch (period) {
    case 'daily':
      return "Today's Stats";
    case 'weekly':
      return 'Weekly Stats';
    case 'monthly':
      return 'Monthly Stats';
    case 'custom':
      return 'Custom Period Stats';
    default:
      return 'Daily Stats';
  }
};

const EmployeeStatsTable = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filter states
const [filterPeriod, setFilterPeriod] = useState('daily');
const [filterStartDate, setFilterStartDate] = useState('');
const [filterEndDate, setFilterEndDate] = useState('');
const [filterIsActive, setFilterIsActive] = useState(true);

const [period, setPeriod] = useState('daily');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [isActiveSessionOnly, setIsActiveSessionOnly] = useState(true);
const getEmployeeStats = useStats();
  const fetchData = async () => {
    setLoading(true);
    try {  
      const rdata = await getEmployeeStats()
      setData(rdata)
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleApplyFilters = async () => {
      setPeriod(filterPeriod);
  setStartDate(filterStartDate);
  setEndDate(filterEndDate);
  setIsActiveSessionOnly(filterIsActive);
  setLoading(true)
  try{
    const rdata = await getEmployeeStats(filterPeriod,filterStartDate,filterEndDate,filterIsActive)
    setData(rdata)
  }catch(err){
    console.log(err)
    toast.error("Error fetching employee stats: ",err)
  }finally{
    setLoading(false)
  }
};

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };


  if (!data?.success) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load statistics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date - Only show for custom period */}
            {filterPeriod === 'custom' && (
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            )}

            {filterPeriod === 'custom' && (
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            )}

          {/* Active Sessions Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="activeSession"
              checked={filterIsActive}
              onCheckedChange={setFilterIsActive}
            />
            <Label 
              htmlFor="activeSession" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Get stats for active sessions only
            </Label>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={handleApplyFilters} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {getPeriodTitle(data?.data?.summary?.period || period)}
        </h2>
        {data?.data?.summary?.dateRange && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {formatDateTime(data.data.summary.dateRange.startDate)} - {formatDateTime(data.data.summary.dateRange.endDate)}
            </span>
          </div>
        )}
        {data?.data?.summary && (
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="font-medium">Total Employees:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {data.data.summary.totalEmployees}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-medium">Total Deliveries:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {data.data.summary.totalDeliveries}
              </span>
            </span>
            {isActiveSessionOnly && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Active Sessions Only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Employee Name</TableHead>
              <TableHead className="w-[150px]">Total Deliveries</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.employees?.length > 0 ? (
              data.data.employees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell className="font-medium">
                    {employee.employeeName}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm">
                      <Package className="h-3 w-3" />
                      {employee.totalDeliveries}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(employee)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading employee data...' : 'No employee data available for this period'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Employee Details Drawer */}
      <EmployeeDetailsDrawer
        employee={selectedEmployee}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default EmployeeStatsTable;