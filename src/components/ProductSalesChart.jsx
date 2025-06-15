import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ProductSalesChart = ({ data, type, productName, variantName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No daily sales data available
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM d'),
    quantity: item.quantity,
    revenue: item.revenue
  }));

  const title = type === 'variant' && variantName 
    ? `${variantName} (${productName})`
    : productName;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-sm font-medium text-muted-foreground">
          Daily Sales for
        </h4>
        <p className="font-semibold">{title}</p>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Quantity'
            ]}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="quantity" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="quantity"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="revenue" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="revenue"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Quantity Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Revenue (PKR)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesChart;