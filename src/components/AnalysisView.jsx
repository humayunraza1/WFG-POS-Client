import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import TopSellingProducts from './TopSellingProducts';
import ProductAnalytics from './ProductAnalytics';
import PerformanceMetrics from './PerfomanceMetrics';
import SalesChart from './SalesChart';

const AnalysisView = ({ activeTab = 'overview' }) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  // Update selected tab when activeTab prop changes
  useEffect(() => {
    if (activeTab) {
      setSelectedTab(activeTab);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Top Sellers
              </TabsTrigger>
              {/* <TabsTrigger value="analytics" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Product Analytics
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <PerformanceMetrics />
              {/* <SalesChart type="overview" /> */}
            </TabsContent>

            <TabsContent value="products" className="space-y-6 mt-6">
              <TopSellingProducts />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <ProductAnalytics />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6 mt-6">
              <SalesChart type="trends" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisView;