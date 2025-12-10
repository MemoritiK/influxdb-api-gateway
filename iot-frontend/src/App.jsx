import { useState } from "react";
import RegisterDevice from "./pages/RegisterDevice";
import ManageDevices from "./pages/ManageDevices";
import ViewData from "./pages/ViewData";

export default function App() {
  const [page, setPage] = useState("home");

  if (page !== "home") {
    return (
      <div className="container">
        <button
          className="admin-btn"
          style={{ width: 140, marginBottom: 20, background: "#e2e8f0", color: "#000" }}
          onClick={() => setPage("home")}
        >
          ← Back
        </button>

        {page === "register" && <RegisterDevice />}
        {page === "manage" && <ManageDevices />}
        {page === "data" && <ViewData />}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="title">IoT Device Management</div>

      <div className="home-grid">
        <button className="admin-btn" onClick={() => setPage("register")}>Register Device</button>
        <button className="admin-btn" onClick={() => setPage("manage")}>Manage Devices</button>
        <button className="admin-btn" onClick={() => setPage("data")}>View Device Data</button>
      </div>
    </div>
  );
}
