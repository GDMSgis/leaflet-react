import React, { useEffect, createContext, useContext, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker as LeafletMarker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaBroadcastTower} from "react-icons/fa";
import { RiShip2Line } from "react-icons/ri";
import 'leaflet/dist/leaflet.css';
import { BsBroadcast } from "react-icons/bs";
import MarkerContextMenu from "./MarkerContextMenu";

let decayRateGlobal = 0; // Initialize the global decay rate

// Custom icon creation function
function createCustomIcon(icon) {
  const customMarkerHtml = renderToStaticMarkup(icon);
  return L.divIcon({
    html: customMarkerHtml,
    iconAnchor: [12,12],
    popupAnchor: [0,0],
    className: 'custom-icon'
  });
}

// Pre-defined icons using React Icons
const rffIcon = createCustomIcon(<FaBroadcastTower size={25} />);
const signalIcon = createCustomIcon(<BsBroadcast size={25} />);
const boatIcon = createCustomIcon(<RiShip2Line size={25} />);


function getBearing(startLat, startLng, destLat, destLng) {
  startLat = startLat * Math.PI / 180;
  startLng = startLng * Math.PI / 180;
  destLat = destLat * Math.PI / 180;
  destLng = destLng * Math.PI / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  const atan2 = Math.atan2(y, x);
  return Math.round((atan2 * 180 / Math.PI + 360) % 360).toString(); // Return bearing in degrees
}

function calculateEndPoint(origin, bearing, distance) {
  const R = 6371e3; // Earth radius in meters
  const angular = distance / R; // Angular distance in radians
  const radians = bearing * Math.PI / 180; // Convert bearing to radians

  const lat1 = origin.lat * Math.PI / 180; // Origin latitude in radians
  const lon1 = origin.lng * Math.PI / 180; // Origin longitude in radians

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(radians));
  const lon2 = lon1 + Math.atan2(Math.sin(radians) * Math.sin(angular) * Math.cos(lat1), Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2));

  return {
    lat: lat2 * 180 / Math.PI,
    lng: (lon2 * 180 / Math.PI + 540) % 360 - 180 // Normalize to -180...+180
  };
}


