'use client'

import { Users, UserCheck, UserSearch } from 'lucide-react';
import Grid from '@mui/material/Grid';

import CardStatistik, { UserStatType } from '../../components/ui/card-stat'
import useUsers from '../../lib/hooks/useUsers';

const CardStatUser = () => {
  const { users } = useUsers()

  const totalUsers = users?.length ?? 0
  const activeUsers = users?.filter(u => u.status === 'active').length ?? 0
  const pendingUsers = users?.filter(u => u.status === 'pending').length ?? 0

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
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <CardStatistik {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default CardStatUser
