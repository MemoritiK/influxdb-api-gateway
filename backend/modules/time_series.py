from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from database_influx import  bucket, org
from influx_dependencies import get_query_api, get_write_api
from datetime import datetime, timezone
from influxdb_client import Point, WritePrecision

router = APIRouter()

class WritingData(BaseModel):
    measurement: str
    tag: Dict[str,str]
    field: Dict[str,float]
    timestamp: Optional[datetime] = None

class ReadingData(BaseModel):
    time_interval: int
    measurement_name: str
    tag: Dict[str,str]
    field: List[str]
    

def write_data(data:WritingData, write_api) -> None:
    point = Point(data.measurement)
    
    for key, value in data.tag.items():
        point = point.tag(key, value)
    
    for key, value in data.field.items():
        point = point.field(key, value)
    
    if data.timestamp is not None:
        point = point.time(data.timestamp)
    else:
        point = point.time(datetime.now(timezone.utc))
        
    write_api.write(bucket=bucket, record=point)
    

def query_data(data: ReadingData, query_api):
    query = f'''
        from(bucket: "{bucket}")
        |> range(start: -{data.time_interval}h)
        |> filter(fn: (r) => r["_measurement"] == "{data.measurement_name}")
    '''
    for k, v in data.tag.items():
        query += f'\n|> filter(fn: (r) => r["{k}"] == "{v}")'

    if data.field and data.field[0] != "All":
        fields_str = " or ".join([f'r["_field"] == "{f}"' for f in data.field])
        query += f'\n|> filter(fn: (r) => {fields_str})'

    result = query_api.query(org=org, query=query)

    # Build device-centric table
    table = {}
    for table_result in result:
        for record in table_result.records:
            time = record.get_time().isoformat()
            field = record.get_field()
            value = record.get_value()
            device_id = record.values.get("device_id", "unknown")

            if device_id not in table:
                table[device_id] = []

            table[device_id].append({
                "time": time,
                "field": field,
                "value": value,
                "tags": record.values
            })

    return table

    
@router.post("/")
def record_data(data: WritingData, write_api = Depends(get_write_api)):
    if not data:
            raise HTTPException(status_code=400, detail="No data provided")
    write_data(data, write_api)    
    return {"message": "Recorded!"}, 201


@router.post("/read/")
def read_data(data:ReadingData, query_api = Depends(get_query_api)):
    if not data:
            raise HTTPException(status_code=400, detail="No data provided")
    return query_data(data, query_api)
