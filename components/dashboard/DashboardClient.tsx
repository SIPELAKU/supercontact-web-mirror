"use client";

import CardStatistik, { UserStatType } from "@/components/ui/card-stat";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
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
    DollarSign,
    Target,
    TrendingUp,
    Users
} from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Sample data for charts
const salesFunnelData = [
  { stage: 'Prospecting', count: 120, value: 45 },
  { stage: 'Qualification', count: 85, value: 32 },
  { stage: 'Proposal', count: 45, value: 17 },
  { stage: 'Negotiation', count: 25, value: 9 },
  { stage: 'Closed Won', count: 15, value: 6 },
];

const revenueGrowthData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 55000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 61000, target: 60000 },
  { month: 'May', revenue: 55000, target: 58000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
];

const topDealsData = [
  { dealName: 'Acme Corp Website Redesign', company: 'Acme Corporation', value: '$75,000', closeDate: '2024-01-15' },
  { dealName: 'PT. Solvera Mobile App Development', company: 'Solvera Ltd.', value: '$45,500', closeDate: '2024-01-20' },
  { dealName: 'Global Tech Consulting', company: 'Global Tech', value: '$32,000', closeDate: '2024-01-25' },
  { dealName: 'Stark Industries Contract', company: 'Stark Industries', value: '$28,000', closeDate: '2024-02-01' },
  { dealName: 'Wayne Enterprises Deal', company: 'Wayne Enterprises', value: '$18,000', closeDate: '2024-02-05' },
];

const recentActivities = [
  { type: 'New lead assigned', description: 'Alex Johnson assigned to John Smith', time: '2 min ago', status: 'info' },
  { type: 'Deal moved', description: 'Acme Corp moved to Proposal stage', time: '5 min ago', status: 'warning' },
  { type: 'Quotation sent', description: 'Quotation sent to Solvera Ltd Tech', time: '8 min ago', status: 'success' },
  { type: 'Task due follow up', description: 'Task due follow up with Stark Industries', time: '12 min ago', status: 'error' },
];

export default function DashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // Main dashboard stat cards data
  const dashboardCardData: UserStatType[] = [
    {
      title: 'New Leads',
      stats: '15',
      avatarIcon: Users,
      avatarColor: '#2196f3',
      avatarBgColor: '#e3f2fd',
      trend: 'positive',
      trendNumber: '8.2%',
      subtitle: 'This month'
    },
    {
      title: 'Deals Won',
      stats: '5',
      avatarIcon: Target,
      avatarColor: '#4caf50',
      avatarBgColor: '#e8f5e8',
      trend: 'positive',
      trendNumber: '12.5%',
      subtitle: 'This month'
    },
    {
      title: 'Total Revenue',
      stats: '$50,000',
      avatarIcon: DollarSign,
      avatarColor: '#ff9800',
      avatarBgColor: '#fff3e0',
      trend: 'positive',
      trendNumber: '15.3%',
      subtitle: 'This month'
    },
    {
      title: 'Average Deal Size',
      stats: '$10,000',
      avatarIcon: TrendingUp,
      avatarColor: '#9c27b0',
      avatarBgColor: '#f3e5f5',
      trend: 'negative',
      trendNumber: '2.1%',
      subtitle: 'This month'
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboardCardData.map((item, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <CardStatistik {...item} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Funnel Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Sales Funnel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesFunnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="stage" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#666' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
                <Button variant="text" size="small">
                  View All
                </Button>
              </Box>
              <Stack spacing={2} sx={{ flex: 1, overflow: 'auto' }}>
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
                                   activity.status === 'info' ? '#2196f3' : 
                                   activity.status === 'warning' ? '#ff9800' : '#f44336'
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
        </Grid>
      </Grid>

      {/* Revenue Growth Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Revenue Growth
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 6 Months
              </Typography>
            </Box>
            <Box display="flex" gap={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
                <Typography variant="body2">Actual</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#e5e7eb', borderRadius: '50%' }} />
                <Typography variant="body2">Target</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueGrowthData}>
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
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#e5e7eb" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Top Deals Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Top Deals
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="This Week">This Week</MenuItem>
                <MenuItem value="This Month">This Month</MenuItem>
                <MenuItem value="This Quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Deal Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Close Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topDealsData.map((deal, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {deal.dealName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {deal.company}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {deal.value}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {deal.closeDate}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}
