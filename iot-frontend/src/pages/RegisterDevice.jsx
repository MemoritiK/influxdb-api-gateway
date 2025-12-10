import { useState } from "react";
import api from "../api";

export default function RegisterDevice() {
  const [form, setForm] = useState({
    device_id: "",
    name: "",
    location: "",
    quantity_measured: ""
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      const res = await api.post("/devices/", form);
      setMsg(" Device registered successfully");
      console.log(res.data);
      setForm({ device_id: "", name: "", location: "", quantity_measured: "" });
    } catch (err) {
      setMsg(
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data, null, 2)
          : err.response?.data || "Registration failed"
      );
    }
  };

  return (
    <div className="form-card">
      <div className="form-title">Register New Device</div>

      <input name="device_id" placeholder="Device ID" value={form.device_id} onChange={handleChange} />
      <input name="name" placeholder="Device Name" value={form.name} onChange={handleChange} />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
      <input name="quantity_measured" placeholder="Quantity Measured" value={form.quantity_measured} onChange={handleChange} />

      <button className="admin-btn" onClick={submit}>Register Device</button>

      {msg && (
        <div style={{ marginTop: 20, fontSize: 14, color: "#475569", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
