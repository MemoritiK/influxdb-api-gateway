# influxdb tutorial
import influxdb_client
import os
import time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

token = os.environ.get("INFLUXDB_TOKEN")
org = "iot_org"
url = "http://localhost:8086"

write_client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)

bucket="<BUCKET>"

write_api = client.write_api(write_options=SYNCHRONOUS)
   
for value in range(5):
  point = (
    Point("measurement1")
    .tag("tagname1", "tagvalue1")
    .field("field1", value)
  )
  write_api.write(bucket=bucket, org="iot_org", record=point)
  time.sleep(1) # separate points by 1 second
  query_api = client.query_api()
  
  
  
  query = """from(bucket: "<BUCKET>")
   |> range(start: -10m)
   |> filter(fn: (r) => r._measurement == "measurement1")"""
  tables = query_api.query(query, org="iot_org")
  
  for table in tables:
    for record in table.records:
      print(record)
