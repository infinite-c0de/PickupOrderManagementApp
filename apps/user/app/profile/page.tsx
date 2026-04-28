"use client"

import { useEffect, useState } from "react"
import { changePassword, getProfile, updateProfile } from "@/lib/user-api"

export default function UserProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const profile = await getProfile()
        setFirstName(profile.firstName || "")
        setLastName(profile.lastName || "")
        setEmail(profile.email || "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleSaveProfile() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.")
      return
    }
    setSavingProfile(true)
    setError("")
    setNotice("")
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
      setNotice("Profile updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Please fill all password fields.")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.")
      return
    }
    setSavingPassword(true)
    setError("")
    setNotice("")
    try {
      await changePassword({ oldPassword: currentPassword, newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setNotice("Password updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Profile & Settings</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage your account details and security.</p>
      {notice ? <p style={{ color: "#166534" }}>{notice}</p> : null}
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {loading ? <p style={{ color: "#475569" }}>Loading profile...</p> : null}

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Profile Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>First Name</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Last Name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Email</span>
            <input value={email} readOnly disabled />
          </label>
        </div>
        <button style={{ marginTop: 10 }} onClick={() => void handleSaveProfile()} disabled={savingProfile || loading}>
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </section>

      <section style={{ marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Change Password</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <button style={{ marginTop: 10 }} onClick={() => void handleChangePassword()} disabled={savingPassword || loading}>
          {savingPassword ? "Updating..." : "Update Password"}
        </button>
      </section>
    </div>
  )
}
