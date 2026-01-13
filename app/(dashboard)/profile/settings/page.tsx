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

  const handleReset = () => {
    // Reload logic or reset to initial
     window.location.reload();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
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

        {/* ================= FORM CARD ================= */}
        {tab === 0 && (
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
        )}

        {/* ================= DELETE ACCOUNT ================= */}
        {tab === 0 && (
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
                  bgcolor: '#FFAB91', // Light red/salmon color from design
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
        )}
      </Stack>
    </Box>
  );
}
