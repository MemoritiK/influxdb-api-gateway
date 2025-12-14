import influxdb_client
import os
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

if os.path.exists('.env'):
    load_dotenv()

token = os.getenv("INFLUX_TOKEN")
url = os.getenv("INFLUX_URL", "https://us-east-1-1.aws.cloud2.influxdata.com")
org = os.getenv("INFLUX_ORG")
bucket = os.getenv("INFLUX_BUCKET")

def init_inlfux():
    client = influxdb_client.InfluxDBClient(url=url, token=token, org=org) 
    write_api = client.write_api(write_options=SYNCHRONOUS)
    query_api = client.query_api()
    return write_api, query_api
