'use client'

import { Upload } from 'lucide-react'
import { Button } from '@mui/material'

export default function ExportButton() {
  return (
    <Button
      variant="outlined"
      startIcon={<Upload size={18} />}
      className="border-[#D0D5DD] capitalize! text-[#344054]"
      sx={{
        paddingX: '25x',
        paddingY: '5px',
        borderRadius: '8px',
        borderColor: '#D0D5DD',
        color: '#344054',
        '&:hover': {
          borderColor: '#5479EE',
          backgroundColor: 'rgba(84,121,238,0.05)'
        }
      }}
    >
      Export
    </Button>
  )
}
