import motor.motor_asyncio
from bson.objectid import ObjectId

MONGO_DETAILS = "mongodb+srv://GISadmin:ASUGDMS2024@giscluster.cdvyh.mongodb.net/?retryWrites=true&w=majority&appName=GISCluster"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.callers

caller_collection = database.get_collection("callers_collection")

def caller_helper(caller) -> dict:
    return {
        "id": str(caller["_id"]),
        "channel": caller["channel"],
        "bearing1": caller["bearing1"],
        "rff1": caller["rff1"],
        "fix": caller["fix"],
        "starttime": caller["starttime"],
        "stoptime": caller["stoptime"],
    }


# Retrieve all callers present in the database
async def retrieve_callers():
    callers = []
    async for caller in caller_collection.find():
        callers.append(caller_helper(caller))
    return callers


# Add a new caller into to the database
async def add_caller(caller_data: dict) -> dict:
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
