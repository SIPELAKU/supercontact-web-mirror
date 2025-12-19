'use client'

import { Users, UserCheck, UserSearch } from 'lucide-react';
import Grid from '@mui/material/Grid';

import CardStatistik, { UserStatType } from '../../components/ui/card-stat'
import { useUsers } from '../../lib/hooks/useUsers';

const CardStatUser = () => {
  const { data: usersResponse } = useUsers()
  const users = usersResponse?.data?.users || []

  const totalUsers = users?.length ?? 0
  // Since API users don't have 'status', we'll assume all users are active for now
  // You may need to adjust this logic based on your actual requirements
  const activeUsers = users?.length ?? 0 // All users are considered active
  const pendingUsers = 0 // No pending users in current API structure

  const cardData: UserStatType[] = [
    {
      title: 'Session',
      stats: totalUsers.toLocaleString(),
      avatarIcon: Users,
      avatarColor: '#5479EE',
      avatarBgColor: '#E4ECFF',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: 'Total User'
    },
    {
      title: 'Active Users',
      stats: activeUsers.toLocaleString(),
      avatarIcon: UserCheck,
      avatarColor: '#22c55e',
      avatarBgColor: '#DCFCE7',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: 'Active users'
    },
    {
      title: 'Pending Users',
      stats: pendingUsers.toLocaleString(),
      avatarIcon: UserSearch,
      avatarColor: '#f59e0b',
      avatarBgColor: '#FEF3C7',
      trend: 'negative',
      trendNumber: '0%',
      subtitle: 'Pending approval'
    }
  ]

  return (
    <Grid container spacing={6}>
      {cardData.map((item, i) => (
        <Grid key={i} xs={12} sm={6} md={4}>
          <CardStatistik {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default CardStatUser
