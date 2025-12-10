from fastapi import APIRouter, HTTPException, Query
from typing import Annotated, List
from sqlmodel import select, SQLModel, Field
from database_sql import SessionDep

router = APIRouter()

class DeviceBase(SQLModel):
    device_id: str = Field(unique=True, index=True)
    location: str 
    name: str
    quantity_measured: str

class Device(DeviceBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

class DeviceUpdate(SQLModel):
    name: str | None = None
    location: str | None = None

@router.post("/", response_model=DeviceBase)
def create_device(device: DeviceBase, session: SessionDep):
    device_exist = session.exec(select(Device).where(Device.device_id == device.device_id)).first()
    if device_exist:
           raise HTTPException(status_code=400, detail="Device already exists")
           
    db_device = Device.model_validate(device)
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device

@router.get("/", response_model=List[DeviceBase])
def read_device(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
    device_id: int | None = Query(default=None)):
    if device_id is None:
        devices = list(session.exec(select(Device).offset(offset).limit(limit)).all())
        return devices
    
    else:
        device = session.exec(select(Device).where(Device.device_id == device_id)).first()
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return [device]
        
@router.delete("/{device_id}")
def delete_device(device_id: int, session: SessionDep):
    device = session.exec(select(Device).where(Device.device_id == device_id)).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    session.delete(device)
    session.commit()
    return {"ok": True}

@router.put("/{device_id}", response_model=DeviceBase)
def update_device(device_id: int, device: DeviceUpdate, session: SessionDep):
    device_old = session.exec(select(Device).where(Device.device_id == device_id)).first()
    if not device_old:
        raise HTTPException(status_code=404, detail="Device not found")
    device_dict = device.model_dump(exclude_unset=True)
    device_old.sqlmodel_update(device_dict)
    session.add(device_old)
    session.commit()
    session.refresh(device_old)
    return device_old