from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder

from ..database import (
    add_caller,
    delete_caller,
    retrieve_caller,
    retrieve_callers,
    update_caller,
)
from ..models.caller import (
    ErrorResponseModel,
    ResponseModel,
    Caller,
)

router = APIRouter()

@router.post("/", response_description="Caller data added into the database")
async def add_caller_data(caller: Caller = Body(...)):
    caller = jsonable_encoder(caller)
    new_caller = await add_caller(caller)
    return ResponseModel(new_caller, "Caller added successfully.")


# @router.get("/", response_description="Callers retrieved")
# async def get_callers():
#     callers = await retrieve_callers()
#     if callers:
#         return ResponseModel(callers, "Callers data retrieved successfully")
#     return ResponseModel(callers, "Empty list returned")


# @router.get("/{id}", response_description="Caller data retrieved")
# async def get_caller_data(id):
#     caller = await retrieve_caller(id)
#     if caller:
#         return ResponseModel(caller, "Caller data retrieved successfully")
#     return ErrorResponseModel("An error occurred.", 404, "Caller doesn't exist.")


# @router.put("/{id}")
# async def update_caller_data(id: str, req: UpdateCallerModel = Body(...)):
#     req = {k: v for k, v in req.dict().items() if v is not None}
#     updated_caller = await update_caller(id, req)
#     if updated_caller:
#         return ResponseModel(
#             "Caller with ID: {} name update is successful".format(id),
#             "Caller name updated successfully",
#         )
#     return ErrorResponseModel(
#         "An error occurred",
#         404,
#         "There was an error updating the caller data.",
#     )


# @router.delete("/{id}", response_description="Caller data deleted from the database")
# async def delete_caller_data(id: str):
#     deleted_caller = await delete_caller(id)
#     if deleted_caller:
#         return ResponseModel(
#             "Caller with ID: {} removed".format(id), "Caller deleted successfully"
#         )
#     return ErrorResponseModel(
#         "An error occurred", 404, "Caller with id {0} doesn't exist".format(id)
#     )
