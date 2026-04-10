// components/whatsapp-marketing/templates/create/MessagePreview.tsx
"use client";

import { Box, Typography, Stack, Card, CardMedia, Button } from '@mui/material';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';

interface MessagePreviewProps {
  type: BroadcastTemplateType;
  formData: any;
}

export default function MessagePreview({
  type,
  formData
}: MessagePreviewProps) {
  const formatMessage = (text: string) => {
    if (!text) return text;
    const parts = text.split(/({{\d+}})/g);
    return parts.map((part, i) =>
      part.startsWith('{{') && part.endsWith('}}') ? (
        <Box key={i} component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'twilio/text':
        return (
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#E7FFDB',
              borderRadius: 2,
              boxShadow: 1,
              maxWidth: '85%',
              alignSelf: 'flex-start',
              position: 'relative'
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formatMessage(formData.body || 'Hi {{1}}, how can I help you?')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'flex-end', fontSize: '10px', display: 'block', mt: 0.5, textAlign: 'right' }}>
              10:13
            </Typography>
          </Box>
        );
      case 'twilio/media':
        return (
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              maxWidth: '85%',
              alignSelf: 'flex-start',
              overflow: 'hidden'
            }}
          >
            {formData.media?.[0] && (
              <CardMedia
                component="img"
                image={formData.media[0]}
                alt="preview"
                sx={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover' }}
              />
            )}
            <Box sx={{ p: 1, bgcolor: '#E7FFDB' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formatMessage(formData.body || 'Thank you for your order {{1}}')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', display: 'block', mt: 0.5, textAlign: 'right' }}>
                10:13
              </Typography>
            </Box>
          </Box>
        );
      case 'twilio/call-to-action':
        return (
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              maxWidth: '85%',
              alignSelf: 'flex-start',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 1, bgcolor: '#E7FFDB' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formatMessage(formData.body || 'Flight status update')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', display: 'block', mt: 0.5, textAlign: 'right' }}>
                10:13
              </Typography>
            </Box>
            <Divider sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
            <Stack>
              {(formData.actions || []).map((action: any, i: number) => (
                <Button
                  key={i}
                  fullWidth
                  size="small"
                  sx={{
                    borderRadius: 0,
                    color: '#007AFF',
                    textTransform: 'none',
                    py: 1,
                    borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {action.title || 'Button'}
                </Button>
              ))}
            </Stack>
          </Box>
        );
      default:
        return (
          <Typography variant="body2" color="black">
            Preview for {type} is coming soon.
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
        Message Preview
      </Typography>

      {/* Mobile Mockup Container */}
      <Box
        sx={{
          mx: 'auto',
          width: '280px',
          height: '560px',
          bgcolor: '#DCF8C6',
          borderRadius: '40px',
          border: '12px solid #333',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'url(https://raw.githubusercontent.com/AnshulRaja/WhatsApp-Clone-React/master/src/assets/bg.png)',
          backgroundSize: 'cover'
        }}
      >
        {/* Notch */}
        <Box sx={{ position: 'absolute', top: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100px', height: '24px', bgcolor: '#333', borderRadius: '0 0 15px 15px' }} />
        </Box>

        {/* Chat Header */}
        <Box sx={{ bgcolor: '#075E54', p: 3.5, pb: 1.5, color: 'white' }}>
          <Typography variant="caption" fontWeight="bold">Your phone number</Typography>
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            p: 1.5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto'
          }}
        >
          {/* Today Divider */}
          <Box sx={{ alignSelf: 'center', bgcolor: '#F0F2F5', px: 1, py: 0.5, borderRadius: 1.5, my: 1 }}>
            <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 'bold' }}>
              TODAY
            </Typography>
          </Box>

          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}

const Divider = ({ sx }: { sx?: any }) => <Box sx={{ height: '1px', width: '100%', ...sx }} />;
