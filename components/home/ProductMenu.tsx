import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Tabs,
    Tab,
    Paper,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MapIcon from '@mui/icons-material/Map';
import HubIcon from '@mui/icons-material/Hub';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CampaignIcon from '@mui/icons-material/Campaign';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{ width: '100%', height: '100%' }}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MenuItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}>
        <Box sx={{ color: 'text.secondary', mt: 0.5 }}>
            {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'large' })}
        </Box>
        <Box>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '250px' }}>
                {desc}
            </Typography>
        </Box>
    </Box>
);

interface ProductMenuProps {
    isMobile?: boolean;
}

const ProductMenu = ({ isMobile }: ProductMenuProps) => {
    useLanguage();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
                {/* CRM Section */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        {strings.product_menu_crm}
                    </Typography>
                    <Stack spacing={1}>
                        <MenuItem icon={<BusinessIcon />} title={strings.pm_crm_sales} desc={strings.pm_crm_sales_desc} />
                        <MenuItem icon={<SupportAgentIcon />} title={strings.pm_crm_services} desc={strings.pm_crm_services_desc} />
                        <MenuItem icon={<MapIcon />} title={strings.pm_crm_canvassing} desc={strings.pm_crm_canvassing_desc} />
                    </Stack>
                </Box>
                {/* Omnichannel Section */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        {strings.product_menu_omnichannel}
                    </Typography>
                    <Stack spacing={1}>
                        <MenuItem icon={<HubIcon />} title={strings.pm_omni_omni} desc={strings.pm_omni_omni_desc} />
                        <MenuItem icon={<InstagramIcon />} title={strings.pm_omni_ig} desc={strings.pm_omni_ig_desc} />
                        <MenuItem icon={<ConfirmationNumberIcon />} title={strings.pm_omni_ticket} desc={strings.pm_omni_ticket_desc} />
                    </Stack>
                </Box>
                {/* WhatsApp Section */}
                {/* <Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        {strings.product_menu_wa}
                    </Typography>
                    <Stack spacing={1}>
                        <MenuItem icon={<WhatsAppIcon />} title={strings.pm_wa_api} desc={strings.pm_wa_api_desc} />
                        <MenuItem icon={<CampaignIcon />} title={strings.pm_wa_ads} desc={strings.pm_wa_ads_desc} />
                        <MenuItem icon={<RocketLaunchIcon />} title={strings.pm_wa_blast} desc={strings.pm_wa_blast_desc} />
                    </Stack>
                </Box> */}
            </Box>
        );
    }

    return (
        <Paper
            elevation={4}
            sx={{
                display: 'flex',
                width: '100%',
                maxWidth: '1300px',
                minHeight: '400px',
                bgcolor: 'background.paper',
                borderRadius: '24px',
                overflow: 'hidden',
                mt: 1.5,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box sx={{ width: '280px', p: 3 }}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Product tabs"
                    TabIndicatorProps={{ sx: { display: 'none' } }}
                    sx={{
                        '& .MuiTab-root': {
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textTransform: 'none',
                            textAlign: 'left',
                            px: 3,
                            py: 1.5,
                            mb: 1,
                            minHeight: '48px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: '99px',
                            color: 'primary.main',
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                color: 'common.white',
                                bgcolor: 'primary.main',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                            },
                            '&:hover:not(.Mui-selected)': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                            }
                        }
                    }}
                >
                    <Tab
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {strings.product_menu_crm}
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {strings.product_menu_omnichannel}
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {strings.product_menu_wa}
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, bgcolor: '#EEF2FF', m: 2, borderRadius: '16px', p: 1 }}>
                <TabPanel value={value} index={0}>
                    <Grid container spacing={2} alignItems="center" sx={{ height: '100%', px: 2 }}>
                        <Grid item xs={4}>
                            <MenuItem icon={<BusinessIcon />} title={strings.pm_crm_sales} desc={strings.pm_crm_sales_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<SupportAgentIcon />} title={strings.pm_crm_services} desc={strings.pm_crm_services_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<MapIcon />} title={strings.pm_crm_canvassing} desc={strings.pm_crm_canvassing_desc} />
                        </Grid>
                    </Grid>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Grid container spacing={2} alignItems="center" sx={{ height: '100%', px: 2 }}>
                        <Grid item xs={4}>
                            <MenuItem icon={<HubIcon />} title={strings.pm_omni_omni} desc={strings.pm_omni_omni_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<InstagramIcon />} title={strings.pm_omni_ig} desc={strings.pm_omni_ig_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<ConfirmationNumberIcon />} title={strings.pm_omni_ticket} desc={strings.pm_omni_ticket_desc} />
                        </Grid>
                    </Grid>
                </TabPanel>
                {/* <TabPanel value={value} index={2}>
                    <Grid container spacing={2} alignItems="center" sx={{ height: '100%', px: 2 }}>
                        <Grid item xs={4}>
                            <MenuItem icon={<WhatsAppIcon />} title={strings.pm_wa_api} desc={strings.pm_wa_api_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<CampaignIcon />} title={strings.pm_wa_ads} desc={strings.pm_wa_ads_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<RocketLaunchIcon />} title={strings.pm_wa_blast} desc={strings.pm_wa_blast_desc} />
                        </Grid>
                    </Grid>
                </TabPanel> */}
            </Box>
        </Paper>
    );
};

export default ProductMenu;
