"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import { fetchProfile, updateProfile, UpdateProfileData, uploadAvatar, deactivateAccount, changePassword, ChangePasswordData, fetchRecentDevices, DeviceSession } from "@/lib/api";
import { handleError, getErrorMessage } from "@/lib/utils/errorHandler";
import { useAuth } from "@/lib/context/AuthContext";
import PageHeader from "../ui/page-header";

export default function ProfileUserSettingClient() {
  const { getToken, reloadProfile, logout } = useAuth();
  const [tab, setTab] = useState("account");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [recentDevices, setRecentDevices] = useState<DeviceSession[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    fullname: "",
    email: "",
    company: "",
    country: "",
    language: "",
    bio: "",
    address: "",
    currency: "",
    state: "",
    timezone: "",
    zip_code: "",
    phone: "",
    skype: "",
  });

  // Password form data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // API Key form data
  const [apiType, setApiType] = useState("");
  const [apiName, setApiName] = useState("");

  const loadRecentDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      const response = await fetchRecentDevices(token);
      if (response.success && response.data) {
        setRecentDevices(response.data);
      }
    } catch (err) {
      console.error("Failed to load recent devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (tab === "security") {
      loadRecentDevices();
    }
  }, [tab, getToken]);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        const response = await fetchProfile(token);

        if (response.success && response.data) {
          const profile = response.data;
          setAvatar(profile.avatar || profile.avatar_url || null);
          setProfileData({
            fullname: profile.fullname || "",
            email: profile.email || "",
            company: profile.company || "",
            country: profile.country || "",
            language: profile.language || "",
            bio: profile.bio || "",
            address: profile.address || "",
            currency: profile.currency || "",
            state: profile.state || "",
            timezone: profile.timezone || "",
            zip_code: profile.zip_code || "",
            phone: profile.phone || "",
            skype: profile.skype || "",
          });
          if (profile.avatar_url) {
            setAvatar(profile.avatar_url);
          }
        } else {
          notify.error("Failed to load profile data");
        }
      } catch (err) {
        const errorMessage = handleError(err, "Load Profile");
        notify.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getToken]);

  const handleInputChange =
    (field: keyof UpdateProfileData) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      // 1. Upload Avatar if changed
      if (avatarFile) {
        try {
          await uploadAvatar(token, avatarFile);
          setAvatarFile(null); // Clear file after successful upload
        } catch (avatarErr: any) {
          console.error("Avatar upload failed, continuing with profile update...", avatarErr);
          // We continue with profile update even if avatar fails
        }
      }

      // 2. Update Profile Data
      const response = await updateProfile(token, profileData);

      if (response.success) {
        notify.success("Profile updated successfully!");
      } else {
        notify.error(getErrorMessage(response, "Failed to update profile"));
      }
    } catch (err) {
      const errorMessage = handleError(err, "Update Profile");
      notify.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirmDeactivate) {
      notify.error("Please confirm account deactivation first");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setIsDeactivating(true);
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const response = await deactivateAccount(token);

      if (response.success) {
        notify.success("Account deactivated successfully. You will be logged out.");
        // Logout user after successful deactivation
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 2000);
      } else {
        notify.error("Failed to deactivate account");
      }
    } catch (err) {
      const errorMessage = handleError(err, "Deactivate Account");
      notify.error(errorMessage);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      notify.error("New password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      const response = await changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.success) {
        notify.success("Password changed successfully!");
        // Clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notify.error(getErrorMessage(response, "Failed to change password"));
      }
    } catch (err) {
      const errorMessage = handleError(err, "Change Password");
      notify.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      const response = await fetchProfile(token);

      if (response.success && response.data) {
        const profile = response.data;
        setProfileData({
          fullname: profile.fullname || "",
          email: profile.email || "",
          company: profile.company || "",
          country: profile.country || "",
          language: profile.language || "",
          bio: profile.bio || "",
          address: profile.address || "",
          currency: profile.currency || "",
          state: profile.state || "",
          timezone: profile.timezone || "",
          zip_code: profile.zip_code || "",
          phone: profile.phone || "",
          skype: profile.skype || "",
        });
        if (profile.avatar_url) {
          setAvatar(profile.avatar_url);
        }
        notify.success("Profile data reset to original values");
      }
    } catch (err) {
      const errorMessage = handleError(err, "Reset Profile");
      notify.error(errorMessage);
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
    setAvatarFile(file);
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 space-y-6">
      <Stack spacing={3}>
        {/* HEADER */}
        <PageHeader
          title="Profile Settings"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile", href: "/profile" }, { label: "Profile Settings" }]}
        />

        {/* TABS */}
        <Box sx={{ width: "fit-content" }}>
          <Tabs
            value={tab}
            onChange={(_, val) =>
              setTab(val as "account" | "security")
            }
            sx={{
              minHeight: "unset",
              padding: "4px",
              backgroundColor: "#f0f2f5",
              borderRadius: "8px",
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab
              label="Account"
              value="account"
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minHeight: "32px",
                minWidth: "auto",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#64748B",
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06)",
                },
              }}
            />
            <Tab
              label="Security"
              value="security"
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minHeight: "32px",
                minWidth: "auto",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#64748B",
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06)",
                },
              }}
            />
          </Tabs>
        </Box>

        {/* ================= ACCOUNT TAB ================= */}
        {tab === "account" && (
          <Stack spacing={3}>
            {/* AVATAR + FORM */}
            <Card sx={{ p: 4 }}>
              {/* Avatar */}
              <Stack direction="row" spacing={3} alignItems="center" mb={4}>
                <Avatar
                  src={avatar || "/assets/avatar-profile.png"}
                  sx={{ width: 80, height: 80 }}
                />

                <Stack spacing={1}>
                  <Stack direction="row" spacing={2}>
                    <AppButton component="label">
                      Upload New Photo
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                      />
                    </AppButton>
                    <AppButton
                      variantStyle="outline"
                      color="danger"
                      onClick={() => {
                        setAvatar(null);
                        setAvatarFile(null);
                      }}
                    >
                      Reset
                    </AppButton>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Allowed JPG, GIF or PNG. Max size of 800kb
                  </Typography>
                </Stack>
              </Stack>

              {/* Form */}
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Stack width={"100%"}>
                    <label htmlFor="fullname">Full Name</label>
                    <AppInput
                      fullWidth
                      value={profileData.fullname}
                      onChange={handleInputChange("fullname")}
                      isBgWhite
                    />
                  </Stack>
                  <Stack width={"100%"}>
                    <label htmlFor="email">Email</label>
                    <AppInput
                      fullWidth
                      value={profileData.email}
                      onChange={handleInputChange("email")}
                      type="email"
                      isBgWhite
                    />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Stack width={"100%"}>
                    <label htmlFor="company">Company</label>
                    <AppInput
                      fullWidth
                      value={profileData.company}
                      onChange={handleInputChange("company")}
                      isBgWhite
                    />
                  </Stack>
                  <Stack width={"100%"}>
                    <label htmlFor="country">Country</label>
                    <AppInput
                      fullWidth
                      value={profileData.country}
                      onChange={handleInputChange("country")}
                      isBgWhite
                    />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>

                  <Stack width={"100%"}>
                    <label htmlFor="phone">Phone Number</label>
                    <AppInput
                      type="tel"
                      fullWidth
                      value={profileData.phone}
                      onChange={handleInputChange("phone")}
                      isBgWhite
                    />
                  </Stack>
                  <Stack width={"100%"}>
                    <label htmlFor="state">State</label>
                    <AppInput
                      fullWidth
                      value={profileData.state}
                      onChange={handleInputChange("state")}
                      isBgWhite
                    />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Stack width={"100%"}>
                    <label htmlFor="zip_code">Zip Code</label>
                    <AppInput
                      fullWidth
                      value={profileData.zip_code}
                      onChange={handleInputChange("zip_code")}
                      isBgWhite
                    />
                  </Stack>
                  <Stack width={"100%"}>
                    <label htmlFor="language">Language</label>
                    <AppInput
                      fullWidth
                      value={profileData.language}
                      onChange={handleInputChange("language")}
                      isBgWhite
                    />
                  </Stack>
                  {/* <Stack width={"100%"}>
                    <label htmlFor="currency">Currency</label>
                    <AppInput
                      fullWidth
                      value={profileData.currency}
                      onChange={handleInputChange("currency")}
                      isBgWhite
                    />
                  </Stack> */}
                </Stack>



                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Stack width={"100%"}>
                    <label htmlFor="address">Address</label>
                    <AppInput
                      fullWidth
                      value={profileData.address}
                      onChange={handleInputChange("address")}
                      isBgWhite
                    />
                  </Stack>
                  {/* <Stack width={"100%"}>
                    <label htmlFor="skype">Skype</label>
                    <AppInput
                      fullWidth
                      value={profileData.skype}
                      onChange={handleInputChange("skype")}
                      isBgWhite
                    />
                  </Stack> */}
                </Stack>


                <Stack width={"100%"}>
                  <label htmlFor="bio">Bio</label>
                  <AppInput
                    isBgWhite
                    fullWidth
                    multiline
                    rows={3}
                    height="auto"
                    value={profileData.bio}
                    onChange={handleInputChange("bio")}
                    placeholder="Tell us about yourself"
                  />
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2} mt={4}>
                <AppButton onClick={handleSaveProfile} isLoading={saving}>
                  Save Changes
                </AppButton>
                <AppButton
                  variantStyle="outline"
                  color="gray"
                  onClick={handleResetProfile}
                  disabled={saving}
                >
                  Reset
                </AppButton>
              </Stack>
            </Card>

            {/* DELETE ACCOUNT */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Delete Account
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmDeactivate}
                    onChange={(e) => setConfirmDeactivate(e.target.checked)}
                  />
                }
                label="I confirm my account deactivation"
              />
            </Card>
          </Stack>
        )}

        {/* ================= SECURITY TAB ================= */}
        {tab === "security" && (
          <Stack spacing={3}>
            {/* CHANGE PASSWORD */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Change Password
              </Typography>

              <Stack spacing={3}>
                <Stack width={"100%"}>
                  <label htmlFor="current-password">Current Password</label>
                  <AppInput
                    isBgWhite
                    type="password"
                    fullWidth
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <Stack width={"100%"}>
                    <label htmlFor="new-password">New Password</label>
                    <AppInput
                      isBgWhite
                      type="password"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Stack>
                  <Stack width={"100%"}>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <AppInput
                      isBgWhite
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Stack>
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
                  <AppButton onClick={handleChangePassword} isLoading={isChangingPassword} disabled={isChangingPassword}>
                    Save Changes
                  </AppButton>
                  <AppButton
                    variantStyle="outline"
                    color="gray"
                    onClick={handleResetPasswordFields}
                    disabled={isChangingPassword}
                  >
                    Reset
                  </AppButton>
                </Stack>
              </Stack>
            </Card>

            {/* RECENT DEVICES */}
            <Card sx={{ p: 4, overflow: 'auto' }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Recent Devices
              </Typography>

              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-bold uppercase text-slate-500 border-b">
                  <tr>
                    <th className="pb-4 font-semibold">Browser</th>
                    <th className="pb-4 font-semibold">Device</th>
                    <th className="pb-4 font-semibold">Location</th>
                    <th className="pb-4 font-semibold">Recent Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoadingDevices ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <CircularProgress size={24} />
                      </td>
                    </tr>
                  ) : recentDevices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No recent devices found
                      </td>
                    </tr>
                  ) : (
                    recentDevices.map((device) => (
                      <tr key={device.id} className="group hover:bg-slate-50">
                        <td className="py-4">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                              fontSize: 18,
                              color: device.browser.toLowerCase().includes('chrome') ? '#EA4335' :
                                device.browser.toLowerCase().includes('safari') ? '#00AEEF' :
                                  device.browser.toLowerCase().includes('firefox') ? '#F29400' : '#64748B'
                            }}>
                              {device.browser.toLowerCase().includes('chrome') && '🌐'}
                              {device.browser.toLowerCase().includes('safari') && '🧭'}
                              {device.browser.toLowerCase().includes('firefox') && '🦊'}
                              {!['chrome', 'safari', 'firefox'].some(b => device.browser.toLowerCase().includes(b)) && '🌍'}
                            </Box>
                            <Typography variant="body2" fontWeight={500} color="text.primary">
                              {device.browser}
                            </Typography>
                          </Stack>
                        </td>
                        <td className="py-4 text-slate-600">{device.device}</td>
                        <td className="py-4 text-slate-600">{device.location}</td>
                        <td className="py-4 text-slate-600">
                          {new Date(device.last_activity).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>

            {/* TWO STEPS VERIFICATION */}
            {/* <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Two-Steps Verification
              </Typography>
              <ul style={{ paddingLeft: 20, color: "#6b7280" }}>
                <li>Two factor authentication is not enabled yet</li>
                <li>
                  Two-factor authentication adds an additional layer of security
                  to your account by requiring more than just a password to log
                  in.
                </li>
              </ul>
              <Stack direction="row" spacing={2} mt={4}>
                <AppButton>Enable Two-Factor Authentication</AppButton>
              </Stack>
            </Card> */}

            {/* API KEY */}
            {/* <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Create an API key
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                alignItems="center"
              >
                <Stack spacing={3} flex={1}>
                  <AppSelect
                    isBgWhite
                    fullWidth
                    value={apiType}
                    onChange={(e: any) => setApiType(e.target.value)}
                    placeholder="Choose the API key type you want to create"
                    options={[
                      { value: "full", label: "Full Access" },
                      { value: "readonly", label: "Read Only" },
                    ]}
                  />

                  <AppInput
                    isBgWhite
                    fullWidth
                    placeholder="Name the API key"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                  />

                  <AppButton size="large" sx={{ borderRadius: 2 }} fullWidth>
                    Create Key
                  </AppButton>
                </Stack>

                <Box
                  component="img"
                  src="/assets/avatar-user-setting.png"
                  alt="3D Developer"
                  sx={{
                    width: 220,
                    display: { xs: "none", md: "block" },
                  }}
                />
              </Stack>
            </Card> */}

            {/* API KEY LIST */}
            {/* <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                API Key List & Access
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                API keys are used to authenticate requests and manage access
                levels.
              </Typography>

              {apiKeys.length === 0 ? (
                <Box
                  sx={{ p: 4, textAlign: "center", color: "text.secondary" }}
                >
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
                                item.type === "Full Access"
                                  ? "#e8ecff"
                                  : "#e0f2fe",
                              color:
                                item.type === "Full Access"
                                  ? "#4f46e5"
                                  : "#0284c7",
                            }}
                          >
                            {item.type}
                          </Box>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          {item.key}
                        </Typography>

                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Created at {item.createdAt}
                        </Typography>
                      </Box>

                      <AppButton
                        size="small"
                        variantStyle="outline"
                        color="gray"
                      >
                        Copy
                      </AppButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card> */}
          </Stack>
        )}
      </Stack>
    </div>
  );
}
