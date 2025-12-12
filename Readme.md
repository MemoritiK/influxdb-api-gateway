# IoT Data Collection Showcase

A full-stack IoT showcase project that simulates device data, stores it in **InfluxDB**, and provides a **web-based interface** for monitoring. The backend is implemented using **FastAPI**, the frontend is a React-based UI served through the backend, and the whole system is **containerized with Docker** for easy deployment.

This project is designed as a showcase and **does not require user authentication**. 

<img width="949" height="1003" alt="image" src="https://github.com/user-attachments/assets/3972c231-ce32-45c2-a1b9-f30e1f5b85de" />
<img width="839" height="962" alt="image" src="https://github.com/user-attachments/assets/a3888917-5eac-458c-a43f-ca230904a62d" />
<img width="921" height="784" alt="image" src="https://github.com/user-attachments/assets/234bc440-1f9f-41e0-8535-9b95508df7f2" />


## Table of Contents

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Setup & Installation](#setup--installation)
* [Docker](#usage-via-docker)
* [Configuration](#configuration)
* [Notes](#notes)

## Architecture

The system is designed with **three main components**:

1. **Simulator (backend/simulator.py)**

   * Generates simulated IoT sensor data (e.g., temperature, pressure, wind speed).
   * Sends data to the backend, which then writes it to InfluxDB.

2. **Backend (FastAPI)**

   * Serves REST API endpoints to fetch device information and time-series data.
   * Hosts the frontend React application.
   * Handles device status updates: each device is marked as **active** or **inactive** based on the last timestamp received from InfluxDB.

3. **Database (InfluxDB)**
   
   * Stores all time-series data from devices.
   * Can be run on the cloud.
   * Each device’s latest reading is used to calculate its current status.

**Data Flow:**

```
[Simulator] --> [FastAPI Backend] --> [InfluxDB] 
     ^                                       |
     |                                       v
     +--------------------------------> [Frontend Dashboard]
```

* The simulator continuously generates mock data for demonstration purposes.
* Backend fetches and serves this data to the frontend.
* Device statuses are calculated dynamically and updated in real-time.


## Technologies

* **Backend**: FastAPI, SQLModel, InfluxDB Client
* **Frontend**: React, Vite
* **Database**: InfluxDB (time-series)
* **Containerization**: Docker, Docker Compose
* **CI/CD**: GitHub Actions

## Setup & Installation

### Prerequisites

* Python 3.10+
* Node.js & npm
* Docker & Docker Compose

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/MemoritiK/IoT_monitoring_system.git
cd IoT_monitoring_system/backend
```

2. Install Python dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:

```
INFLUX_TOKEN=<your_influx_token>
INFLUX_ORG=<your_influx_org>
INFLUX_BUCKET=<your_bucket>
```

4. Run the backend server locally:

```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../iot-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Build the frontend (if serving through FastAPI):

```bash
npm run build
```

---

## Usage via Docker

1. **Pull the image from Docker Hub**:

```bash
docker pull memoritik/iot-backend:latest
```

2. **Run the container** with your InfluxDB credentials:

```bash
docker run -p 8000:8000 \
  -e INFLUX_TOKEN=<your_influx_token> \
  -e INFLUX_ORG=<your_influx_org> \
  -e INFLUX_BUCKET=<your_influx_bucket> \
  memoritik/iot-backend:latest
```

3. **Access the app**:

Open your browser at [http://localhost:8000](http://localhost:8000) to view the dashboard and see the simulated IoT devices in action.

---

## Configuration

* **InfluxDB**: Use `.env` variables (`INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`).
* **Device Data**: Simulated via `simulator.py`.
* **Frontend API Endpoint**: `http://localhost:8000/api` (configurable in `api.js`).


## Notes

* This is a **showcase project**: no authentication or user management.
* Device metadata is stored in SQLite (included for demonstration).
* Time-series data is stored in InfluxDB (cloud or local).
* Resetting demo data requires rebuilding the Docker container.
