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
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import ComputerIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import CachedIcon from '@mui/icons-material/Cached'; // For "Operational" / Cycle
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Link from 'next/link';


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
                <Box sx={{ p: 2, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MenuItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 0.5, p: 0.75, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}>
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

interface SolutionMenuProps {
    isMobile?: boolean;
}

const SolutionMenu = ({ isMobile }: SolutionMenuProps) => {
    useLanguage();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
                {/* Industry Section */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        {strings.sol_menu_industry}
                    </Typography>
                    <Stack spacing={1}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}><MenuItem icon={<SchoolIcon />} title={strings.sol_ind_edu} desc={strings.sol_ind_edu_desc} /></Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/keuangan" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<AccountBalanceIcon />} title={strings.sol_ind_finance} desc={strings.sol_ind_finance_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}><MenuItem icon={<LocalHospitalIcon />} title={strings.sol_ind_health} desc={strings.sol_ind_health_desc} /></Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/tour-travel" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<FlightIcon />} title={strings.sol_ind_travel} desc={strings.sol_ind_travel_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/perhotelan" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<HotelIcon />} title={strings.sol_ind_hotel} desc={strings.sol_ind_hotel_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/logistik" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<LocalShippingIcon />} title={strings.sol_ind_logistics} desc={strings.sol_ind_logistics_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/fmcg" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<ShoppingCartIcon />} title={strings.sol_ind_fmcg} desc={strings.sol_ind_fmcg_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/ritel" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<StoreIcon />} title={strings.sol_ind_retail} desc={strings.sol_ind_retail_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                <Link href="/solusi/it-saas" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <MenuItem icon={<ComputerIcon />} title={strings.sol_ind_it} desc={strings.sol_ind_it_desc} />
                                </Link>
                            </Grid>
                            <Grid item xs={12}><MenuItem icon={<GroupsIcon />} title={strings.sol_ind_outsourcing} desc={strings.sol_ind_outsourcing_desc} /></Grid>
                        </Grid>
                    </Stack>
                </Box>
                {/* Roles Section */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        {strings.sol_menu_roles}
                    </Typography>
                    <Stack spacing={1}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}><MenuItem icon={<TrendingUpIcon />} title={strings.sol_role_sales} desc={strings.sol_role_sales_desc} /></Grid>
                            <Grid item xs={12}><MenuItem icon={<SupportAgentIcon />} title={strings.sol_role_cs} desc={strings.sol_role_cs_desc} /></Grid>
                            <Grid item xs={12}><MenuItem icon={<CampaignIcon />} title={strings.sol_role_marketing} desc={strings.sol_role_marketing_desc} /></Grid>
                            <Grid item xs={12}><MenuItem icon={<PeopleIcon />} title={strings.sol_role_hr} desc={strings.sol_role_hr_desc} /></Grid>
                            <Grid item xs={12}><MenuItem icon={<CachedIcon />} title={strings.sol_role_ops} desc={strings.sol_role_ops_desc} /></Grid>
                        </Grid>
                    </Stack>
                </Box>
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
                minHeight: '280px',
                bgcolor: 'background.paper',
                borderRadius: '24px',
                overflow: 'hidden',
                mt: 1.5,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box
                sx={{
                    width: '200px',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    p: 2
                }}
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Solution tabs"
                    TabIndicatorProps={{ sx: { display: 'none' } }}
                    sx={{
                        width: '100%',
                        '& .MuiTab-root': {
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textTransform: 'none',
                            textAlign: 'left',
                            px: 3,
                            py: 1,
                            mb: 0.5,
                            minHeight: '44px',
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
                                {strings.sol_menu_industry}
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {strings.sol_menu_roles}
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, bgcolor: '#EEF2FF', m: 1.5, borderRadius: '16px', p: 0.5 }}>
                <TabPanel value={value} index={0}>
                    <Grid container spacing={2} alignItems="center" sx={{ height: '100%', px: 2 }}>
                        <Grid item xs={4}>
                            <MenuItem icon={<SchoolIcon />} title={strings.sol_ind_edu} desc={strings.sol_ind_edu_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/keuangan" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<AccountBalanceIcon />} title={strings.sol_ind_finance} desc={strings.sol_ind_finance_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<LocalHospitalIcon />} title={strings.sol_ind_health} desc={strings.sol_ind_health_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/tour-travel" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<FlightIcon />} title={strings.sol_ind_travel} desc={strings.sol_ind_travel_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/perhotelan" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<HotelIcon />} title={strings.sol_ind_hotel} desc={strings.sol_ind_hotel_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/logistik" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<LocalShippingIcon />} title={strings.sol_ind_logistics} desc={strings.sol_ind_logistics_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/fmcg" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<ShoppingCartIcon />} title={strings.sol_ind_fmcg} desc={strings.sol_ind_fmcg_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/ritel" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<StoreIcon />} title={strings.sol_ind_retail} desc={strings.sol_ind_retail_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <Link href="/solusi/it-saas" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem icon={<ComputerIcon />} title={strings.sol_ind_it} desc={strings.sol_ind_it_desc} />
                            </Link>
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<GroupsIcon />} title={strings.sol_ind_outsourcing} desc={strings.sol_ind_outsourcing_desc} />
                        </Grid>
                    </Grid>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Grid container spacing={2} alignItems="center" sx={{ height: '100%', px: 2 }}>
                        <Grid item xs={4}>
                            <MenuItem icon={<TrendingUpIcon />} title={strings.sol_role_sales} desc={strings.sol_role_sales_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<SupportAgentIcon />} title={strings.sol_role_cs} desc={strings.sol_role_cs_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<CampaignIcon />} title={strings.sol_role_marketing} desc={strings.sol_role_marketing_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<PeopleIcon />} title={strings.sol_role_hr} desc={strings.sol_role_hr_desc} />
                        </Grid>
                        <Grid item xs={4}>
                            <MenuItem icon={<CachedIcon />} title={strings.sol_role_ops} desc={strings.sol_role_ops_desc} />
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>
        </Paper>
    );
};

export default SolutionMenu;