const MarkerContext = createContext(null);
function MarkerProvider({ children }) {
  const [markers, setMarkers] = useState([
    {
      name: "San Francisco",
      latlng: {
        lat: 37.76,
        lng: -122.45,
      },
      type: "RFF",
      description: "",
      audioFile: null,
      pingTime: new Date().toISOString(),
    }
  ]);
  const [lines, setLines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [circles, setCircles] = useState([]);
  const [click, setClick] = useState(null);
  const [areaFirstClick, setAreaFirstClick] = useState(null);
  const [areaPrevClick, setAreaPrevClick] = useState(null);
  const [areaTmpLines, setAreaTmpLines] = useState([]);
  const [clickedMarker, setClickedMarker] = useState(null);
  const [popup, setPopup] = useState(null);

  const [replay, setReplay] = useState(false);
  const [pauseReplay, setPauseReplay] = useState(false);
  const [permanentLines, setPermanentLines] = useState(new Set()); // Store IDs of permanent lines

// Function to toggle permanence of a line
  function toggleLinePermanence(lineId) {
    setPermanentLines(prev => {
      const updated = new Set(prev);
      if (updated.has(lineId)) updated.delete(lineId);
      else updated.add(lineId);
      return updated;
    });
  }


  // Modify useEffect to fetch only recent markers if not in replay mode
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/caller/');
        const result = await response.json();

        if (result.data && result.data.length) {
          const currentTime = new Date().getTime();
          // Filter the fetched records
          const recentData = result.data[0].filter(caller => {
            const callTime = new Date(caller.starttime).getTime();
            return replay ? true : callTime >= (currentTime - decayRateGlobal); // Adjust the decayRate usage
          });

          const newLines = recentData.map(caller => {
            const startLatLng = markers.find(marker => marker.name === caller.rff1)?.latlng;
            if (startLatLng) {
              const endLatLng = calculateEndPoint(startLatLng, Number(caller.bearing1), 160934.4);
              return {
                start: startLatLng,
                end: endLatLng,
                id: caller.id,
                channel: caller.channel,
                bearing1: caller.bearing1,
                rff1: caller.rff1,
                starttime: caller.starttime,
                stoptime: caller.stoptime,
                fix: caller.fix,
                timestamp: new Date(caller.starttime).getTime()  // Use the timestamp from the caller record
              };
            }
            return null;
          }).filter(line => line !== null);

          addLines(newLines);
        }
      } catch (error) {
        console.error('Error fetching signals from MongoDB:', error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [markers, replay, decayRateGlobal]);

  // Function to handle replay button click
  async function handleReplayClick() {
    setReplay(true); // Begin replay mode
    setPauseReplay(false); // Reset pause state

    // Fetch last 5 minutes of data
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    try {
      const response = await fetch(`http://localhost:8000/caller/?starttime=${fiveMinutesAgo}`);
      const result = await response.json();

      if (result.data && result.data.length) {
        const replayData = result.data[0];
        let index = 0;

        // Time-lapse function
        const replayStep = () => {
          if (index >= replayData.length || !replay) return setReplay(false); // End if out of data or replay is stopped

          if (!pauseReplay) {
            const caller = replayData[index];
            const startLatLng = markers.find(marker => marker.name === caller.rff1)?.latlng;
            if (startLatLng) {
              const endLatLng = calculateEndPoint(startLatLng, Number(caller.bearing1), 160934.4);
              const newLine = {
                start: startLatLng,
                end: endLatLng,
                id: `${caller.id}-replay`,
                timestamp: new Date(caller.starttime).getTime()
              };
              addLines([newLine]);

              setTimeout(() => {
                setLines(prev => prev.filter(line => line.id !== newLine.id || permanentLines.has(line.id)));
              }, decayRateGlobal);
            }
            index++;
          }
          setTimeout(replayStep, 1000); // Replay interval
        };

        replayStep(); // Start replaying data
      }
    } catch (error) {
      console.error("Replay data fetch error:", error);
    }
  }




  // Function to add a marker, determine the nearest RFF and calculate bearing
  function addMarker(latlng, type, description, audioFile = null, pingTime = null, id = null) {
    const pt = pingTime ?? new Date().toISOString();
    const newMarkerId = id ?? `${type}-${Date.now()}`; // Generate a unique ID if not provided
    const newMarker = { latlng, type, description, audioFile, pingTime: pt, id: newMarkerId };

    // Check if the marker being added is of type 'Signal'
    if (type === 'Signal') {
      const nearestRFF = findNearestRFF(latlng); // Find the nearest RFF marker
      if (nearestRFF) {
        const bearing = getBearing(nearestRFF.latlng.lat, nearestRFF.latlng.lng, latlng.lat, latlng.lng);
        newMarker.bearing1 = bearing;  // Set the bearing
        newMarker.rff1 = nearestRFF.name; // Set the nearest RFF name

        // Create a line associated with this marker
        const endLatLng = calculateEndPoint(nearestRFF.latlng, Number(bearing), 160934.4);
        const newLine = {
          start: nearestRFF.latlng,
          end: endLatLng,
          id: `${newMarkerId}-line`, // Associate line ID with marker ID
          signalMarkerId: newMarkerId, // Link line to signal marker
          timestamp: new Date().getTime() // Add a timestamp for decay
        };

        addLines([newLine]);
      }
    }

    setMarkers([...markers, newMarker]);

    // Send to the database if it's a Signal marker
    if (newMarker.rff1 && newMarker.bearing1) {
      addSignalToDatabase(newMarker.rff1, newMarker.bearing1);
    }
  }


// Function to find the nearest RFF marker
  function findNearestRFF(latlng) {
    const rffMarkers = markers.filter(marker => marker.type === 'RFF');

    let nearestRFF = null;
    let minDistance = Infinity;

    rffMarkers.forEach(rff => {
      const distance = L.latLng(rff.latlng).distanceTo(latlng);  // Calculate distance using Leaflet
      if (distance < minDistance) {
        minDistance = distance;
        nearestRFF = rff;  // Update nearest RFF
      }
    });

    return nearestRFF;  // Return the nearest RFF marker
  }



// Updated function to add the signal marker to the database
  async function addSignalToDatabase(rff1 = "---", bearing1 = "---") {
    try {
      const body = {
        channel: "16",
        bearing1,
        rff1,
        fix: "---",
        starttime: new Date().toISOString(),
        stoptime: "---",
      };

      const response = await fetch('http://localhost:8000/caller/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),  // Send the request without latlng
      });

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating signal marker:', error);
    }
  }

  async function updateSignalInDatabase(updatedData) {
    try {
      let id = updatedData.id;
      delete updatedData['id'];
      const response = await fetch(`http://localhost:8000/caller/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      console.info(result.data);
      return result.data;
    } catch (error) {
      console.error('Error updating signal marker:', error);
    }
  }

  function deleteMarker(latlng) {
    setMarkers(markers.filter(x => x.latlng.lat !== latlng.lat || x.latlng.lng !== latlng.lng));
  }

  async function deleteSignalInDatabase(id) {
    try {
      const response = await fetch(`http://localhost:8000/caller/${id}`, {  // Pass id in URL
        method: 'DELETE',
      });

      if (response.ok) {
        setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));  // Remove marker from state
      } else {
        console.error("Failed to delete marker:", response.statusText);
      }
    } catch (error) {
      console.error('Error deleting signal marker:', error);
    }
  }


  function addLines(newLines) {
    setLines(prevLines => {
      const existingLineIds = new Set(prevLines.map(line => line.id));
      const filteredNewLines = newLines.filter(line => !existingLineIds.has(line.id));
      return [...prevLines, ...filteredNewLines];
    });
    handleLineIntersection(); // Check for intersections after adding new lines
  }

  function addCircle(center, radius) {
    setCircles([...circles, { center, radius }]);
  }

  function checkLineIntersection(line1, line2) {
    // Calculate if two lines intersect, return intersection point if any
    // Basic line intersection logic here
    // If they do intersect, return the latlng of the intersection
  }

  function handleLineIntersection() {
    lines.forEach((lineA, idxA) => {
      lines.slice(idxA + 1).forEach((lineB) => {
        const intersection = checkLineIntersection(lineA, lineB);
        if (intersection) {
          addCircle(intersection, 200); // Adjust radius as needed
        }
      });
    });
  }

  function handleClickEvent(e) {
    setClick({ winX: e.originalEvent.x, winY: e.originalEvent.y, mapLat: e.latlng.lat, mapLng: e.latlng.lng });
    setPopup(null);
  }
  function addArea() {
    setAreas([...areas, [...areaTmpLines, [[areaPrevClick.mapLat, areaPrevClick.mapLng], [areaFirstClick.mapLat, areaFirstClick.mapLng]]]]);
  }
  function addAreaLine(x, y, lat, lng) {
    // Check if this is the first click
    if (!areaFirstClick) {
      // Initialize first click (starting point)
      setAreaFirstClick({ winX: x, winY: y, mapLat: lat, mapLng: lng });
      setAreaPrevClick({ winX: x, winY: y, mapLat: lat, mapLng: lng });
    } else if (
        Math.sqrt(Math.pow(areaFirstClick.winX - x, 2) + Math.pow(areaFirstClick.winY - y, 2)) <= 7
    ) {
      // Complete the area if close enough to the starting point
      addArea();
      setAreaFirstClick(null);
      setAreaPrevClick(null);
      setAreaTmpLines([]);
    } else {
      // Add a temporary line from the previous click to the current click
      setAreaTmpLines([...areaTmpLines, [[areaPrevClick.mapLat, areaPrevClick.mapLng], [lat, lng]]]);
      setAreaPrevClick({ winX: x, winY: y, mapLat: lat, mapLng: lng });
    }
  }

  return (
      <MarkerContext.Provider
          value={{
            markers,
            addMarker,
            setMarkers,
            addSignalToDatabase,
            updateSignalInDatabase,
            deleteSignalInDatabase,
            lines,
            addLines,
            circles,
            addCircle,
            areas,
            addAreaLine,
            areaFirstClick,
            areaTmpLines,
            click,
            clickedMarker,
            popup,
            setClickedMarker,
            setPopup,
            setLines,
            handleClickEvent, // Provide click handler
            handleReplayClick // Provide replay click handler
          }}
      >
        {children}
      </MarkerContext.Provider>
  );
}

