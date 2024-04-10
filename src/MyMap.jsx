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
import {BsBroadcast} from "react-icons/bs";
import MarkerContextMenu from "./MarkerContextMenu";


// Custom icon creation function
function createCustomIcon(icon) {
  const customMarkerHtml = renderToStaticMarkup(icon);
  return L.divIcon({
    html: customMarkerHtml,
    iconAnchor: [0,0],
    popupAnchor: [0,0],
    className: 'custom-icon'
  });
};

// Pre-defined icons using React Icons
const rffIcon = createCustomIcon(<FaBroadcastTower size={25} />);
const signalIcon = createCustomIcon(<BsBroadcast size={25} />);
const boatIcon = createCustomIcon(<RiShip2Line size={25} />);

const MarkerContext = createContext(null);
function MarkerProvider({ children }) {
  const [markers, setMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [circles, setCircles] = useState([]);

  // null indicates no click
  // { winX: number, winY: number, mapLat: number, mapLng: number}
  // indicates click with win and map location
  const [click, setClick] = useState(null);

  // Area creation states
  const [areaFirstClick, setAreaFirstClick] = useState(null);
  const [areaPrevClick, setAreaPrevClick] = useState(null);
  const [areaTmpLines, setAreaTmpLines] = useState([]);

  const [clickedMarker, setClickedMarker] = useState(null);

  const [popup, setPopup] = useState(null);

  function addMarker(latlng, type, description, audioFile = null) {
    const pingTime = new Date().toISOString();
    setMarkers([...markers, { latlng, type, description, audioFile, pingTime }]);
  };

  function deleteMarker(latlng) {
    setMarkers(markers.filter(x => x.latlng.lat !== latlng.lat || x.latlng.lng !== latlng.lng))
  };

  function addLine(start, end) {
    setLines([...lines, { start, end }]);
  };

  function addCircle(center, radius) {
    setCircles([...circles, { center, radius }]);
  };

  function addArea() {
    setAreas([...areas, [...areaTmpLines, [[areaPrevClick.mapLat, areaPrevClick.mapLng], [areaFirstClick.mapLat, areaFirstClick.mapLng]]]])
  };

  function addAreaLine(x, y, lat, lng) {
    if (areaFirstClick === null) {
      setAreaFirstClick({
        winX: x,
        winY: y,
        mapLat: lat,
        mapLng: lng,
      });
      setAreaPrevClick({
        winX: x,
        winY: y,
        mapLat: lat,
        mapLng: lng,
      });
    }
    else if (Math.sqrt(Math.pow(areaFirstClick.winX - x, 2) + (areaFirstClick.winY - y, 2)) <= 7) {
      addArea();
      setAreaFirstClick(null);
      setAreaPrevClick(null);
      setAreaTmpLines([]);
    }
    else {
      setAreaTmpLines([...areaTmpLines,
        [[areaPrevClick.mapLat, areaPrevClick.mapLng], [lat, lng]]]);
      setAreaPrevClick({
        winX: x,
        winY: y,
        mapLat: lat,
        mapLng: lng,
      });
    }
  };

  function clickEvent(e) {
    setClick({
      winX: e.originalEvent.x,
      winY: e.originalEvent.y,
      mapLat: e.latlng.lat,
      mapLng: e.latlng.lng
    });
    setPopup(null);
  };

  function updateClickedMarker(latlng) {
    if (latlng === null) {
      setClickedMarker(null);
    }
    else {
      const m = markers.filter(x => x.latlng.lat === latlng.lat || x.latlng.lng === latlng.lng);
      setClickedMarker(m.length > 0 ? m[0] : null);
    }
  };

  const displayPopup = setPopup;

  return (
    <MarkerContext.Provider
      value={{
        markers,
        addMarker,
        deleteMarker,
        lines,
        addLine,
        circles,
        addCircle,
        areas,
        addAreaLine,
        areaFirstClick,
        areaTmpLines,
        click,
        clickedMarker,
        updateClickedMarker,
        popup,
        displayPopup,
        clickEvent,
      }}>
      {children}
    </MarkerContext.Provider>
  );
};

function CustomMarker({marker}) {
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
    icon = L.icon({ iconUrl: 'default-icon.png' }); // Default case
  }

  const {
    clickEvent,
    updateClickedMarker,
    displayPopup,
  } = useContext(MarkerContext);

  function onMarkerLeftClick(e) {
    clickEvent(e);
    updateClickedMarker(e.latlng)
  };

  function onMarkerRightClick(e) {
    clickEvent(e);
    updateClickedMarker(e.latlng)
    displayPopup("contextmenu");
  };

  return (
    <LeafletMarker
      position={marker.latlng}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          onMarkerLeftClick(e);
        },
        contextmenu: (e) => {
          onMarkerRightClick(e);
        }
      }}
    >
      <Popup>
        {marker.description}
        <br />
        Ping Time: {marker.pingTime}
      </Popup>
    </LeafletMarker>
  );
};

