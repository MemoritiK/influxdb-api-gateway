import influxdb_client
import os
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

token = os.environ.get("INFLUXDB_TOKEN")
org = "iot_org"
url = "http://localhost:8086"
bucket="Collection_1"

def init_inlfux():
    client = influxdb_client.InfluxDBClient(url=url, token=token, org=org) 
    write_api = client.write_api(write_options=SYNCHRONOUS)
    query_api = client.query_api()
    return write_api, query_api
