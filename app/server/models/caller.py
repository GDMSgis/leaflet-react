from typing import Optional
from pydantic import BaseModel, Field

class CallerSchema(BaseModel):
    channel: str = Field(...)
    bearing1: str = Field(...)
    rff1: str = Field(...)
    fix: str = Field(...)
    starttime: str = Field(...)
    stoptime: str = Field(...)

    class Config:
        schema_extra = {
            "caller1": {
                "channel": "16",
                "bearing1": "---",
                "rff1": "San Diego",
                "fix": "---",
                "starttime": "02:48:20",
                "stoptime": "02:49:43",
            }
        }

class UpdateCallerModel(BaseModel):
    channel: Optional[str]
    bearing1: Optional[str]
    rff1: Optional[str]
    fix: Optional[str]
    starttime: Optional[str]
    stoptime: Optional[str]

    class Config:
        schema_extra = {
            "caller1": {
                "channel": "16",
                "bearing1": "---",
                "rff1": "San Diego",
                "fix": "---",
                "starttime": "02:48:20",
                "stoptime": "02:49:43",
            }
        }

def ResponseModel(data, message):
    return {
        "data": [data],
        "code": 200,
        "message": message,
    }

def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