function CustomMarker({ marker }) {
  let icon;
  switch (marker.type) {
    case 'RFF':
      icon = rffIcon;
      break;
    case 'Signal':
      icon = signalIcon;
      break;
    case 'Boat':
      icon = boatIcon;
      break;
    default:
      icon = L.icon({ iconUrl: 'default-icon.png' });
  }

  const { handleClickEvent, setPopup, setClickedMarker } = useContext(MarkerContext);

  function onMarkerLeftClick(e) {
    handleClickEvent(e);
    setClickedMarker(marker);
  }

  function onMarkerRightClick(e) {
    handleClickEvent(e);
    setClickedMarker(marker);
    setPopup("contextmenu");
  }

  return (
      <LeafletMarker
          position={marker.latlng}
          icon={icon}
          eventHandlers={{
            click: onMarkerLeftClick,
            contextmenu: onMarkerRightClick
          }}
      >
        <Popup>
          {marker.description}
          <br />
          Ping Time: {marker.pingTime}
        </Popup>
      </LeafletMarker>
  );
}

function MapInteractions({ currentInteractionMode, setCursorPosition }) {
  const map = useMap();
  const { markers, addMarker, addSignalToDatabase, addLines, addCircle, addAreaLine, handleClickEvent } = useContext(MarkerContext);

  function findAllRFFMarkersWithinRadius(latlng, radius = Number.maxValue) { // will change later
    return markers.filter(marker => marker.type === 'RFF' && L.latLng(marker.latlng).distanceTo(latlng) <= radius);
  }

  function onMapMouseMove(e) {
    setCursorPosition(e.latlng);
  }

  function onMapLeftClick(e) {
    handleClickEvent(e);

    if (currentInteractionMode === "lines") {
      const nearbyRFFs = findAllRFFMarkersWithinRadius(e.latlng);
      const newLines = nearbyRFFs.map(rff => {
        const bearing = getBearing(rff.latlng.lat, rff.latlng.lng, e.latlng.lat, e.latlng.lng);
        const endPoint = calculateEndPoint(rff.latlng, bearing, 102186.9); // 20 miles in meters
        return {
          start: rff.latlng, end: endPoint, timestamp: new Date().getTime() // Add a timestamp for decay
        };
      });
      addLines(newLines);
    } else if (currentInteractionMode === 'circles') {
      addCircle(e.latlng, 200); // Replace 200 with the desired radius
    } else if (currentInteractionMode === 'RFF' || currentInteractionMode === 'Signal' || currentInteractionMode === 'Boat') {
      addMarker(e.latlng, currentInteractionMode, `${currentInteractionMode} Marker Description`);
      if (currentInteractionMode === 'Signal') {
        addSignalToDatabase(); // Call API when in Signal mode
      }
      // Switch back to dragging after placing an RFF marker
      if (currentInteractionMode === 'RFF') {
        handleInteractionModeChange('dragging');
      }
    } else if (currentInteractionMode === "area") {
      // Check if a new area is created, automatically switch to dragging if true
      if (addAreaLine(e.originalEvent.x, e.originalEvent.y, e.latlng.lat, e.latlng.lng)) {
        handleInteractionModeChange('dragging');
      };
    }
  }

  useMapEvents({
    mousemove: onMapMouseMove,
    click: onMapLeftClick,
  });

  return null;
}

