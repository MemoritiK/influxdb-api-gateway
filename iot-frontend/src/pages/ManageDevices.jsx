import { useEffect, useState } from "react";
import api from "../api";

export default function ManageDevices() {
  const [devices, setDevices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", location: "", quantity_measured: "" });

  const loadDevices = async () => {
    const res = await api.get("/devices/");
    setDevices(res.data);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const startEdit = (device) => {
    setEditingId(device.device_id);
    setEditForm({
      name: device.name,
      location: device.location,
      quantity_measured: device.quantity_measured
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", location: "", quantity_measured: "" });
  };

  const submitEdit = async (device_id) => {
    try {
      await api.put(`/devices/${device_id}`, editForm);
      await loadDevices();
      cancelEdit();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. See console.");
    }
  };

  const deleteDevice = async (device_id) => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    await api.delete(`/devices/${device_id}`);
    loadDevices();
  };

  return (
    <div style={{ padding: "2rem", background: "#fff", minHeight: "100vh" }}>
      <h1>Manage Devices</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.device_id}>
              <td>{d.device_id}</td>
              <td>
                {editingId === d.device_id ? (
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                ) : (
                  d.name
                )}
              </td>
              <td>
                {editingId === d.device_id ? (
                  <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                ) : (
                  d.location
                )}
              </td>
              <td>
                {editingId === d.device_id ? (
                  <input value={editForm.quantity_measured} onChange={e => setEditForm({ ...editForm, quantity_measured: e.target.value })} />
                ) : (
                  d.quantity_measured
                )}
              </td>
              <td>{d.last_active || "N/A"}</td>
              <td>
                {editingId === d.device_id ? (
                  <>
                    <button onClick={() => submitEdit(d.device_id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(d)}>Edit</button>
                    <button onClick={() => deleteDevice(d.device_id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  }
};
