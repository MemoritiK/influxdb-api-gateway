# Time Series Data Management API

A production-ready time series data management system built with FastAPI, InfluxDB, and React. This platform provides a complete solution for collecting, storing, visualizing, and managing time-series data with Docker deployment, with a built-in showcase for medical vitals monitoring.

## Quick Start with Docker

```bash
docker pull memoritik/iot-backend:latest
```
```bash
docker run -p 8000:8000 \
  -e INFLUX_TOKEN=your_token \
  -e INFLUX_ORG=your_org \
  -e INFLUX_BUCKET=your_bucket \
  memoritik/iot-backend:latest
```

Access the application:
- Dashboard: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- API Endpoint: http://localhost:8000/api

## Features

- **Time Series Storage**: InfluxDB for high-performance data management
- **Real-time Simulation**: Configurable device simulation with adjustable intervals
- **Interactive Charts**: Dynamic visualization with time-based aggregation
- **Device Management**: Complete CRUD operations for device registration
- **RESTful API**: Comprehensive endpoints for data ingestion and retrieval
- **Docker Ready**: Single container with everything included

## Architecture

The system consists of three main components:

1. **React Frontend** - Interactive dashboard for data visualization and device management
2. **FastAPI Backend** - REST API for data processing and device management
3. **InfluxDB** - Time-series database (cloud or self-hosted)

Data flows from simulated devices through the backend into InfluxDB, with real-time visualization in the frontend.

## API Examples

### Ingest Data
```bash
POST /api/data/
{
  "measurement": "patient_vitals",
  "tag": {
    "device_id": "device_001",
    "patient_id": "patient_123",
    "vitals_type": "heart_rate"
  },
  "field": {
    "value": 72,
    "unit": "bpm",
    "status": "normal"
  }
}
```

### Query Data
```bash
POST /api/data/read/
{
  "measurement_name": "patient_vitals",
  "tag": {"device_id": "device_001"},
  "field": ["value", "unit"],
  "time_interval": 24  # Last 24 hours
}
```

## Configuration

Set these environment variables when running the Docker container:

```bash
INFLUX_TOKEN=your_influxdb_token
INFLUX_ORG=your_organization
INFLUX_BUCKET=your_bucket_name
# Optional: INFLUX_URL (defaults to cloud)
```

## Use Cases

This system is flexible and can be adapted for:
- Medical vitals monitoring (default showcase)
- Environmental sensors (temperature, humidity)
- Financial data tracking
- Application performance metrics

## Development

For local development:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```