import { useState } from "react";
import api from "../api";

export default function RegisterDevice() {
  const [form, setForm] = useState({
    device_id: "",
    model: "",
    patient_id: "",
    vital_type: ""
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
      setForm({ device_id: "", model: "", patient_id: "", vital_type: "" });
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
      <input name="model" placeholder="Device Model" value={form.model} onChange={handleChange} />
      <input name="patient_id" placeholder="Patient ID" value={form.patient_id} onChange={handleChange} />
      <input name="vital_type" placeholder="Vital Measured" value={form.vital_type} onChange={handleChange} />

      <button className="admin-btn" onClick={submit}>Register Device</button>

      {msg && (
        <div style={{ marginTop: 20, fontSize: 14, color: "#475569", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
