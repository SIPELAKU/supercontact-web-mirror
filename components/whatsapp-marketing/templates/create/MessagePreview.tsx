// components/whatsapp-marketing/templates/create/MessagePreview.tsx
"use client";

import { Box, Typography, Stack } from '@mui/material';
import { List as ListIcon, ExternalLink, Phone, Reply, Copy } from 'lucide-react';
import { BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';

interface MessagePreviewProps {
  type: BroadcastTemplateType;
  formData: any;
}

// WhatsApp's own palette. Named rather than inlined because the same green
// appears on every bubble and the same blue on every button, and a preview
// whose colours drift from the real client stops being useful as a check.
const INCOMING_BG = '#FFFFFF';
const OUTGOING_BG = '#E7FFDB';
const ACTION_BLUE = '#00A5F4';
const HAIRLINE = 'rgba(0,0,0,0.08)';

const Hairline = () => <Box sx={{ height: '1px', bgcolor: HAIRLINE }} />;

/** Renders {{1}} placeholders in bold, the way the editor writes them. */
const formatMessage = (text: string) => {
  if (!text) return text;
  return text.split(/({{\d+}})/g).map((part, i) =>
    part.startsWith('{{') && part.endsWith('}}') ? (
      <Box key={i} component="span" sx={{ fontWeight: 800 }}>
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const Timestamp = () => (
  <Typography
    variant="caption"
    sx={{ color: 'text.secondary', fontSize: '10px', display: 'block', mt: 0.5, textAlign: 'right' }}
  >
    10:13
  </Typography>
);

/** One message bubble, with the small tail WhatsApp draws on the first one. */
const Bubble = ({
  children,
  bg = OUTGOING_BG,
  padded = true,
  width = '85%',
}: {
  children: React.ReactNode;
  bg?: string;
  padded?: boolean;
  width?: string;
}) => (
  <Box
    sx={{
      bgcolor: bg,
      borderRadius: '7.5px',
      borderTopLeftRadius: 0,
      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
      maxWidth: width,
      alignSelf: 'flex-start',
      overflow: 'hidden',
      ...(padded ? { p: 1 } : {}),
    }}
  >
    {children}
  </Box>
);

const iconFor = (kind?: string) => {
  const k = (kind || '').toUpperCase();
  if (k === 'URL') return <ExternalLink size={13} />;
  if (k === 'PHONE_NUMBER') return <Phone size={13} />;
  return <Reply size={13} />;
};

/** The stacked, hairline-separated button rows WhatsApp puts under a bubble. */
const ButtonRows = ({ actions }: { actions: any[] }) => {
  if (!actions?.length) return null;
  return (
    <Box>
      {actions.map((a, i) => (
        <Box key={i}>
          <Hairline />
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            justifyContent="center"
            sx={{ py: 0.9, color: ACTION_BLUE }}
          >
            {iconFor(a.type)}
            <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: ACTION_BLUE }}>
              {a.title || 'Button'}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

const MediaBlock = ({ url }: { url?: string }) =>
  url ? (
    <Box
      component="img"
      src={url}
      alt=""
      sx={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }}
      onError={(e: any) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <Box
      sx={{
        width: '100%',
        height: 90,
        bgcolor: 'rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Media
      </Typography>
    </Box>
  );

export default function MessagePreview({ type, formData }: MessagePreviewProps) {
  const body = formData.body;

  const renderContent = () => {
    switch (type) {
      case 'twilio/text':
        return (
          <Bubble>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {formatMessage(body || 'Hi {{1}}, how can I help you?')}
            </Typography>
            <Timestamp />
          </Bubble>
        );

      case 'twilio/media':
        return (
          <Bubble padded={false}>
            <MediaBlock url={formData.media?.[0]} />
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {formatMessage(body || 'Thank you for your order {{1}}')}
              </Typography>
              <Timestamp />
            </Box>
          </Bubble>
        );

      case 'twilio/call-to-action':
      case 'twilio/quick-reply':
        return (
          <Bubble padded={false}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {formatMessage(body || 'Pesan Anda muncul di sini')}
              </Typography>
              <Timestamp />
            </Box>
            <ButtonRows actions={formData.actions || []} />
          </Bubble>
        );

      case 'twilio/card':
        return (
          <Bubble padded={false}>
            <MediaBlock url={formData.media?.[0]} />
            <Box sx={{ p: 1 }}>
              {formData.title ? (
                <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>
                  {formatMessage(formData.title)}
                </Typography>
              ) : null}
              {formData.subtitle ? (
                <Typography sx={{ fontSize: '12.5px', color: 'text.secondary' }}>
                  {formatMessage(formData.subtitle)}
                </Typography>
              ) : null}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px', mt: 0.5 }}>
                {formatMessage(body || 'Rincian penawaran')}
              </Typography>
              <Timestamp />
            </Box>
            <ButtonRows actions={formData.actions || []} />
          </Bubble>
        );

      case 'twilio/carousel': {
        const cards = formData.cards || [];
        return (
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Bubble>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {formatMessage(body || 'Lihat pilihan kami')}
              </Typography>
              <Timestamp />
            </Bubble>
            {/* Horizontally swipeable, because the swipe IS the format. A
                stacked list would preview something WhatsApp never renders. */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 0.5,
                mx: -1.5,
                px: 1.5,
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 },
              }}
            >
              {(cards.length ? cards : [{}, {}]).map((card: any, i: number) => (
                <Box
                  key={i}
                  sx={{
                    minWidth: '72%',
                    scrollSnapAlign: 'start',
                    bgcolor: INCOMING_BG,
                    borderRadius: '7.5px',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    overflow: 'hidden',
                  }}
                >
                  <MediaBlock url={card.media?.[0]} />
                  <Box sx={{ p: 1 }}>
                    {card.title ? (
                      <Typography sx={{ fontSize: '13.5px', fontWeight: 700 }}>
                        {formatMessage(card.title)}
                      </Typography>
                    ) : null}
                    <Typography sx={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {formatMessage(card.body || `Card ${i + 1}`)}
                    </Typography>
                  </Box>
                  <ButtonRows actions={card.actions || []} />
                </Box>
              ))}
            </Box>
          </Stack>
        );
      }

      case 'twilio/list-picker': {
        const items = formData.items || [];
        return (
          <Bubble padded={false}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {formatMessage(body || 'Pilih salah satu')}
              </Typography>
              <Timestamp />
            </Box>
            <Hairline />
            {/* WhatsApp shows ONE button that opens a sheet - the items are not
                listed in the bubble. Previewing them inline would flatter the
                design and mislead the author about how much text is visible. */}
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 0.9, color: ACTION_BLUE }}
            >
              <ListIcon size={13} />
              <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: ACTION_BLUE }}>
                {formData.button || 'Lihat pilihan'}
              </Typography>
            </Stack>
            {items.length ? (
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', px: 1, py: 0.75 }}>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary', mb: 0.5 }}>
                  MEMBUKA DAFTAR
                </Typography>
                <Stack spacing={0.5}>
                  {items.slice(0, 3).map((it: any, i: number) => (
                    <Box key={i}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                        {it.item || `Item ${i + 1}`}
                      </Typography>
                      {it.description ? (
                        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                          {it.description}
                        </Typography>
                      ) : null}
                    </Box>
                  ))}
                  {items.length > 3 ? (
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                      +{items.length - 3} lainnya
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            ) : null}
          </Bubble>
        );
      }

      case 'whatsapp/card':
        return (
          <Bubble>
            {formData.header_text ? (
              <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.25 }}>
                {formatMessage(formData.header_text)}
              </Typography>
            ) : null}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {formatMessage(body || 'Gunakan {{1}}')}
            </Typography>
            <Timestamp />
          </Bubble>
        );

      case 'whatsapp/authentication': {
        const minutes = formData.code_expiration_minutes;
        return (
          <Bubble padded={false}>
            <Box sx={{ p: 1 }}>
              {/* WhatsApp writes this copy itself - it is shown greyed to make
                  clear the author cannot change it. */}
              <Typography variant="body2" sx={{ fontSize: '14px' }}>
                <Box component="span" sx={{ fontWeight: 800 }}>123456</Box> adalah kode
                verifikasi Anda.
              </Typography>
              {formData.add_security_recommendation ? (
                <Typography sx={{ fontSize: '13px', mt: 0.5 }}>
                  Demi keamanan, jangan bagikan kode ini.
                </Typography>
              ) : null}
              {minutes ? (
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>
                  Kode ini kedaluwarsa dalam {minutes} menit.
                </Typography>
              ) : null}
              <Timestamp />
            </Box>
            <Hairline />
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 0.9, color: ACTION_BLUE }}
            >
              <Copy size={13} />
              <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: ACTION_BLUE }}>
                {formData.actions?.[0]?.copy_code_text || 'Salin kode'}
              </Typography>
            </Stack>
          </Bubble>
        );
      }

      case 'whatsapp/flows':
        return (
          <Bubble padded={false}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {formatMessage(body || 'Isi survei singkat kami')}
              </Typography>
              <Timestamp />
            </Box>
            <Hairline />
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 0.9, color: ACTION_BLUE }}
            >
              <ExternalLink size={13} />
              <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: ACTION_BLUE }}>
                {formData.button_text || 'Mulai'}
              </Typography>
            </Stack>
          </Bubble>
        );

      default:
        return (
          <Bubble>
            <Typography variant="body2" color="text.secondary">
              Pratinjau untuk {type} belum tersedia.
            </Typography>
          </Bubble>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
        Message Preview
      </Typography>

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
          backgroundImage:
            'url(https://raw.githubusercontent.com/AnshulRaja/WhatsApp-Clone-React/master/src/assets/bg.png)',
          backgroundSize: 'cover',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100px', height: '24px', bgcolor: '#333', borderRadius: '0 0 15px 15px' }} />
        </Box>

        <Box sx={{ bgcolor: '#075E54', p: 3.5, pb: 1.5, color: 'white' }}>
          <Typography variant="caption" fontWeight="bold">
            Your phone number
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
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
