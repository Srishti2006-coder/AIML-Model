import { useState } from "react";

export default function Profile({ 
  user, 
  userAge, 
  setUserAge, 
  userGender, 
  setUserGender, 
  bloodGroup, 
  setBloodGroup, 
  medicalHistory, 
  setMedicalHistory,
  reportFileName,
  setReportFileName
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFileName(file.name);
    }
  };

  return (
    <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "950px", background: "#f8fafc", minHeight: "100vh", width: "100%" }}>
      
      {/* SECTION 1: MODERN IDENTITY HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)", padding: "32px", borderRadius: "16px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fff", color: "#0d9488", display: "grid", placeItems: "center", fontSize: "24px", fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            {(user?.name || "S").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "99px", fontWeight: 600, letterSpacing: "0.5px" }}>
              PATIENT RECORD
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "6px 0 2px 0" }}>{user?.name || "Srishti Bansal"}</h2>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>{user?.email || "srishti1543.becse24@chitkara.edu.in"}</p>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)" }}>
          [SESSION ACTIVE] MongoDB Sync
        </div>
      </div>

      {/* SECTION 2: EDITABLE CLINICAL & DEMOGRAPHIC FORM */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* CARD A: PERSONAL DETAILS */}
        <div style={{ background: "#fff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Demographic Information</h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 20px 0" }}>
            Core account details managed by your secure session.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Full Name</label>
              <input 
                type="text" 
                value={user?.name || "Srishti Bansal"} 
                disabled 
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: "13px" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Email Address</label>
              <input 
                type="email" 
                value={user?.email || "srishti1543.becse24@chitkara.edu.in"} 
                disabled 
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: "13px" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
        </div>

        {/* CARD B: CLINICAL BACKGROUND & REPORTS */}
        <div style={{ background: "#fff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Clinical Profile & Medical History</h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 20px 0" }}>
            This information is compiled automatically into your official downloadable medical reports.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Blood Group</label>
              <select 
                value={bloodGroup} 
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#fff", outline: "none", color: "#0f172a" }}
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Attach Previous Medical Report</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc" }}>
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileUpload}
                  style={{ fontSize: "11px", width: "100%" }} 
                />
              </div>
              {reportFileName && <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: 600 }}>[Attached] {reportFileName}</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Pre-existing Medical Conditions & Symptoms</label>
            <textarea 
              rows="3"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g., Family history of diabetes, occasional hypertension, PCOs, or current medications..."
              style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff", color: "#0f172a", resize: "vertical" }}
            />
          </div>
        </div>

        {/* ACTION BAR */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button type="submit" style={{ background: "#0d9488", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)" }}>
            Save Profile Changes
          </button>
          {saved && <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>[SUCCESS] Profile updated successfully!</span>}
        </div>

      </form>

    </div>
  );
}