function MapInteractions({ currentInteractionMode, setCursorPosition }) {
  const map = useMap();
  const {
    markers,
    addMarker,
    addLine,
    addCircle,
    addAreaLine,
    clickEvent,
  } = useContext(MarkerContext);

  // Function to find the nearest RFF marker
  function findNearestRFFMarker(latlng) {
    let nearestMarker = null;
    let nearestDistance = Infinity;

    markers.forEach((marker) => {
      if (marker.type === 'RFF') {
        const distance = map.distance(latlng, marker.latlng);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestMarker = marker;
        }
      }
    });

    return nearestMarker ? nearestMarker.latlng : null;
  };

  function onMapMouseMove(e) {
    setCursorPosition(e.latlng);
  };

  function onMapLeftClick(e) {
    clickEvent(e);

    if (currentInteractionMode === "dragging") {

    }

    else if (currentInteractionMode === 'lines') {
      // On click, find the nearest RFF marker and draw a line to it
      const nearestRFF = findNearestRFFMarker(e.latlng);
      if (nearestRFF) {
        addLine(e.latlng, nearestRFF);
      }
    }

    else if (currentInteractionMode === 'circles') {
      addCircle(e.latlng, 200); // Replace 200 with the desired radius
    }

      // Markers
    else if (currentInteractionMode === 'RFF'
      || currentInteractionMode === 'Signal'
      || currentInteractionMode === 'Boat') {
        addMarker(e.latlng, currentInteractionMode, `${currentInteractionMode} Marker Description`);
      }

    else if (currentInteractionMode === "area") {
      addAreaLine(e.originalEvent.x, e.originalEvent.y, e.latlng.lat, e.latlng.lng);
    }
  };

  function onMapRightClick(e) {
    clickEvent(e);
  };

  useEffect(() => {
    // Enable or disable map dragging based on the current interaction mode
    if (currentInteractionMode === 'dragging') {
      map.dragging.enable();
    } else {
      map.dragging.disable();
    }
  }, [currentInteractionMode, map]);

  useMapEvents({
    mousemove: (e) => {
      onMapMouseMove(e);
    },
    click(e) {
      onMapLeftClick(e);
    },
    contextmenu(e) {
      onMapRightClick(e);
    },
  });

  return null;
};

