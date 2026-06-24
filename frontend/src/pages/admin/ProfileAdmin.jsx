import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Camera, ShieldCheck, Save, Lock, LogOut, User, Mail,
  KeyRound, Loader2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth.jsx";

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

const getGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

function validateProfile(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.username.trim()) errors.username = "Username is required.";
  else if (form.username.length < 3) errors.username = "Must be at least 3 characters.";
  return errors;
}

function validatePassword(form) {
  const errors = {};
  if (!form.current) errors.current = "Current password is required.";
  if (!form.next) errors.next = "New password is required.";
  else if (form.next.length < 8) errors.next = "Must be at least 8 characters.";
  if (!form.confirm) errors.confirm = "Please confirm your new password.";
  else if (form.next !== form.confirm) errors.confirm = "Passwords do not match.";
  return errors;
}

export default function ProfileAdmin() {
  const { user, updateUser, logout, api } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [photo, setPhoto] = useState(user?.profilePicture || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        const d = res.data;
        const mapped = {
          id: d._id,
          fullName: d.fullName,
          username: d.username,
          name: d.fullName || d.username,
          email: d.email,
          role: d.role,
          points: d.points,
          profilePicture: d.profile_picture,
        };
        updateUser(mapped);
        setProfileForm({ fullName: d.fullName || "", username: d.username || "" });
        setPhoto(d.profile_picture || null);
        setAccountInfo({
          joined: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) : "—",
          lastLogin: d.lastLogin ? new Date(d.lastLogin).toLocaleString("en-MY") : "—",
          totalLogins: d.loginCount ?? "—",
        });
      })
      .catch(() => toast.error("Failed to load profile"));
  }, [api, updateUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
    if (profileErrors[name]) setProfileErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = validateProfile(profileForm);
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/me", {
        fullName: profileForm.fullName,
        username: profileForm.username,
      });
      updateUser({
        ...user,
        fullName: res.data.fullName,
        username: res.data.username,
        name: res.data.fullName || res.data.username,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((p) => ({ ...p, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword(passwordForm);
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }
    setSavingPassword(true);
    try {
      await api.put("/auth/me", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPasswordForm({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 1024 * 1024) { toast.error("Image must be 1 MB or smaller"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("profilePicture", photoFile);
      const res = await api.post("/upload/profile-picture", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhoto(res.data.url);
      setPhotoFile(null);
      updateUser({ ...user, profilePicture: res.data.url });
      toast.success("Photo updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const displayName = user?.fullName || user?.username || "Admin";
  const gradient = getGradient(displayName);

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink">My Profile</h1>
            <p className="mt-1 text-sm text-muted">
              Manage your admin account details and security settings.
            </p>
          </div>

          <div className="padmin-layout">

            {/* ── LEFT COLUMN ── */}
            <div className="padmin-main-col">

              {/* Profile Banner */}
              <div className="padmin-banner">
                <div className="padmin-banner-bg" aria-hidden="true" />

                <div className="relative flex flex-wrap items-end gap-5">
                  {/* Avatar */}
                  <div className="padmin-avatar-wrap">
                    {photo ? (
                      <img src={photo} alt={displayName} className="padmin-avatar-img" />
                    ) : (
                      <div className={`padmin-avatar bg-gradient-to-br ${gradient}`}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label
                      htmlFor="admin-photo"
                      className="padmin-avatar-upload"
                      title="Change photo"
                    >
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    </label>
                    <input
                      id="admin-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="sr-only"
                    />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1">
                    <p className="padmin-name">{displayName}</p>
                    <p className="padmin-email">{user?.email}</p>
                    <span className="padmin-role-badge">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Administrator
                    </span>
                  </div>

                  {/* Upload button (shown after selecting a file) */}
                  {photoFile && (
                    <button
                      type="button"
                      disabled={uploadingPhoto}
                      onClick={handleUploadPhoto}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                    >
                      {uploadingPhoto
                        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        : <Camera className="h-4 w-4" aria-hidden="true" />}
                      {uploadingPhoto ? "Uploading…" : "Save Photo"}
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="padmin-section">
                <p className="padmin-section-title">Personal Information</p>
                <form onSubmit={handleSaveProfile} noValidate>
                  <div className="padmin-grid-2">
                    <div className="padmin-field">
                      <label htmlFor="pa-fullname" className="padmin-label">
                        <User className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Full Name
                      </label>
                      <input
                        id="pa-fullname"
                        name="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        className={`padmin-input ${profileErrors.fullName ? "padmin-input-error" : ""}`}
                      />
                      {profileErrors.fullName && <p className="padmin-error-text">{profileErrors.fullName}</p>}
                    </div>

                    <div className="padmin-field">
                      <label htmlFor="pa-username" className="padmin-label">
                        <User className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Username
                      </label>
                      <input
                        id="pa-username"
                        name="username"
                        type="text"
                        placeholder="Your username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        className={`padmin-input ${profileErrors.username ? "padmin-input-error" : ""}`}
                      />
                      {profileErrors.username && <p className="padmin-error-text">{profileErrors.username}</p>}
                    </div>

                    <div className="padmin-field">
                      <label htmlFor="pa-email" className="padmin-label">
                        <Mail className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Email Address
                      </label>
                      <input
                        id="pa-email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="padmin-input"
                      />
                    </div>

                    <div className="padmin-field">
                      <label htmlFor="pa-role" className="padmin-label">
                        <ShieldCheck className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Role
                      </label>
                      <input
                        id="pa-role"
                        type="text"
                        value="Administrator"
                        disabled
                        className="padmin-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="padmin-save-button"
                  >
                    {savingProfile
                      ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      : <Save className="h-4 w-4" aria-hidden="true" />}
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="padmin-section">
                <p className="padmin-section-title">Change Password</p>
                <form onSubmit={handleSavePassword} noValidate>
                  <div className="space-y-4">
                    <div className="padmin-field">
                      <label htmlFor="pa-current-pw" className="padmin-label">
                        <KeyRound className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Current Password
                      </label>
                      <input
                        id="pa-current-pw"
                        name="current"
                        type={showPasswords ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordForm.current}
                        onChange={handlePasswordChange}
                        className={`padmin-input ${passwordErrors.current ? "padmin-input-error" : ""}`}
                      />
                      {passwordErrors.current && <p className="padmin-error-text">{passwordErrors.current}</p>}
                    </div>

                    <div className="padmin-grid-2">
                      <div className="padmin-field">
                        <label htmlFor="pa-new-pw" className="padmin-label">New Password</label>
                        <input
                          id="pa-new-pw"
                          name="next"
                          type={showPasswords ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={passwordForm.next}
                          onChange={handlePasswordChange}
                          className={`padmin-input ${passwordErrors.next ? "padmin-input-error" : ""}`}
                        />
                        {passwordErrors.next && <p className="padmin-error-text">{passwordErrors.next}</p>}
                      </div>

                      <div className="padmin-field">
                        <label htmlFor="pa-confirm-pw" className="padmin-label">Confirm New Password</label>
                        <input
                          id="pa-confirm-pw"
                          name="confirm"
                          type={showPasswords ? "text" : "password"}
                          placeholder="Repeat new password"
                          value={passwordForm.confirm}
                          onChange={handlePasswordChange}
                          className={`padmin-input ${passwordErrors.confirm ? "padmin-input-error" : ""}`}
                        />
                        {passwordErrors.confirm && <p className="padmin-error-text">{passwordErrors.confirm}</p>}
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        className="h-4 w-4 rounded border-line accent-primary"
                      />
                      Show passwords
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="padmin-save-button"
                  >
                    {savingPassword
                      ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      : <Lock className="h-4 w-4" aria-hidden="true" />}
                    {savingPassword ? "Updating…" : "Update Password"}
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="padmin-side-col">

              {/* Account Details */}
              <div className="padmin-card">
                <p className="padmin-card-title">Account Details</p>
                <div>
                  <div className="padmin-stat-row">
                    <span className="padmin-stat-label">Account ID</span>
                    <span className="padmin-stat-value font-mono text-xs">{user?.id?.slice(-8) ?? "—"}</span>
                  </div>
                  <div className="padmin-stat-row">
                    <span className="padmin-stat-label">Member Since</span>
                    <span className="padmin-stat-value">{accountInfo?.joined ?? "—"}</span>
                  </div>
                  <div className="padmin-stat-row">
                    <span className="padmin-stat-label">Last Login</span>
                    <span className="padmin-stat-value">{accountInfo?.lastLogin ?? "—"}</span>
                  </div>
                  <div className="padmin-stat-row">
                    <span className="padmin-stat-label">Total Logins</span>
                    <span className="padmin-stat-value">{accountInfo?.totalLogins ?? "—"}</span>
                  </div>
                  <div className="padmin-stat-row">
                    <span className="padmin-stat-label">Role</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="padmin-card">
                <p className="padmin-card-title">Security Tips</p>
                <ul className="space-y-2 text-xs text-muted">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-success">✓</span>
                    Use a strong, unique password not used elsewhere.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-success">✓</span>
                    Change your password every 90 days.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-success">✓</span>
                    Never share your admin credentials.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-success">✓</span>
                    Always sign out when using a shared device.
                  </li>
                </ul>
              </div>

              {/* Sign Out */}
              <div className="padmin-card">
                <p className="padmin-card-title">Session</p>
                <p className="mb-4 text-xs text-muted">
                  You are currently signed in as an administrator. Sign out to end your session.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate("/login");
                  }}
                  className="padmin-logout-button"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>VoucherPro Admin v2.4.1 Build 9982</span>
            <nav aria-label="Admin footer links" className="admin-footer-nav">
              <a href="#" className="admin-footer-link">Documentation</a>
              <a href="#" className="admin-footer-link">Support Ticket</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
