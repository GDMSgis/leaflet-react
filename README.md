# <center> Alternative GIS Solution </center>

### Frontend: ReactJS + LeafletJS

This web application is a simple UI that allows users to:

- View live data on the Leaflet Map
- Define a decay rate of data
- Toggle permanance on a LoB
- Bookmark points of interest
- Fly to points of interest
- Fly to areas of interest
- Place markers
- Interact with basic functionalities of a generic map
- Draw areas of responsibility
- Toggle AOR visibility
- Inspect caller/LoB data

### Backend: Python (FastAPI) + MongoDB

This application is a simple web api that interfaces with a MongoDB instance to fetch RFF data, calculate LoB intersections and handle basic CRUD operations.

## <center> How to Install </center>

Create a MongoDB Cluster:

- Name the database Rescue21
- Create 2 collections: Caller and RFF
- Change link in line 7 of database.py to the connection URI of the Cluster

For Python Backend:

- Python 3.11 +
- Create virtual environemnt `python -m venv <venv name>`
- Activate venv: for Windows: `./<path to venv>/Scripts/activate` for Linux `source /<path to venv>/bin/activate`
- run `pip install -r requirements.txt`

For Frontend:

- NodeJS
- run `npm i`

## <center> How to Run </center>

Run backend first with: `python ./app/main.py`

In another terminal window

Then run front end with: `npm run dev`
