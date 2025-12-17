'use client'

import BannerDashboard from "@/components/ui/banner-dashboard"
import { useState, useMemo, JSX } from "react"
import { IoIosSearch } from "react-icons/io"
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { styled } from '@mui/material/styles'
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress'
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RateReviewIcon from '@mui/icons-material/RateReview';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'var(--mui-palette-customColors-trackBg, #EEF2F6)'
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#22c55e',
    ...theme.applyStyles('dark', {
      backgroundColor: '#308fe8'
    })
  }
}))

const ProgressBar = ({ value }: { value: number }) => {
  let barColor = '#00FF3F'
  let trackColor = '#F1FFEF'
  if (value == 0) trackColor = '#EEF2F6'
  else if (value < 20) barColor = '#FF0045', trackColor = '#FFEFF1'
  else if (value < 70) barColor = '#FFBC31',  trackColor = '#FFFBEE'

  return (
    <BorderLinearProgress
      variant='determinate'
      value={value}
      color="primary"
      sx={{width: '100%', '& .MuiLinearProgress-bar': { backgroundColor: barColor }, '&.MuiLinearProgress-colorPrimary': {backgroundColor: trackColor}}}
    />
  )
}

type Status = 'To do' | 'In Progress' | 'In Review'

interface Task {
  id: string
  title: string
  status: Status
  progress: number
}

const TASKS: Task[] = [
  { id: '1', title: "Follow up with Lead 'Mr. Budi' regarding the new", status: 'To do', progress: 0 },
  { id: '2', title: "Schedule a meeting with Team 'Marketing' to discuss campaign", status: 'To do', progress: 0 },
  { id: '3', title: 'Review the budget proposal for the upcoming project', status: 'To do', progress: 0 },

  { id: '4', title: 'Check in with Mr. Budi about the latest updates.', status: 'In Progress', progress: 78 },
  { id: '5', title: 'Arrange a meeting with the Marketing team to go over the campaign.', status: 'In Progress', progress: 18 },
  { id: '6', title: 'Examine the budget proposal for the next project.', status: 'In Progress', progress: 49 },

  { id: '7', title: 'Touch base with Mr. Budi for the latest updates.', status: 'In Review', progress: 100 },
  { id: '8', title: 'Schedule a meeting with the Marketing team to discuss the campaign.', status: 'In Review', progress: 100 },
  { id: '9', title: 'Review the budget proposal for the upcoming project.', status: 'In Review', progress: 100 }
]

const statusColor: Record<Status, string> = {
  'To do': '#000',
  'In Progress': '#8000FC',
  'In Review': '#00C2F8'
}

const bgColor: Record<Status, string> ={
  'To do': '#EEEDF0',
  'In Progress': '#E8E1FE',
  'In Review': '#D7F7FE'
}

const statusIcon: Record<Status, JSX.Element> = {
  'To do': <EventNoteIcon sx={{ fontSize: 28 }} />,
  'In Progress': <PanoramaFishEyeIcon sx={{ fontSize: 28 }} />,
  'In Review': <RateReviewIcon sx={{ fontSize: 28 }} />,
}

export default function MyTaskPage() {
  const [search, setSearch] = useState('')
  const [filterView, setFilterView] = useState<'All' | 'Status'>('All')

  const filteredTasks = useMemo(() => {
    return TASKS.filter(task =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const grouped = useMemo(() => ({
    'To do': filteredTasks.filter(t => t.status === 'To do'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'In Review': filteredTasks.filter(t => t.status === 'In Review')
  }), [filteredTasks])

  const gridCols = 'grid grid-cols-[1fr_140px_180px_60px] items-center gap-4'

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <BannerDashboard title="My Task" breadcrumbs={["Home", "My Task"]} />

      {/* Filter */}
      <div className="w-full flex gap-4 border-b pb-4">
        <div className="relative w-full">
          <IoIosSearch className="absolute text-xl left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Task"
            className="border w-full border-gray-300 rounded-full pl-10 pr-4 py-2"
          />
        </div>

        <select
          value={filterView}
          onChange={e => setFilterView(e.target.value as any)}
          className="border border-gray-300 p-2 rounded-md w-44"
        >
          <option value="All">All Task</option>
          <option value="Status">Status</option>
        </select>
      </div>

      {/* Content */}
      <Box className='flex flex-col gap-6'>
        {filterView === 'All' && (
          <Card variant='outlined'>
            <CardContent className='flex flex-col gap-4'>
              <Box className={`${gridCols} px-2 text-sm border-b p-4`}>
                <Typography variant="caption" fontWeight={600} color="#000">
                  TASK NAME
                </Typography>
                <Typography variant="caption" fontWeight={600} textAlign={"center"} color="#000">
                  STATUS
                </Typography>
                <Typography variant="caption" fontWeight={600} textAlign={"center"} color="#000">
                  PROGRESS
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  textAlign={"center"}
                  color="#000"
                >
                  ACTION
                </Typography>
              </Box>
              {filteredTasks.map(task => (
                <Box
                  key={task.id}
                  className={`${gridCols}`}
                >
                  <Typography variant='body2' sx={{fontSize: '16px'}}>{task.title}</Typography>

                  <Chip
                    label={task.status}
                    size='small'
                    sx={{
                        borderColor: statusColor[task.status],
                        color: statusColor[task.status],
                        background: bgColor[task.status],
                        fontSize: '13px'
                    }}
                  />

                  <Box className='flex flex-col items-start min-w-40'>
                    <Typography variant='caption'>{task.progress}%</Typography>
                    <ProgressBar value={task.progress} />
                  </Box>

                  <IconButton size='small'>
                    <OpenInNewIcon fontSize='small' />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {filterView === 'Status' && (
          (Object.keys(grouped) as Status[]).map(status => (
            grouped[status].length > 0 && (
              <Card key={status} variant='outlined'>
                <CardContent className='flex flex-col gap-4'>
                  <Typography fontWeight={600} sx={{
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#8000FC'
                    }}>{statusIcon[status]} {status}</Typography>
                  <Box className={`${gridCols} px-2 text-sm border-b p-4`}>
                    <Typography variant="caption" fontWeight={600} color="#000">
                      TASK NAME
                    </Typography>
                    <Typography variant="caption" fontWeight={600} textAlign={"center"} color="#000">
                      STATUS
                    </Typography>
                    <Typography variant="caption" fontWeight={600} textAlign={"center"} color="#000">
                      PROGRESS
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      textAlign={"center"}
                      color="#000"
                    >
                      ACTION
                    </Typography>
                  </Box>
                  {grouped[status].map(task => (
                    <Box
                      key={task.id}
                      className={`${gridCols}`}
                      // className='grid grid-cols-[1fr_120px_160px_40px] items-center gap-4'
                    >
                      <Typography variant='body2' sx={{fontSize: '16px'}}>{task.title}</Typography>

                      <Chip
                        label={task.status}
                        size='small'
                        sx={{
                            borderColor: statusColor[task.status],
                            color: statusColor[task.status],
                            background: bgColor[task.status],
                            fontSize: '13px'
                        }}
                      />

                      <Box className='flex flex-col items-start min-w-40'>
                        <Typography variant='caption'>{task.progress}%</Typography>
                        <ProgressBar value={task.progress}/>
                      </Box>

                      <IconButton size='small'>
                        <OpenInNewIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )
          ))
        )}
      </Box>
    </div>
  )
}
