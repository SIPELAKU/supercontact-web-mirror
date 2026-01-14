"use client";

import { fetchProfile, updateProfile, UpdateProfileData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { handleError } from "@/lib/utils/errorHandler";
import {
  Person,
  Security
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProfileSettingsPage() {
  const [tab, setTab] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { getToken } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    company: "",
    country: "",
    language: "",
    phone: "",
    // New fields from design (not all might be supported by API yet)
    address: "",
    state: "",
    zipCode: "",
    timeZone: "",
    currency: "USD",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();
        // Assuming fetchProfile returns the standard profile data
        const response = await fetchProfile(token);
        
        if (response.success && response.data) {
          setFormData(prev => ({
            ...prev,
            fullname: response.data.fullname || "",
            email: response.data.email || "",
            company: response.data.company || "",
            country: response.data.country || "",
            language: response.data.language || "",
            phone: response.data.phone || "",
            // Populate if available, otherwise default
            // These might not be in response.data yet based on API analysis
          }));
        } else {
          setError("Failed to load profile data");
        }
      } catch (err: any) {
        const errorMessage = handleError(err, 'Load profile error', "Failed to load profile data");
        setError(errorMessage);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [getToken]);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = await getToken();
      // Map back to API expected structure (omitting local-only fields for now if API doesn't support them)
      // Or send them if API ignores unknown fields
      const apiData: UpdateProfileData = {
        fullname: formData.fullname,
        email: formData.email,
        company: formData.company,
        country: formData.country,
        language: formData.language,
        phone: formData.phone,
        skype: "", // Hidden in design but required by type?
        bio: "",   // Hidden in design
      };
      
      const response = await updateProfile(token, apiData);
      
      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorMessage = response.error || response.message || "Failed to update profile";
        setError(errorMessage);
      }
      
    } catch (err: any) {
      const errorMessage = handleError(err, 'Profile update error', "Update failed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = () => {
      // Mock password save
      setIsLoading(true);
      setTimeout(() => {
          setSuccessMessage("Password updated successfully!");
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setIsLoading(false);
          setTimeout(() => setSuccessMessage(""), 3000);
      }, 1000);
  };

  const handleReset = () => {
    if (tab === 0) {
        window.location.reload();
    } else {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Mock Data for Recent Devices
  const recentDevices = [
      {
          id: 1,
          browser: "Chrome on Windows",
          device: "Dell XPS 15",
          location: "New York, NY",
          activity: "28 Apr 2022, 18:20",
          icon: "laptop",
          color: "#FFA000" // Amber
      },
      {
          id: 2,
          browser: "Chrome on Android",
          device: "Google Pixel 3a",
          location: "Los Angeles, CA",
          activity: "20 Apr 2022, 10:20",
          icon: "phone",
          color: "#4CAF50" // Green
      },
      {
          id: 3,
          browser: "Chrome on iPhone",
          device: "iPhone 12x",
          location: "San Francisco, CA",
          activity: "16 Apr 2022, 04:20",
          icon: "phone",
          color: "#F44336" // Red
      },
       {
          id: 4,
          browser: "Chrome on MacOS",
          device: "Apple iMac",
          location: "New York, NY",
          activity: "28 Apr 2022, 18:20",
          icon: "monitor",
          color: "#2196F3" // Blue
      },
      {
          id: 5,
          browser: "Chrome on MacOS",
          device: "Macbook Pro",
          location: "Los Angeles, CA",
          activity: "20 Apr 2022, 10:20",
          icon: "laptop",
          color: "#FFC107" // Amber
      },
      {
          id: 6,
          browser: "Chrome on Android",
          device: "Oneplus 9 Pro",
          location: "San Francisco, CA",
          activity: "16 Apr 2022, 04:20",
          icon: "phone",
          color: "#8BC34A" // Light Green
      }
  ];

  const getDeviceIcon = (type: string) => {
      // You might need to import these if not available
      // For now using text or simple shapes if icons missing
      // Assuming Material Icons available
      return null; // Will implement in render
  };

  if (isLoadingProfile) return <Box p={4}>Loading...</Box>;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={4}>
        
        {/* ================= HEADER ================= */}
        <Card
          sx={{
            p: 4,
            background: "linear-gradient(to right, #E0E7FF, #EEF2FF)",
            position: "relative",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: 'none',
            border: '1px solid #E0E7FF'
          }}
        >
          <Box zIndex={1} position="relative">
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              Profile
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Typography variant="body2" color="#64748B">
                Users Profile
              </Typography>
              <Typography variant="body2" color="#64748B">•</Typography>
              <Typography variant="body2" color="#64748B">
                Account Setting
              </Typography>
            </Stack>
          </Box>

           <Box
            sx={{
              position: "absolute",
              right: 50,
              bottom: -30,
              width: 140,
              height: 140,
              zIndex: 0
            }}
          >
             <Image src="/assets/logo-company.png" alt="" width={140} height={140}/>
          </Box>
        </Card>

        {/* ================= CUSTOM TABS ================= */}
        <Stack direction="row" spacing={2}>
           <Button
             startIcon={<Person />}
             variant={tab === 0 ? "contained" : "text"}
             onClick={() => setTab(0)}
             sx={{
               bgcolor: tab === 0 ? "#536DFE" : "transparent",
               color: tab === 0 ? "white" : "text.secondary",
               textTransform: "none",
               fontWeight: 600,
               borderRadius: 2,
               px: 3,
               '&:hover': {
                 bgcolor: tab === 0 ? "#4c63e6" : "rgba(0,0,0,0.04)"
               }
             }}
           >
             Account
           </Button>
           <Button
             startIcon={<Security />}
             variant={tab === 1 ? "contained" : "text"}
             onClick={() => setTab(1)}
             sx={{
               bgcolor: tab === 1 ? "#536DFE" : "transparent",
               color: tab === 1 ? "white" : "text.secondary",
               textTransform: "none",
               fontWeight: 600,
               borderRadius: 2,
               px: 3,
               '&:hover': {
                 bgcolor: tab === 1 ? "#4c63e6" : "rgba(0,0,0,0.04)"
               }
             }}
           >
             Security
           </Button>
        </Stack>

        {/* ================= ACCOUNT TAB ================= */}
        {tab === 0 && (
          <Stack spacing={4}>
            <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                
                {/* AVATAR SECTION */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" mb={5}>
                <Avatar 
                    src={avatar || "/assets/Avatar-profile.png"} 
                    variant="rounded"
                    sx={{ width: 100, height: 100, bgcolor: '#C7D2FE' }}
                />
                <Box>
                    <Stack direction="row" spacing={2} mb={1}>
                        <Button 
                        component="label"
                        variant="contained" 
                        sx={{ 
                            textTransform: 'none', 
                            bgcolor: '#536DFE',
                            borderRadius: 2
                        }}
                        >
                        Upload New Photo
                        <input hidden type="file" onChange={handleUpload} accept="image/*" />
                        </Button>
                        <Button 
                        variant="outlined" 
                        color="error"
                        sx={{ 
                            textTransform: 'none', 
                            borderRadius: 2
                        }}
                        onClick={() => setAvatar(null)}
                        >
                        Reset
                        </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Allowed JPG, GIF or PNG. Max size of 800K
                    </Typography>
                </Box>
                </Stack>

                {/* ERROR / SUCCESS MESSAGES */}
                {error && <Typography color="error" mb={2}>{error}</Typography>}
                {successMessage && <Typography color="success.main" mb={2}>{successMessage}</Typography>}

                {/* GRID FORM */}
                <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField 
                    fullWidth
                    label="Full Name"
                    value={formData.fullname}
                    onChange={handleInputChange('fullname')}
                    placeholder="Muhammad Saeful"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="john.doe@gmail.com"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="Organisation"
                    value={formData.company}
                    onChange={handleInputChange('company')}
                    placeholder="Pixinvent"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+1 (917) 543-9876"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="123 Main St, New York, NY 10001"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="State"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    placeholder="New York"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                    fullWidth
                    label="Zip Code"
                    value={formData.zipCode}
                    onChange={handleInputChange('zipCode')}
                    placeholder="648391"
                    InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField 
                    select
                    fullWidth
                    label="Country"
                    value={formData.country || 'USA'}
                    onChange={handleInputChange('country')}
                    InputLabelProps={{ shrink: true }}
                    >
                    <MenuItem value="USA">USA</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                    <MenuItem value="UK">United Kingdom</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                    select
                    fullWidth
                    label="Language"
                    value={formData.language || 'English'}
                    onChange={handleInputChange('language')}
                    InputLabelProps={{ shrink: true }}
                    >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField 
                    select
                    fullWidth
                    label="Time Zone"
                    value={formData.timeZone}
                    onChange={handleInputChange('timeZone')}
                    InputLabelProps={{ shrink: true }}
                    defaultValue=""
                    >
                    <MenuItem value="">(GMT-11:00) International Date Line West</MenuItem>
                    <MenuItem value="utc">(GMT+00:00) UTC</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                    select
                    fullWidth
                    label="Currency"
                    value={formData.currency}
                    onChange={handleInputChange('currency')}
                    InputLabelProps={{ shrink: true }}
                    >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="IDR">IDR</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    </TextField>
                </Grid>
                </Grid>

                {/* ACTION BUTTONS */}
                <Stack direction="row" spacing={2} mt={4}>
                <Button 
                    variant="contained" 
                    onClick={handleSaveChanges}
                    sx={{ bgcolor: '#536DFE', borderRadius: 2, textTransform: 'none', px: 4 }}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                    variant="outlined" 
                    color="inherit"
                    onClick={handleReset}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
                    disabled={isLoading}
                >
                    Reset
                </Button>
                </Stack>

            </Card>

            {/* DELETE ACCOUNT */}
             <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                Delete Account
                </Typography>

                <FormControlLabel
                control={<Checkbox />}
                label="I confirm my account deactivation"
                sx={{ color: 'text.secondary' }}
                />

                <Box mt={2}>
                <Button 
                    variant="contained" 
                    sx={{ 
                    bgcolor: '#FFAB91', 
                    '&:hover': { bgcolor: '#FF8A65' },
                    color: '#BF360C',
                    textTransform: 'none',
                    boxShadow: 'none',
                    fontWeight: 600
                    }}
                >
                    Deactivate Account
                </Button>
                </Box>
            </Card>
          </Stack>
        )}

        {/* ================= SECURITY TAB ================= */}
        {tab === 1 && (
             <Stack spacing={4}>
                
                {/* CHANGE PASSWORD */}
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                        Change Password
                    </Typography>

                    {successMessage && <Typography color="success.main" mb={2}>{successMessage}</Typography>}

                    <Stack spacing={3}>
                        <TextField 
                             fullWidth
                             label="Current Password"
                             type="password"
                             value={passwordData.currentPassword}
                             onChange={handlePasswordChange('currentPassword')}
                             InputLabelProps={{ shrink: true }}
                        />
                         <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                             <TextField 
                                fullWidth
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange('newPassword')}
                                InputLabelProps={{ shrink: true }}
                            />
                             <TextField 
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange('confirmPassword')}
                                InputLabelProps={{ shrink: true }}
                            />
                         </Stack>
                    </Stack>

                    <Box mt={3} color="text.secondary">
                        <Typography variant="body2" mb={1} fontWeight={500}>Password Requirements:</Typography>
                        <ul style={{ paddingLeft: 20, margin: 0, fontSize: '0.875rem' }}>
                            <li>Minimum 8 characters long - the more, the better</li>
                            <li>At least one lowercase character</li>
                            <li>At least one number, symbol, or whitespace character</li>
                        </ul>
                    </Box>

                     <Stack direction="row" spacing={2} mt={4}>
                        <Button 
                            variant="contained" 
                            onClick={handleSavePassword}
                            sx={{ bgcolor: '#536DFE', borderRadius: 2, textTransform: 'none', px: 4 }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="inherit"
                            onClick={handleReset}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Card>

                {/* RECENT DEVICES */}
                 <Card sx={{ p: 0, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <Box p={3} borderBottom="1px solid #f0f0f0">
                        <Typography variant="h6" fontWeight={600}>
                            Recent Devices
                        </Typography>
                    </Box>
                    
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 600, width: '100%' }}>
                            {/* Header */}
                            <Box 
                                display="grid" 
                                gridTemplateColumns="2fr 2fr 2fr 2fr" 
                                px={3} py={2} 
                                bgcolor="#F9FAFB"
                                borderBottom="1px solid #f0f0f0"
                            >
                                <Typography variant="caption" fontWeight={700} color="text.secondary">BROWSER</Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">DEVICE</Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">LOCATION</Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">RECENT ACTIVITY</Typography>
                            </Box>

                            {/* Body */}
                            <Stack>
                                {recentDevices.map((device) => (
                                    <Box 
                                        key={device.id}
                                        display="grid" 
                                        gridTemplateColumns="2fr 2fr 2fr 2fr" 
                                        px={3} py={2.5}
                                        borderBottom="1px solid #f0f0f0"
                                        alignItems="center"
                                        sx={{ '&:last-child': { borderBottom: 'none' } }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                             {/* Simple Icon Placeholders */}
                                            {device.icon === 'laptop' && (
                                                <Box component="span" sx={{ color: device.color }}>💻</Box>
                                            )}
                                             {device.icon === 'phone' && (
                                                <Box component="span" sx={{ color: device.color }}>📱</Box>
                                            )}
                                             {device.icon === 'monitor' && (
                                                <Box component="span" sx={{ color: device.color }}>🖥️</Box>
                                            )}
                                            <Typography variant="body2" color="text.primary">{device.browser}</Typography>
                                        </Stack>
                                        
                                        <Typography variant="body2" color="text.secondary">{device.device}</Typography>
                                        <Typography variant="body2" color="text.secondary">{device.location}</Typography>
                                        <Typography variant="body2" color="text.secondary">{device.activity}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Box>

                 </Card>
             </Stack>
        )}

      </Stack>
    </Box>
  );
}
