import time
import threading
import random
import requests
from datetime import datetime, timezone

API_URL = "http://localhost:8000/data/"

DEVICES = [
    {
        "device_id": "dev-temp-001",
        "field": "temperature",
        "min": 20,
        "max": 40
    },
    {
        "device_id": "dev-press-001",
        "field": "pressure",
        "min": 800,
        "max": 1200
    },
    {
        "device_id": "dev-wind-001",
        "field": "wind_speed",
        "min": 0,
        "max": 60
    }
]

def generate_and_send(device):
    while True:
        value = round(random.uniform(device["min"], device["max"]), 2)

        payload = {
            "measurement": "weather",
            "tag": {"device_id": device["device_id"]},
            "field": {device["field"]: value},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        try:
            requests.post(API_URL, json=payload)
            print(f"Sent from {device['device_id']}: {value}")
        except Exception as e:
            print(f"❌ Failed send: {e}")

        time.sleep(30)  # send every 30 sec (change to 600 for 10 min)
        

def start_simulation():
    time.sleep(5)
    for device in DEVICES:
        thread = threading.Thread(target=generate_and_send, args=(device,))
        thread.daemon = True
        thread.start()

