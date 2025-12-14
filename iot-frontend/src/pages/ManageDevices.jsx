import { useEffect, useState } from "react";
import api from "../api";

export default function ManageDevices() {
  const [devices, setDevices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ model: "", patient_id: "" });

  const loadDevices = async () => {
    try {
      const res = await api.get("/devices/");
      setDevices(res.data);
    } catch (err) {
      console.error("Failed to load devices:", err);
      alert("Failed to load devices. Check console.");
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const startEdit = (device) => {
    setEditingId(device.device_id);
    setEditForm({
      model: device.model || "",
      patient_id: device.patient_id || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ model: "", patient_id: "" });
  };

  const submitEdit = async (device_id) => {
    try {
      const updateData = {
        model: editForm.model,
        patient_id: editForm.patient_id
      };
      await api.put(`/devices/${device_id}`, updateData);
      await loadDevices();
      cancelEdit();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. See console.");
    }
  };

  const deleteDevice = async (device_id) => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    try {
      await api.delete(`/devices/${device_id}`);
      loadDevices();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console.");
    }
  };

  // Format time to local browser timezone
  const formatLocalTime = (timestamp) => {
    if (!timestamp) return "Never";
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return "Format error";
    }
  };

  // Status badge styling based on status value
  const getStatusStyle = (status) => {
    const statusLower = (status || "").toLowerCase();
    
    switch (statusLower) {
      case "active":
        return { backgroundColor: "#48bb7820", color: "#48bb78" };
      case "inactive":
        return { backgroundColor: "#a0aec020", color: "#718096" };
      case "offline":
        return { backgroundColor: "#f5656520", color: "#f56565" };
      case "warning":
        return { backgroundColor: "#ed893620", color: "#ed8936" };
      case "error":
        return { backgroundColor: "#f5656520", color: "#f56565" };
      default:
        return { backgroundColor: "#e2e8f0", color: "#4a5568" };
    }
  };

  return (
    <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "1.5rem", color: "#2d3748" }}>Manage Devices</h1>
      
      <div style={{ overflowX: "auto", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Model</th>
              <th style={styles.th}>Patient ID</th>
              <th style={styles.th}>Vitals</th>
              <th style={styles.th}>Last Active (Local Time)</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>
                  No devices found
                </td>
              </tr>
            ) : (
              devices.map((d) => {
                const statusStyle = getStatusStyle(d.status);
                return (
                  <tr key={d.device_id} style={styles.row}>
                    <td style={styles.td}><strong>{d.device_id}</strong></td>
                    <td style={styles.td}>
                      {editingId === d.device_id ? (
                        <input
                          value={editForm.model}
                          onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                          style={styles.input}
                          placeholder="Model name"
                        />
                      ) : (
                        d.model || "—"
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === d.device_id ? (
                        <input
                          value={editForm.patient_id}
                          onChange={e => setEditForm({ ...editForm, patient_id: e.target.value })}
                          style={styles.input}
                          placeholder="Patient ID"
                        />
                      ) : (
                        d.patient_id || "—"
                      )}
                    </td>
                    <td style={styles.td}>{d.vital_type || "—"}</td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "0.9em" }}>
                        {formatLocalTime(d.last_active)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        ...statusStyle,
                        fontSize: "0.85em",
                        fontWeight: "500"
                      }}>
                        {d.status || "Unknown"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {editingId === d.device_id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            onClick={() => submitEdit(d.device_id)}
                            style={styles.saveButton}
                          >
                            Save
                          </button>
                          <button 
                            onClick={cancelEdit}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            onClick={() => startEdit(d)}
                            style={styles.editButton}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteDevice(d.device_id)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.95em"
  },
  headerRow: {
    backgroundColor: "#edf2f7",
    borderBottom: "2px solid #e2e8f0"
  },
  th: {
    padding: "1rem",
    fontWeight: "600",
    color: "#4a5568",
    textTransform: "uppercase",
    fontSize: "0.85em",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0"
  },
  row: {
    borderBottom: "1px solid #f1f5f9",
    ":hover": {
      backgroundColor: "#f7fafc"
    }
  },
  td: {
    padding: "1rem",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9"
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #cbd5e0",
    width: "100%",
    fontSize: "0.95em",
    ":focus": {
      outline: "none",
      borderColor: "#4299e1",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)"
    }
  },
  editButton: {
    padding: "0.4rem 0.8rem",
    background: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85em",
    fontWeight: "500",
    transition: "background 0.2s",
    ":hover": {
      background: "#3182ce"
    }
  },
  deleteButton: {
    padding: "0.4rem 0.8rem",
    background: "#f56565",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85em",
    fontWeight: "500",
    transition: "background 0.2s",
    ":hover": {
      background: "#e53e3e"
    }
  },
  saveButton: {
    padding: "0.4rem 0.8rem",
    background: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85em",
    fontWeight: "500",
    transition: "background 0.2s",
    ":hover": {
      background: "#38a169"
    }
  },
  cancelButton: {
    padding: "0.4rem 0.8rem",
    background: "#a0aec0",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85em",
    fontWeight: "500",
    transition: "background 0.2s",
    ":hover": {
      background: "#718096"
    }
  }
};