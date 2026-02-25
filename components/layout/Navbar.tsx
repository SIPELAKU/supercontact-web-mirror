'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import { usePathname, useRouter } from 'next/navigation';
import { Stack, Popover, Button, alpha } from '@mui/material';
import { useLanguage } from '@/lib/context/LanguageContext';
import { strings } from '@/lib/utils/strings';
import ProductMenu from '../home/ProductMenu';
import SolutionMenu from '../home/SolutionMenu';
import { AppButton } from '../ui/app-button';
import { MenuIcon } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [anchorElProduct, setAnchorElProduct] = useState<null | HTMLElement>(null);
  const openProduct = Boolean(anchorElProduct);

  const handleClickProduct = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProduct(toolbarRef.current || event.currentTarget);
  };

  const handleCloseProduct = () => {
    setAnchorElProduct(null);
  };

  const [anchorElSolution, setAnchorElSolution] = useState<null | HTMLElement>(null);
  const openSolution = Boolean(anchorElSolution);

  const handleClickSolution = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSolution(toolbarRef.current || event.currentTarget);
  };

  const handleCloseSolution = () => {
    setAnchorElSolution(null);
  };

  const handleOpenNavMenu = () => {
    setAnchorElNav(document.body);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleToggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const menuItems = [
    { label: strings.home, path: '/' },
    { label: strings.product, path: '#' },
    { label: strings.price, path: '/price' },
    { label: strings.solution, path: '#' },
    { label: strings.company, path: '/company' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: scrolled ? alpha('#ffffff', 0.8) : '#ffffff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid' : 'none',
        borderColor: alpha(theme.palette.divider, 0.1),
        transition: 'all 0.3s ease-in-out',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar
        ref={toolbarRef}
        disableGutters
        sx={{
          justifyContent: "space-between",
          mx: { xs: 0, sm: 0, md: 4, lg: 6 },
          position: 'relative',
          color: 'text.primary',
          transition: 'color 0.3s ease-in-out'
        }}
      >
        {/* Desktop Logo */}
        <Box sx={{ display: { xs: 'none', md: 'block', }, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <Image
            src="/assets/logo-supercontact.png"
            alt="Logo Desktop"
            width={150}
            height={150}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', px: 2 }}>
          {/* Mobile Menu */}
          <Box>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              sx={{
                color: 'text.primary',
                transition: 'color 0.3s ease-in-out'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              PaperProps={{
                sx: {
                  width: '100vw',
                  height: '100vh',
                  bgcolor: '#ffffff',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={handleCloseNavMenu}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
                <Stack spacing={0}>
                  {menuItems.map((item) => {
                    if (item.label === strings.product) {
                      return (
                        <Accordion key={item.label} elevation={0} sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ px: 2, py: 1, minHeight: '64px', '& .MuiAccordionSummary-content': { margin: 0 } }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <ProductMenu isMobile />
                          </AccordionDetails>
                        </Accordion>
                      );
                    }
                    if (item.label === strings.solution) {
                      return (
                        <Accordion key={item.label} elevation={0} sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ px: 2, py: 1, minHeight: '64px', '& .MuiAccordionSummary-content': { margin: 0 } }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <SolutionMenu isMobile />
                          </AccordionDetails>
                        </Accordion>
                      );
                    }
                    return (
                      <MenuItem
                        key={item.label}
                        onClick={() => {
                          router.push(item.path);
                          handleCloseNavMenu();
                        }}
                        sx={{
                          py: 2,
                          px: 2,
                          minHeight: '64px',
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography
                          variant="h6"
                          color={isActive(item.path) ? 'primary.main' : 'inherit'}
                          sx={{ fontWeight: isActive(item.path) ? 700 : 500 }}
                        >
                          {item.label}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Stack>
                <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <AppButton
                    variantStyle='outline'
                    fullWidth
                    onClick={() => {
                      router.push('/login');
                      handleCloseNavMenu();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    {strings.sign_in}
                  </AppButton>
                  <AppButton
                    variantStyle='primary'
                    fullWidth
                    onClick={() => {
                      router.push('/register');
                      handleCloseNavMenu();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    {strings.try_now}
                  </AppButton>
                </Box>
              </Box>
            </Drawer>
          </Box>

          {/* Mobile Logo Center */}
          <Box sx={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <Image
              src="/assets/logo-supercontact.png"
              alt="Logo Mobile"
              width={150}
              height={150}
            />
          </Box>
        </Stack>

        {/* Desktop Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: "8px", justifyContent: 'center' }}>
          {menuItems.map((item) => {
            if (item.label === strings.product) {
              return (
                <React.Fragment key={item.label}>
                  <Button
                    onClick={handleClickProduct}
                    sx={{
                      my: 2,
                      display: 'flex',
                      px: { md: 1, lg: 2 },
                      whiteSpace: 'nowrap',
                      minWidth: 'auto',
                      fontWeight: 600,
                      fontSize: "15px",
                      color: openProduct ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'transparent'
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    {item.label}
                  </Button>
                  <Popover
                    open={openProduct}
                    anchorEl={anchorElProduct}
                    onClose={handleCloseProduct}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          borderRadius: '24px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          overflow: 'visible',
                          width: 'auto',
                          maxWidth: 'unset',
                          bgcolor: 'transparent',
                          backgroundImage: 'none'
                        }
                      }
                    }}
                    disableScrollLock
                  >
                    <ProductMenu />
                  </Popover>
                </React.Fragment>
              );
            }
            if (item.label === strings.solution) {
              return (
                <React.Fragment key={item.label}>
                  <Button
                    onClick={handleClickSolution}
                    sx={{
                      my: 2,
                      display: 'flex',
                      px: { md: 1, lg: 2 },
                      whiteSpace: 'nowrap',
                      minWidth: 'auto',
                      fontWeight: 600,
                      fontSize: "15px",
                      color: openSolution ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'transparent'
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    {item.label}
                  </Button>
                  <Popover
                    open={openSolution}
                    anchorEl={anchorElSolution}
                    onClose={handleCloseSolution}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          borderRadius: '24px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          overflow: 'visible',
                          width: 'auto',
                          maxWidth: 'unset',
                          bgcolor: 'transparent',
                          backgroundImage: 'none'
                        }
                      }
                    }}
                    disableScrollLock
                  >
                    <SolutionMenu />
                  </Popover>
                </React.Fragment>
              );
            }
            return (
              <Button
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  my: 2,
                  display: 'block',
                  px: { md: 1, lg: 2 },
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  fontWeight: 600,
                  fontSize: "15px",
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={handleToggleLanguage}
            startIcon={<LanguageIcon />}
            sx={{
              color: 'text.secondary',
              transition: 'color 0.3s ease-in-out',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            {language.toUpperCase()}
          </Button>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <AppButton
              variantStyle='outline'
              onClick={() => router.push('/login')}
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  color: 'primary.dark',
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              {strings.sign_in}
            </AppButton>
            <AppButton
              variantStyle='primary'
              onClick={() => router.push('/register')}
            >
              {strings.try_now}
            </AppButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default Navbar;
