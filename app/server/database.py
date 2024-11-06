import motor.motor_asyncio
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from server.mapcalcs import *
import math

MONGO_DETAILS = "mongodb+srv://GISadmin:ASUGDMS2024@giscluster.cdvyh.mongodb.net/?retryWrites=true&w=majority&appName=GISCluster"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.Rescue21

caller_collection = database.get_collection("Caller")
rff_collection = database.get_collection("RFF")

# Leaflet denotes as lat, lng
def rff_helper(rff) -> dict:
    return {
        "id": str(rff["_id"]),
        "name": rff["name"],
        "lat": rff["lat"],
        "lng": rff["long"]
    }

def caller_helper(caller) -> dict:
    return {
        "id": str(caller["_id"]),
        "receivers": caller["receivers"],
        "start-time": caller["start-time"]
    }

async def fix_helper(caller) -> dict:
    fix = {"lat": None, "long": None}
    if len(caller["receivers"]) < 1:
        return fix

    receivers = caller["receivers"]
    bearing1 = math.radians(degrees_to_decimal(receivers[0]["bearing"]))
    bearing2 = math.radians(degrees_to_decimal(receivers[1]["bearing"]))
    
    rff1 = await rff_collection.find_one({"name": receivers[0]["RFF"]})
    lat1 = math.radians(float(rff1["lat"]))
    long1 = math.radians(float(rff1["long"]))
    
    rff2 = await rff_collection.find_one({"name": receivers[1]["RFF"]})
    lat2 = math.radians(float(rff2["lat"]))
    long2 = math.radians(float(rff2["long"]))
    
    lat, long = calc_intersection(lat1, long1, bearing1, lat2, long2, bearing2)
    fix["lat"] = lat
    fix["long"] = long
    return fix

# Retrieve all RFFs present in the database
async def retrieve_RFFs():
    rffs = []
    async for rff in rff_collection.find():
        rffs.append(rff_helper(rff))
    return rffs

# Retrieve all callers present in the database
async def retrieve_callers():
    callers = []
    async for caller in caller_collection.find():
        callers.append(caller_helper(caller))
    return callers

# Add a new caller into to the database
async def add_caller(caller_data: dict) -> dict:
    caller_data["fix"] = await fix_helper(caller_data)
    
    date_time_obj = datetime.now()
    date_time_stop = date_time_obj + timedelta(seconds=30)
    
    caller_data["start-time"] = date_time_obj.strftime("%Y-%m-%d %H:%M:%S")
    caller_data["stop-time"] = date_time_stop.strftime("%Y-%m-%d %H:%M:%S")
    caller = await caller_collection.insert_one(caller_data)
    new_caller = await caller_collection.find_one({"_id": caller.inserted_id})
    return caller_helper(new_caller)


# Retrieve a caller with a matching ID
async def retrieve_caller(id: str) -> dict:
    caller = await caller_collection.find_one({"_id": ObjectId(id)})
    if caller:
        return caller_helper(caller)


# Update a caller with a matching ID
async def update_caller(id: str, data: dict):
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False
    caller = await caller_collection.find_one({"_id": ObjectId(id)})
    if caller:
        updated_caller = await caller_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if updated_caller:
            return True
        return False


# Delete a caller from the database
async def delete_caller(id: str):
    caller = await caller_collection.find_one({"_id": ObjectId(id)})
    if caller:
        await caller_collection.delete_one({"_id": ObjectId(id)})
        return True
