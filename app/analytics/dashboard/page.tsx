"use client";

import PageHeader from "@/components/ui-mui/page-header";
import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {
    Activity,
    DollarSign,
    Target,
    Users
} from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Sample data for charts
const salesTrendData = [
  { month: 'Jan 2024', series1: 20, series2: 15, series3: 10 },
  { month: 'Feb 2024', series1: 25, series2: 20, series3: 15 },
  { month: 'Mar 2024', series1: 30, series2: 18, series3: 20 },
  { month: 'Apr 2024', series1: 35, series2: 25, series3: 18 },
  { month: 'May 2024', series1: 40, series2: 30, series3: 25 },
  { month: 'Jun 2024', series1: 45, series2: 35, series3: 30 },
];

const teamPerformanceData = [
  { name: 'John Smith', value: 85 },
  { name: 'Sarah Johnson', value: 92 },
  { name: 'Mike Wilson', value: 78 },
  { name: 'Emily Davis', value: 88 },
  { name: 'David Brown', value: 65 },
  { name: 'Lisa Anderson', value: 95 },
  { name: 'Tom Wilson', value: 45 },
];

const performanceRankingData = [
  { name: 'Jane Smith', totalSales: 'Rp 8,500,000', conversionRate: '21%', dealsClosedCount: 24, rank: 1 },
  { name: 'Roy Jr', totalSales: 'Rp 7,200,000', conversionRate: '19%', dealsClosedCount: 18, rank: 2 },
  { name: 'Adit M', totalSales: 'Rp 6,950,000', conversionRate: '17%', dealsClosedCount: 15, rank: 3 },
  { name: 'Budi Andrian', totalSales: 'Rp 4,300,000', conversionRate: '16%', dealsClosedCount: 12, rank: 4 },
  { name: 'Jane Doe', totalSales: 'Rp 3,200,000', conversionRate: '14%', dealsClosedCount: 10, rank: 5 },
];

const recentActivities = [
  { type: 'Deal closed', description: 'Jane S closed deal ABC Corp - Rp 1,350,000', time: '2 min ago', status: 'success' },
  { type: 'Deal moved', description: 'Roy Jr moved to Proposal stage', time: '5 min ago', status: 'info' },
  { type: 'New lead assigned', description: 'Our Company assigned to Mike T', time: '8 min ago', status: 'warning' },
];

export default function AnalyticsDashboard() {
  const [selectedYear, setSelectedYear] = useState('2024');

  // Analytics stat cards data
  const analyticsCardData: UserStatType[] = [
    {
      title: 'Total Sales',
      stats: '$125,430',
      avatarIcon: DollarSign,
      avatarColor: '#9c27b0',
      avatarBgColor: '#f3e5f5',
      trend: 'positive',
      trendNumber: '12.3%',
      subtitle: 'Last month'
    },
    {
      title: 'Conversion Rate',
      stats: '18.5%',
      avatarIcon: Target,
      avatarColor: '#e91e63',
      avatarBgColor: '#fce4ec',
      trend: 'negative',
      trendNumber: '1.2%',
      subtitle: 'Last month'
    },
    {
      title: 'Top Performer',
      stats: 'John Doe',
      avatarIcon: Users,
      avatarColor: '#4caf50',
      avatarBgColor: '#e8f5e8',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: '$74,650 / 7 Deals'
    },
    {
      title: 'Average Deal Size',
      stats: '$3,740',
      avatarIcon: Activity,
      avatarColor: '#ff9800',
      avatarBgColor: '#fff3e0',
      trend: 'positive',
      trendNumber: '5.4%',
      subtitle: 'Last month'
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        breadcrumbs={[
          { label: "Analytics" },
          { label: "Dashboard" },
        ]}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {analyticsCardData.map((item, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <CardStatistik {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Sales Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Sales Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data trend performance (This Week)
              </Typography>
            </Box>
            <Box display="flex" gap={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
                <Typography variant="body2">Series 1</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#ec4899', borderRadius: '50%' }} />
                <Typography variant="body2">Series 2</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#eab308', borderRadius: '50%' }} />
                <Typography variant="body2">Series 3</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="series1" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="series2" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="series3" 
                  stroke="#eab308" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Team Performance Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Team Performance Overview
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value="06/22/2020 - 06/22/2020"
                displayEmpty
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="06/22/2020 - 06/22/2020">06/22/2020 - 06/22/2020</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Stack spacing={3}>
            {teamPerformanceData.map((member, index) => (
              <Box key={index}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                    {member.name}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={member.value} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      bgcolor: '#2196f3'
                    }
                  }} 
                />
              </Box>
            ))}
          </Stack>
          
          {/* X-axis labels */}
          <Box display="flex" justifyContent="space-between" mt={2} px={1}>
            <Typography variant="caption" color="text.secondary">Rp 0</Typography>
            <Typography variant="caption" color="text.secondary">Rp 2,500,000</Typography>
            <Typography variant="caption" color="text.secondary">Rp 5,000,000</Typography>
            <Typography variant="caption" color="text.secondary">Rp 7,500,000</Typography>
            <Typography variant="caption" color="text.secondary">Rp 10,000,000</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Ranking */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Performance Ranking
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Total Sales</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Conversion Rate</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Deals Closed</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Rank</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceRankingData.map((person, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {person.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {person.totalSales}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {person.conversionRate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {person.dealsClosedCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {person.rank}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity (Optional)
            </Typography>
            <Button variant="text" size="small">
              View All
            </Button>
          </Box>
          <Stack spacing={2}>
            {recentActivities.map((activity, index) => (
              <Paper key={index} sx={{ p: 2, bgcolor: '#fafafa' }}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      mt: 1,
                      bgcolor: activity.status === 'success' ? '#4caf50' : 
                               activity.status === 'info' ? '#2196f3' : '#ff9800'
                    }} 
                  />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="medium">
                        {activity.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {activity.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}