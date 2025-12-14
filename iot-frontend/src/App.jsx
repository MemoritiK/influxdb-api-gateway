import { useState, useEffect, useRef, useCallback } from "react";
import RegisterDevice from "./pages/RegisterDevice";
import ManageDevices from "./pages/ManageDevices";
import ViewData from "./pages/ViewData";
import api from "./api"

export default function App() {
  const [page, setPage] = useState("home");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);
  const hrTimeoutRef = useRef(null);
  const spo2TimeoutRef = useRef(null);
  
  // Use refs to track simulation state inside timeout callbacks
  const isSimulatingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Clear all active timers
  const clearAllTimers = () => {
    if (hrTimeoutRef.current) {
      clearTimeout(hrTimeoutRef.current);
      hrTimeoutRef.current = null;
    }
    if (spo2TimeoutRef.current) {
      clearTimeout(spo2TimeoutRef.current);
      spo2TimeoutRef.current = null;
    }
  };

  // Simulate Heart Rate device
  const simulateHeartRate = async () => {
    try {
      const payload = {
        measurement: "patient_vitals",
        tag: {
          device_id: "hr_sensor_patient_1",
          patient_id: "patient_001",
          vitals_type: "heart_rate"
        },
        field: {
          value: Math.floor(Math.random() * (100 - 60) + 60),
          unit: "bpm",
          status: "normal"
        }
      };
      await api.post("/data/", payload);
      console.log(`Heart Rate: ${payload.field.value} bpm`);
    } catch (error) {
      console.error("Heart Rate simulation failed:", error);
    }
  };

  // Simulate Blood Oxygen device
  const simulateBloodOxygen = async () => {
    try {
      const payload = {
        measurement: "patient_vitals",
        tag: {
          device_id: "spo2_sensor_patient_1",
          patient_id: "patient_001",
          vitals_type: "blood_oxygen"
        },
        field: {
          value: Math.floor(Math.random() * (100 - 92) + 92),
          unit: "percent",
          status: "normal"
        }
      };
      await api.post("/data/", payload);
      console.log(`Blood Oxygen: ${payload.field.value}%`);
    } catch (error) {
      console.error("Blood Oxygen simulation failed:", error);
    }
  };

  // Schedule Device 1 (Heart Rate) with random intervals
  const scheduleDevice1 = useCallback(() => {
    // Check using ref to get latest state
    if (!isSimulatingRef.current) return;
    
    const nextInterval = Math.floor(Math.random() * (120000 - 30000) + 30000);
    hrTimeoutRef.current = setTimeout(() => {
      simulateHeartRate();
      setSimulationCount(prev => prev + 1);
      scheduleDevice1(); // Schedule next
    }, nextInterval);
  }, []);

  // Schedule Device 2 (Blood Oxygen) with random intervals
  const scheduleDevice2 = useCallback(() => {
    // Check using ref to get latest state
    if (!isSimulatingRef.current) return;
    
    const nextInterval = Math.floor(Math.random() * (120000 - 30000) + 30000);
    spo2TimeoutRef.current = setTimeout(() => {
      simulateBloodOxygen();
      setSimulationCount(prev => prev + 1);
      scheduleDevice2(); // Schedule next
    }, nextInterval);
  }, []);

  // Start/Stop simulation
  const startSimulation = async () => {
    if (isSimulating) {
      // Stop simulation
      clearAllTimers();
      setIsSimulating(false);
      console.log("Simulation stopped");
    } else {
      // Start simulation
      clearAllTimers(); // Clear any existing timers first
      setIsSimulating(true);
      setSimulationCount(0);
      
      // Initial send - both devices together
      try {
        const payload1 = {
          measurement: "patient_vitals",
          tag: {
            device_id: "hr_sensor_patient_1",
            patient_id: "patient_001",
            vitals_type: "heart_rate"
          },
          field: {
            value: Math.floor(Math.random() * (100 - 60) + 60),
            unit: "bpm",
            status: "normal"
          }
        };

        const payload2 = {
          measurement: "patient_vitals",
          tag: {
            device_id: "spo2_sensor_patient_1",
            patient_id: "patient_001",
            vitals_type: "blood_oxygen"
          },
          field: {
            value: Math.floor(Math.random() * (100 - 92) + 92),
            unit: "percent",
            status: "normal"
          }
        };

        await Promise.all([
          api.post("/data/", payload1),
          api.post("/data/", payload2)
        ]);
        setSimulationCount(prev => prev + 2);
        console.log("Initial data sent for both devices");
      } catch (error) {
        console.error("Initial simulation failed:", error);
      }
      
      // Start both schedulers
      scheduleDevice1(); // Device 1 starts immediately with random intervals
      
      // Device 2: First send after 1 minute, then random intervals
      spo2TimeoutRef.current = setTimeout(() => {
        if (isSimulatingRef.current) {
          simulateBloodOxygen();
          setSimulationCount(prev => prev + 1);
          scheduleDevice2();
        }
      }, 60000);
      
      console.log("Simulation started:");
      console.log("  - Device 1: Sends now, then random 30sec-2min intervals");
      console.log("  - Device 2: First send in 1 min, then random 30sec-2min intervals");
    }
  };

  // Stop simulation button handler
  const stopSimulation = () => {
    clearAllTimers();
    setIsSimulating(false);
    console.log("Simulation stopped");
  };

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
      <div className="title">Vitals Monitoring API</div>

      <div className="home-grid">
        <button className="admin-btn" onClick={() => setPage("register")}>
          Register Device
        </button>
        <button className="admin-btn" onClick={() => setPage("manage")}>
          Manage Devices
        </button>
        <button className="admin-btn" onClick={() => setPage("data")}>
          View Device Data
        </button>
        
        <button 
          className="admin-btn" 
          onClick={startSimulation}
          style={{
            background: isSimulating ? "#f56565" : "#48bb78",
            color: "white"
          }}
        >
          {isSimulating ? (
            <> Stop Simulation</>
          ) : (
            " Start Data Simulation"
          )}
        </button>
      </div>

      {isSimulating && (
        <div style={styles.simulationInfo}>
          <p> Simulating 2 devices with random intervals (30 sec - 2 min):</p>
          <ul style={styles.deviceList}>
            <li>
              <strong>hr_sensor_patient_1</strong> - Heart Rate (60-100 bpm)
              <br />
              <small>Sends: Now, then random intervals 30s-2min</small>
            </li>
            <li>
              <strong>spo2_sensor_patient_1</strong> - Blood Oxygen (92-100%)
              <br />
              <small>Sends: First in 1 min, then random intervals 30s-2min</small>
            </li>
          </ul>
          <div style={styles.nextSendInfo}>
            <p>Simulation Count: {simulationCount} data points sent</p>
          </div>
          <button 
            onClick={stopSimulation}
            style={styles.stopButton}
          >
            Stop Simulation Now
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  simulationInfo: {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "#f7fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    maxWidth: "500px",
    margin: "2rem auto 0"
  },
  deviceList: {
    paddingLeft: "1.5rem",
    margin: "0.5rem 0"
  },
  nextSendInfo: {
    margin: "1rem 0",
    padding: "0.8rem",
    background: "#ebf8ff",
    borderRadius: "6px",
    fontSize: "0.9rem",
    color: "#2b6cb0"
  },
  stopButton: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    background: "#f56565",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem"
  }
};