import { useState } from "react";

export default function Profile({ user, userAge, setUserAge, userGender, setUserGender }) {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", background: "#f8fafc", minHeight: "100vh", width: "100%" }}>
      
      {/* PROFILE HERO CARD */}
      <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#0d9488", color: "#fff", display: "grid", placeItems: "center", fontSize: "24px", fontWeight: 700 }}>
            {(user?.name || "S").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.5px" }}>PATIENT ACCOUNT</span>
            <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "2px 0 4px 0", color: "#0f172a" }}>{user?.name || "Srishti Bansal"}</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{user?.email || "srishti1543.becse24@chitkara.edu.in"}</p>
          </div>
        </div>
        <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, border: "1px solid #bbf7d0" }}>
          ● Signed in
        </span>
      </div>

      {/* EDITABLE CLINICAL DETAILS FORM */}
      <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Clinical & Personal Information</h3>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: "1.5" }}>
          Update your demographic details below. These values will be automatically populated into your official downloadable medical reports.
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Full Name</label>
              <input 
                type="text" 
                value={user?.name || "Srishti Bansal"} 
                disabled 
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: "13px" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Email Address</label>
              <input 
                type="email" 
                value={user?.email || "srishti1543.becse24@chitkara.edu.in"} 
                disabled 
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: "13px" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Age (Years)</label>
              <input 
                type="number" 
                value={userAge} 
                onChange={(e) => setUserAge(e.target.value)} 
                min="1" 
                max="120" 
                required
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff", color: "#0f172a" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Gender</label>
              <select 
                value={userGender} 
                onChange={(e) => setUserGender(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#fff", outline: "none", color: "#0f172a" }}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
            <button type="submit" style={{ background: "#0d9488", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)" }}>
              Save Profile Changes
            </button>
            {saved && <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>✓ Profile updated successfully!</span>}
          </div>
        </form>
      </div>

    </div>
  );
}