function MyMap({ currentInteractionMode, visibility, setCursorPosition, addBookmark, bookmarkPosition, setBookmarkPosition, decayRate}) {
  const mapRef = useRef();
  decayRateGlobal = decayRate; // Update the global variable whenever `decayRate` changes
  const {
    markers,
    setMarkers, // Add setMarkers to destructure here
    lines,
    setLines,
    circles,
    updateSignalInDatabase,
    deleteSignalInDatabase,
    setClickedMarker,
    clickedMarker,
    click,
    popup,
    setPopup,
    areaFirstClick,
    areaTmpLines,
    areas,
    addLines
  } = useContext(MarkerContext);


  const position = [37.17952, -122.36]; // Initial map position

  const contextMenuData = [
    {
      name: "Inspect",
      action: () => setPopup("inspect"),
    },
    {
      name: "Edit",
      action: () => setPopup("edit"), // Can be expanded to show an edit form
    },
    {
      name: "Delete",
      action: () => {
        console.info(clickedMarker)
        if (clickedMarker && clickedMarker.id) {  // <-- Ensure that `clickedMarker.id` exists
          deleteSignalInDatabase(clickedMarker.id);
          setClickedMarker(null);
          setPopup(null);
        }
      },
    },
  ];

  useEffect(() => {
    if (bookmarkPosition && mapRef.current) {
      const mapInstance = mapRef.current;
      mapInstance.flyTo(bookmarkPosition, 9);
      setBookmarkPosition(null);
    }
  }, [bookmarkPosition]);


  useEffect(() => {
    if (decayRate > 0) {
      const intervalId = setInterval(() => {
        const currentTime = new Date().getTime();

        setLines(prev => prev.filter(line =>
            permanentLines.has(line.id) || (currentTime - line.timestamp <= decayRate)
        ));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [decayRate, permanentLines, setLines]);


  return (
      <>
        <MapContainer center={position} zoom={8} ref={mapRef} style={{ height: "100vh", width: "100vw" }}>
          <TileLayer
              attribution="<a href='http://www.esri.com/'>Esri</a>"
              url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"/>
          <MapInteractions currentInteractionMode={currentInteractionMode} setCursorPosition={setCursorPosition} />
          {markers.filter(marker => visibility[marker.type]).map((marker, index) => (
              <CustomMarker key={`${marker.type}-${marker.latlng.lat}-${marker.latlng.lng}-${index}`} marker={marker} />
          ))}
          {visibility.lines && lines.map((line, index) => (
              <Polyline
                  key={`line-${index}`}
                  positions={[line.start, line.end]}
                  color="red"
                  eventHandlers={{
                    contextmenu: () => {
                      setClickedMarker(line);
                      toggleLinePermanence(line.id)
                      setPopup("contextmenu");
                    }
                  }}
              />
          ))}
          {visibility.circles && circles.map((circle, index) => (
              <Circle key={`circle-${index}`} center={circle.center} radius={circle.radius} fillColor="blue" />
          ))}
          {visibility.areas && areaFirstClick !== null && (
              <CircleMarker
                  center={[areaFirstClick.mapLat, areaFirstClick.mapLng]}
                  pathOptions={{ color: 'yellow' }}
                  radius={7}
              />
          )}
          {visibility.areas && areaTmpLines.map((line, index) => (
              <Polyline key={`tmpLine-${index}`} pathOptions={{ color: 'yellow' }} positions={line} />
          ))}
          {visibility.areas && areas.map((area, index) => (
              <Polygon key={`area-${index}`} pathOptions={{ color: 'yellow' }} positions={area} />
          ))}
        </MapContainer>
        {popup === "inspect" && click && (
            <Inspect />
        )}
        {popup === "edit" && click && (
            <EditForm marker={clickedMarker} setPopup={setPopup} updateSignalInDatabase={updateSignalInDatabase} />
        )}
        {popup === "contextmenu" && click && (
            <MarkerContextMenu x={click.winX} y={click.winY} data={contextMenuData} />
        )}
      </>
  );
}

function Inspect() {
  const { click, setPopup } = useContext(MarkerContext);
  const buttonStyle = "bg-gray-200 border border-gray-400 rounded-md w-fit h-fit px-1 py-px";

  return (
      <div
          className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30"
          style={{ zIndex: 1000 }}
      >
        <div className="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600">
          <div className="flex flex-col gap-2">
            <div>
              <label>Title:</label>
              <input className="border rounded-md" />
            </div>
            <div>
              <label>Type:</label>
              <select className={buttonStyle}>
                <option>Sail Boat</option>
                <option>Cruise Ship</option>
                <option>Cargo Ship</option>
                <option>Oil Freighter</option>
              </select>
            </div>
            <div>
              <label>Lat:</label>
              <p>{click.mapLat}</p>
            </div>
            <div>
              <label>Lng:</label>
              <p>{click.mapLng}</p>
            </div>
            <label>Audio:</label>
            <button className={buttonStyle}>Playback Audio</button>
            <button className={buttonStyle}>Upload Audio</button>
          </div>
          <div className="flex w-full justify-center items-center">
            <button
                className={buttonStyle}
                onClick={() => setPopup(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
  );
}

const EditForm = ({ marker, updateSignalInDatabase, setPopup }) => {
  const [formData, setFormData] = useState({
    id : '',
    channel: '',
    starttime: '',
    fix: '',
    stoptime: '',
    bearing1: '',
    rff1: ''
  });

  useEffect(() => {
    if (marker) {
      setFormData({
        id : marker.id,
        channel: marker.channel,
        starttime: marker.starttime,
        stoptime: marker.stoptime || '',
        fix: marker.fix,
        bearing1: marker.bearing1,
        rff1: marker.rff1
      });
    }
  }, [marker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSignalInDatabase(formData);
      setPopup(null);  // Close the popup after saving
    } catch (error) {
      console.error('Error updating signal:', error);
    }
  };

  return (
      <div className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30" style={{ zIndex: 1000 }}>
        <div className="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600">
          <h3>Edit Signal Marker</h3>
          <form onSubmit={HandleSubmit} className="flex flex-col gap-4">
            <div>
              <label>RFF: </label>
              <p>{formData.id}</p>
            </div>

            <div>
              <label>RFF: </label>
              <p>{formData.rff1}</p>
            </div>
            <div>
              <label>Bearing: </label>
              <p>{formData.bearing1}</p>
            </div>
            <div>
              <label>Start time: </label>
              <p>{formData.starttime}</p>
            </div>
            <div>
              <label>Fix: </label>
              <p>{formData.fix}</p>
            </div>

            <div>
              <label>Channel</label>
              <input
                  type="text"
                  name="channel"
                  value={formData.channel}
                  onChange={handleInputChange}
                  className="border rounded-md p-1"
              />
            </div>
            <div>
              <label>Stop Time</label>
              <input
                  type="text"
                  name="stoptime"
                  value={formData.stoptime}
                  onChange={handleInputChange}
                  className="border rounded-md p-1"
              />
            </div>

            <div className="flex justify-between">
              <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                Save Changes
              </button>
              <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded-md"
                  onClick={() => setPopup(null)}  // Close the popup on cancel
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};


export { MyMap, MarkerProvider, MarkerContext, calculateEndPoint };
