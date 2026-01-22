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
    CircularProgress,
    FormControlLabel,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UserProfileSetting() {
  const [tab, setTab] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getToken } = useAuth();

  // Profile form data
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    fullname: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    language: "",
    skype: "",
    bio: "",
  });

  // Password form data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // API Key form data
  const [apiType, setApiType] = useState("");
  const [apiName, setApiName] = useState("");

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        const token = await getToken();
        const response = await fetchProfile(token);
        
        if (response.success && response.data) {
          const profile = response.data;
          setProfileData({
            fullname: profile.fullname || "",
            email: profile.email || "",
            phone: profile.phone || "",
            company: profile.company || "",
            country: profile.country || "",
            language: profile.language || "",
            skype: profile.skype || "",
            bio: profile.bio || "",
          });
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (err) {
        const errorMessage = handleError(err, "Load Profile");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getToken]);

  const handleInputChange = (field: keyof UpdateProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const token = await getToken();
      const response = await updateProfile(token, profileData);
      
      if (response.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      const errorMessage = handleError(err, "Update Profile");
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleResetProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetchProfile(token);
      
      if (response.success && response.data) {
        const profile = response.data;
        setProfileData({
          fullname: profile.fullname || "",
          email: profile.email || "",
          phone: profile.phone || "",
          company: profile.company || "",
          country: profile.country || "",
          language: profile.language || "",
          skype: profile.skype || "",
          bio: profile.bio || "",
        });
        toast.success("Profile data reset to original values");
      }
    } catch (err) {
      const errorMessage = handleError(err, "Reset Profile");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [apiKeys] = useState<
    {
      name: string;
      type: "Full Access" | "Read Only";
      key: string;
      createdAt: string;
    }[]
  >([]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* HEADER */}
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
            Profile Settings
          </Typography>

          <Typography variant="body2" color="text.secondary">
            User Profile • Account Setting
          </Typography>

          {/* LOGO */}
          <Box
            component="img"
            src="/images/logos/logo3d.png"
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

        {/* TABS */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Account" />
          <Tab label="Security" />
        </Tabs>

        {/* ================= ACCOUNT TAB ================= */}
        {tab === 0 && (
          <Stack spacing={3}>
            {/* AVATAR + FORM */}
            <Card sx={{ p: 4 }}>
              {/* Avatar */}
              <Stack direction="row" spacing={3} alignItems="center" mb={4}>
                <Avatar
                  src={avatar ?? "/assets/avatar-profile.png"}
                  sx={{ width: 80, height: 80 }}
                />

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
                    Allowed JPG, GIF or PNG. Max size of 800kb
                  </Typography>
                </Stack>
              </Stack>

              {/* Form */}
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField 
                    label="Full Name" 
                    fullWidth 
                    value={profileData.fullname}
                    onChange={handleInputChange("fullname")}
                  />
                  <TextField 
                    label="Email" 
                    fullWidth 
                    value={profileData.email}
                    onChange={handleInputChange("email")}
                    type="email"
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField 
                    label="Phone Number" 
                    fullWidth 
                    value={profileData.phone}
                    onChange={handleInputChange("phone")}
                  />
                  <TextField 
                    label="Company" 
                    fullWidth 
                    value={profileData.company}
                    onChange={handleInputChange("company")}
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField 
                    label="Skype" 
                    fullWidth 
                    value={profileData.skype}
                    onChange={handleInputChange("skype")}
                  />
                  <TextField 
                    select 
                    label="Country" 
                    fullWidth 
                    value={profileData.country}
                    onChange={handleInputChange("country")}
                  >
                    <MenuItem value="">Select Country</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                    <MenuItem value="Singapore">Singapore</MenuItem>
                    <MenuItem value="Malaysia">Malaysia</MenuItem>
                  </TextField>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField 
                    select 
                    label="Language" 
                    fullWidth 
                    value={profileData.language}
                    onChange={handleInputChange("language")}
                  >
                    <MenuItem value="">Select Language</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                  </TextField>

                  <TextField 
                    label="Bio" 
                    fullWidth 
                    multiline
                    rows={1}
                    value={profileData.bio}
                    onChange={handleInputChange("bio")}
                    placeholder="Tell us about yourself"
                  />
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2} mt={4}>
                <Button 
                  variant="contained" 
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : "Save Changes"}
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={handleResetProfile}
                  disabled={saving}
                >
                  Reset
                </Button>
              </Stack>
            </Card>

            {/* DELETE ACCOUNT */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Delete Account
              </Typography>
              <FormControlLabel
                control={<Checkbox />}
                label="I confirm my account deactivation"
              />
              <Button variant="contained" color="error" sx={{ mt: 2 }}>
                Deactivate Account
              </Button>
            </Card>
          </Stack>
        )}

        {/* ================= SECURITY TAB ================= */}
        {tab === 1 && (
          <Stack spacing={3}>
            {/* CHANGE PASSWORD */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Change Password
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Stack>
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Password Requirements:
                  </Typography>
                  <ul style={{ paddingLeft: 20, color: "#6b7280" }}>
                    <li>Minimum 8 characters long</li>
                    <li>At least one lowercase character</li>
                    <li>At least one number or symbol</li>
                  </ul>
                </Box>
                <Stack direction="row" spacing={2} mt={4}>
                  <Button variant="contained">Save Changes</Button>
                  <Button variant="outlined" color="inherit">
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {/* TWO STEPS VERIFICATION */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Two-Steps Verification
              </Typography>
              <ul style={{ paddingLeft: 20, color: "#6b7280" }}>
                <li>Two factor authentication is not enabled yet</li>
                <li>Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.</li>
              </ul>
              <Stack direction="row" spacing={2} mt={4}>
                <Button variant="contained">Enable Two-Factor Authentication</Button>
              </Stack>
            </Card>
            
            {/* API KEY */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Create an API key
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                alignItems="center"
              >
                {/* FORM */}
                <Stack spacing={3} flex={1}>
                  <TextField
                    select
                    fullWidth
                    value={apiType}
                    onChange={(e) => setApiType(e.target.value)}
                    placeholder="Choose the API key type you want to create"
                    SelectProps={{
                      displayEmpty: true,
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose the API key type you want to create
                    </MenuItem>
                    <MenuItem value="full">Full Access</MenuItem>
                    <MenuItem value="readonly">Read Only</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    placeholder="Name the API key"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    sx={{ borderRadius: 2 }}
                    fullWidth
                  >
                    Create Key
                  </Button>
                </Stack>

                {/* AVATAR */}
                <Box
                  component="img"
                  src="/assets/avatar-setting.png"
                  alt="3D Developer"
                  sx={{
                    width: 220,
                    display: { xs: "none", md: "block" },
                  }}
                />
              </Stack>
            </Card>

            {/* API KEY LIST */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                API Key List & Access
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                API keys are used to authenticate requests and manage access levels.
              </Typography>

              {apiKeys.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                  <Typography variant="body2">
                    No API keys created yet. Create one above to get started.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {apiKeys.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "#f5f7fa",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600}>{item.name}</Typography>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.3,
                              borderRadius: 10,
                              fontSize: 12,
                              backgroundColor:
                                item.type === "Full Access" ? "#e8ecff" : "#e0f2fe",
                              color:
                                item.type === "Full Access" ? "#4f46e5" : "#0284c7",
                            }}
                          >
                            {item.type}
                          </Box>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          {item.key}
                        </Typography>

                        <Typography variant="caption" display="block" color="text.secondary">
                          Created at {item.createdAt}
                        </Typography>
                      </Box>

                      <Button size="small" variant="outlined">
                        Copy
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