function Inspect() {
  const {
    click,
    displayPopup,
  } = useContext(MarkerContext);

  const buttonStyle = "bg-gray-200 border border-gray-400 rounded-md w-fit h-fit px-1 py-px";
  // For absolutely zero reason, leaflet assumes a z-index of 399.
  // And the zoom buttons have a z-index of 999.
  // We set to 1000 to get above all of that.
  return (
    <div
      className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-30"
      style={{ zIndex: 1000 }}
    >
      <div
        className="flex flex-col justify-between bg-white p-10 w-1/3 h-1/2 rounded-md border shadow shadow-gray-600"
      >
        <div className="flex flex-col gap-2">
          <div>
            <label>Title:</label>
            <input className="border rounded-md"/>
          </div>
          <div>
            <label>Type:</label>
            <select className={buttonStyle}>
              <option></option>
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
            onClick={e => displayPopup(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
};

function MyMap({
  currentInteractionMode,
  visibility,
  setCursorPosition,
  addBookmark,
  bookmarkPosition,
  setBookmarkPosition,
}) {
  const mapRef = useRef(); // Create a ref for the map

  const {
    markers,
    lines,
    circles,
    deleteMarker,
    clickedMarker,
    updateClickedMarker,
    click,
    popup,
    displayPopup,
    areaFirstClick,
    areaTmpLines,
    areas,
  } = useContext(MarkerContext);

  const position = [37.17952, -122.36]; // Initial map position

  const contextMenuData = [
    {
      name: "Inspect",
      action: () => displayPopup("inspect"),
    },
    {
      name: "Add to bookmarks",
      action: () => {
        addBookmark(clickedMarker);
        displayPopup(null);
      },
    },
    {
      name: "Delete",
      action: () => {
        deleteMarker(clickedMarker.latlng);
        updateClickedMarker(null);
        displayPopup(null);
      },
    },
  ];

  // TODO move into MapInteractions
  useEffect(() => {
    // This effect will run when the mapRef is set (after the MapContainer has mounted)
    if (mapRef.current) {
      const mapInstance = mapRef.current;

      const handleMouseMove = (event) => {
        setCursorPosition(event.latlng);
      };

      // Listen for mouse move events
      mapInstance.on('mousemove', handleMouseMove);

      // Cleanup function to run when the component unmounts
      return () => {
        mapInstance.off('mousemove', handleMouseMove);
      };
    }
  }, [setCursorPosition]);

  // TODO move in MapInteractions
  // If bookmark position is set, fly to that position
  useEffect(() => {
    if (bookmarkPosition && mapRef.current) {
      const mapInstance = mapRef.current;
      mapInstance.flyTo(bookmarkPosition, 9);

      // Update the bookmark position state after flying to the location (thank you andy)
      setBookmarkPosition(null);

    }
  }, [bookmarkPosition]);

  return (
    <>
      <MapContainer
        center={position}
        zoom={8}
        ref={mapRef}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInteractions
          currentInteractionMode={currentInteractionMode}
          setCursorPosition={setCursorPosition}
        />
        {markers.filter(marker => visibility[marker.type]).map((marker, index) => (
          <CustomMarker
            marker={marker}
          />
        ))}

        {visibility.lines && lines.map((line, index) => (
          <Polyline
            key={`line-${index}`}
            positions={[line.start, line.end]}
            color="red"
          />
        ))}

        {visibility.circles && circles.map((circle, index) => (
          <Circle
            key={`circle-${index}`}
            center={circle.center}
            radius={circle.radius}
            fillColor="blue"
          />
        ))}

        {
          visibility.areas &&
            areaFirstClick !== null &&
            <CircleMarker
              center={[areaFirstClick.mapLat, areaFirstClick.mapLng]}
              pathOptions={{ color: 'yellow' }}
              radius={7}
            />
        }
        {
          visibility.areas &&
            areaTmpLines.map(line => (
              <Polyline
                pathOptions={{ color: 'yellow' }}
                positions={line}
              />
            ))
        }
        {
          visibility.areas &&
            areas.map(area =>
              <Polygon
                pathOptions={{ color: 'yellow' }}
                positions={area}
              />
            )
        }
      </MapContainer>
      {
        popup === "inspect" ?
          <Inspect/>
          : popup === "contextmenu" && click !== null &&
            <MarkerContextMenu
              x={click.winX}
              y={click.winY}
              data={contextMenuData}
            />
      }
    </>
  );
};

export { MyMap, MarkerProvider };
