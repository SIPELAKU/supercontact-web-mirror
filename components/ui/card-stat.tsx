'use client'

import React from 'react'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'


export type UserStatType = {
  title: string
  stats: string
  avatarIcon: React.ElementType
  avatarColor?: string
  avatarBgColor?: string
  trend: 'positive' | 'negative'
  trendNumber: string
  subtitle: string
}

const CardStatistik = (props: UserStatType) => {
  const {
    title,
    stats,
    avatarIcon: Icon,
    avatarColor = '#64748b',
    avatarBgColor ='#fff',
    trend,
    trendNumber,
    subtitle
  } = props

  return (
    <Card>
      <CardContent className='flex justify-between gap-1'>
        <div className='flex flex-col gap-1'>
          <Typography color='text.primary'>{title}</Typography>

          <div className='flex items-center gap-2 flex-wrap'>
            <Typography variant='h4'>{stats}</Typography>
            <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
              {`(${trend === 'negative' ? '-' : '+'}${trendNumber})`}
            </Typography>
          </div>

          <Typography variant='body2'>{subtitle}</Typography>
        </div>

        <Avatar
          sx={{
            width: 42,
            height: 42,
            backgroundColor: avatarBgColor,
            color: avatarColor,
          }}
        >
          <Icon size={24} />
        </Avatar>
      </CardContent>
    </Card>
  )
}

export default CardStatistik