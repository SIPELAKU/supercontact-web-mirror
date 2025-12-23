"use client";

import { fetchProfile, updateProfile, UpdateProfileData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { handleError } from "@/lib/utils/errorHandler";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [tab, setTab] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { getToken } = useAuth();

  // Form state - will be populated from API
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    company: "",
    country: "",
    language: "",
    phone: "",
    skype: "",
    bio: ""
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();
        const response = await fetchProfile(token);
        
        if (response.success && response.data) {
          setFormData({
            fullname: response.data.fullname || "",
            email: response.data.email || "",
            company: response.data.company || "",
            country: response.data.country || "",
            language: response.data.language || "",
            phone: response.data.phone || "",
            skype: response.data.skype || "",
            bio: response.data.bio || ""
          });
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

  const handleInputChange = (field: keyof UpdateProfileData) => (
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
      const response = await updateProfile(token, formData);
      
      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorMessage = response.error || response.message || "Failed to update profile. Please try again.";
        setError(errorMessage);
      }
      
    } catch (err: any) {
      const errorMessage = handleError(err, 'Profile update error', "Failed to update profile. Please try again.");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original loaded data
    const loadProfile = async () => {
      try {
        const token = await getToken();
        const response = await fetchProfile(token);
        
        if (response.success && response.data) {
          setFormData({
            fullname: response.data.fullname || "",
            email: response.data.email || "",
            company: response.data.company || "",
            country: response.data.country || "",
            language: response.data.language || "",
            phone: response.data.phone || "",
            skype: response.data.skype || "",
            bio: response.data.bio || ""
          });
        }
      } catch (err: any) {
        console.error('Error resetting profile:', err);
      }
    };
    
    loadProfile();
    setError("");
    setSuccessMessage("");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={3}>
        {/* ================= HEADER ================= */}
        <Card
          sx={{
            p: 3,
            backgroundColor: "#e8ecff",
            position: "relative",
            overflow: "hidden",
            minHeight: 150,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Profile
          </Typography>

          <Typography variant="body2" color="text.secondary">
            User Profile
          </Typography>

          {/* LOGO */}
          <Box
            component="img"
            src="/assets/logo3d.png"
            alt="logo"
            sx={{
              position: "absolute",
              right: 100,
              top: "60%",
              transform: "translateY(-50%)",
              width: 250,
              opacity: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </Card>

        {/* ================= TABS ================= */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Account" />
          <Tab label="Security" />
        </Tabs>

        {/* ================= ACCOUNT ================= */}
        {tab === 0 && (
          <Card sx={{ p: 4 }}>
            {/* Loading State */}
            {isLoadingProfile ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Loading profile...</Typography>
              </Box>
            ) : (
              <>
                {/* Error and Success Messages */}
                {error && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                )}
                
                {successMessage && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography color="success.dark" variant="body2">
                      {successMessage}
                    </Typography>
                  </Box>
                )}

                {/* Avatar */}
                <Stack direction="row" spacing={3} alignItems="center" mb={4}>
                  <Avatar
                    src={avatar ?? "/assets/avatar-example.png"}
                    sx={{ width: 80, height: 80 }}
                  >
                    {formData.fullname ? formData.fullname.charAt(0).toUpperCase() : 'U'}
                  </Avatar>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" component="label">
                        Upload New Photo
                        <input hidden type="file" accept="image/*" onChange={handleUpload} />
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setAvatar(null)}
                      >
                        Reset
                      </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Allowed JPG, GIF or PNG. Max size of 800K
                    </Typography>
                  </Stack>
                </Stack>

                {/* Form */}
                <Stack spacing={3}>
                  <TextField 
                    label="Full Name" 
                    fullWidth 
                    value={formData.fullname}
                    onChange={handleInputChange('fullname')}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField 
                      label="Email" 
                      fullWidth 
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                    />
                    <TextField 
                      label="Company" 
                      fullWidth 
                      value={formData.company}
                      onChange={handleInputChange('company')}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField 
                      label="Phone Number" 
                      fullWidth 
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                    />
                    <TextField 
                      label="Skype" 
                      fullWidth 
                      value={formData.skype}
                      onChange={handleInputChange('skype')}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <TextField 
                      select 
                      label="Country" 
                      fullWidth 
                      value={formData.country}
                      onChange={handleInputChange('country')}
                    >
                      <MenuItem value="USA">USA</MenuItem>
                      <MenuItem value="Indonesia">Indonesia</MenuItem>
                      <MenuItem value="UK">United Kingdom</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                      <MenuItem value="Australia">Australia</MenuItem>
                    </TextField>

                    <TextField 
                      select 
                      label="Language" 
                      fullWidth 
                      value={formData.language}
                      onChange={handleInputChange('language')}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Indonesian">Indonesian</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                    </TextField>
                  </Stack>

                  <TextField
                    label="Bio"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange('bio')}
                    placeholder="Tell us about yourself..."
                  />
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={2} mt={4}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                </Stack>
              </>
            )}
          </Card>
        )}

        {/* ================= DELETE ACCOUNT ================= */}
        <Card sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Delete Account
          </Typography>

          <FormControlLabel
            control={<Checkbox />}
            label="I confirm my account deactivation"
          />

          <Box mt={2}>
            <Button variant="contained" color="error">
              Deactivate Account
            </Button>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
