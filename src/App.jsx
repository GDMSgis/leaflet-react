import React, { useState, useContext } from 'react';
import MyMap from './components/Map/MyMap';
import { MarkerProvider, MarkerContext } from './context/MarkerContext.jsx';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { FaBookBookmark } from "react-icons/fa6";

function App() {
  const { handleReplayClick, setPauseReplay, replay, pauseReplay, setReplay } = useContext(MarkerContext);

  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkPosition, setBookmarkPosition] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ lat: 0, lng: 0 });
  const [currentInteractionMode, setCurrentInteractionMode] = useState('dragging');
  const [visibility, setVisibility] = useState({
    RFF: true,
    Signal: true,
    Boat: true,
    lines: true,
    circles: true,
    areas: true,
  });
  const [decayRate, setDecayRate] = useState(30000);

  function BookmarkList({ bookmarks }) {
    return (
        <div>
          <div className="flex items-center gap-5 font-bold text-2xl p-1 mb-0 ml-5 underline">
            <div>Bookmarks</div>
            <FaBookBookmark size={34}/>
          </div>
          <div className="overflow-scroll h-80">
            {bookmarks.map((bookmark, index) => (
                <div className="mb-2 relative" key={index}>
                  <Button className="w-full bg-black bg-opacity-75 text-white p-2 rounded-2xl" variant="contained" color="primary" onClick={() => setBookmarkPosition(bookmark.latlng)}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-6 font-bold text-xl p-1 ml-6">
                        {getIcon(bookmark.type)}
                        <h3 className="text-xl font-bold">{bookmark.type}</h3>
                      </div>
                      <p className="text-sm m-0">{bookmark.description}</p>
                      <div className="text-xs text-white">
                        <span>Lat: {bookmark.latlng.lat.toFixed(2)}</span>
                        <span className='font-bold mx-1'> | </span>
                        <span>Lng: {bookmark.latlng.lng.toFixed(2)}</span>
                      </div>
                    </div>
                  </Button>
                </div>
            ))}
          </div>
        </div>
    );
  }

  function getIcon(type) {
    switch(type) {
      case 'RFF': return <FaBroadcastTower size={18} />;
      case 'Signal': return <BsBroadcast size={18} />;
      case 'Boat': return <RiShip2Line size={18} />;
      default: return null;
    }
  }

  function addBookmark(marker) {
    setBookmarks((prevBookmarks) => [...prevBookmarks, marker]);
  }

  function handleInteractionModeChange(mode) {
    setCurrentInteractionMode(mode);
  }

  function toggleVisibility(type) {
    setVisibility(prevVisibility => ({
      ...prevVisibility,
      [type]: !prevVisibility[type],
    }));
  }

  function ModeButton({ mode, children }) {
    return (
        <Button
            variant="contained"
            color={currentInteractionMode === mode ? "primary" : "secondary"}
            onClick={() => handleInteractionModeChange(mode)}
        >
          {children}
        </Button>
    );
  }

  function VisibilityButton({ layer, children }) {
    return (
        <Button
            variant="outlined"
            color={!visibility[layer] ? "error" : "success"}
            onClick={() => toggleVisibility(layer)}
        >
          {!visibility[layer] ? <RiFilterOffLine /> : <RiFilterFill />}
          {children}
        </Button>
    );
  }

  return (
      <MarkerProvider>
        <div className="flex flex-row bg-gray-300">
          <div className="flex flex-col w-96 h-full max-h-screen gap-2 py-4 px-4 bg-gray-300">
            <ModeButton mode="dragging">
              <RiDraggable /> Dragging
            </ModeButton>
            <ModeButton mode="RFF">
              <FaBroadcastTower /> Add RFF Marker
            </ModeButton>
            <ModeButton mode="Signal">
              <BsBroadcast /> Add Signal Marker
            </ModeButton>
            <ModeButton mode="area">
              <TfiLayoutLineSolid /> Area
            </ModeButton>
            <VisibilityButton layer="RFF">RFF Visibility</VisibilityButton>
            <VisibilityButton layer="Signal">Signal Visibility</VisibilityButton>
            <VisibilityButton layer="Boat">Boat Visibility</VisibilityButton>
            <VisibilityButton layer="lines">Lines Visibility</VisibilityButton>
            <VisibilityButton layer="areas">Areas Visibility</VisibilityButton>
            <VisibilityButton layer="circles">Circles Visibility</VisibilityButton>

            <div className="my-4">
              <label className="block font-bold mb-2">Set Decay Rate (ms):</label>
              <input
                  type="number"
                  value={decayRate}
                  onChange={(e) => setDecayRate(parseInt(e.target.value, 10))}
                  className="border rounded p-2 w-full"
                  min="1000"
              />
            </div>

            <Button
                variant="contained"
                color="primary"
                onClick={handleReplayClick}
                className="mb-4"
            >
              Replay All Lines
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => setPauseReplay(!pauseReplay)}
                disabled={!replay}
            >
              {pauseReplay ? "Resume Replay" : "Pause Replay"}
            </Button>
            <Button
                variant="contained"
                color="error"
                onClick={() => setReplay(false)}
                disabled={!replay}
            >
              Stop Replay
            </Button>

            <BookmarkList bookmarks={bookmarks} />
          </div>

          <MyMap
              currentInteractionMode={currentInteractionMode}
              visibility={visibility}
              setCursorPosition={setCursorPosition}
              addBookmark={addBookmark}
              bookmarkPosition={bookmarkPosition}
              setBookmarkPosition={setBookmarkPosition}
              decayRate={decayRate}
          />

          <div className="absolute top-5 left-1/2 bg-black bg-opacity-75 text-white font-bold shadow shadow-gray-600 text-xl px-4 py-2 rounded-lg text-center"
               style={{ zIndex: 1000 }}
          >
            <div className="flex justify-between">
              <p>Lat:</p>
              <p>{cursorPosition.lat.toFixed(5)}</p>
            </div>
            <div className="flex justify-between">
              <p>Lon:</p>
              <p>{cursorPosition.lng.toFixed(5)}</p>
            </div>
          </div>
        </div>
      </MarkerProvider>
  );
}

export default App;
