import React, { useState, useContext, createContext, useEffect } from 'react';
import MyMap from './components/Map/MyMap';
import { MarkerProvider, MarkerContext } from './context/MarkerContext.jsx';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import Drawer from './components/UI/Minivariantdrawer';
import { FaMapMarkedAlt } from "react-icons/fa";
import BottomTab from './components/UI/BottomTab.jsx';

export const AppContext = createContext();

function getIcon(type) {
  switch (type) {
    case 'RFF':
      return <FaBroadcastTower size={18} />;
    case 'Signal':
      return <BsBroadcast size={18} />;
    case 'Boat':
      return <RiShip2Line size={18} />;
    default:
      return null;
  }
};


function App() {
  const { handleReplayClick, setPauseReplay, replay, pauseReplay, setReplay, markers } = useContext(MarkerContext);
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
    Placemark: true
  });
  const [decayRate, setDecayRate] = useState(30000);

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
    <AppContext.Provider value={{ handleInteractionModeChange, toggleVisibility, visibility, bookmarks, setBookmarkPosition }}>
      <MarkerProvider>
        <div>


          <MyMap
            currentInteractionMode={currentInteractionMode}
            visibility={visibility}
            setCursorPosition={setCursorPosition}
            addBookmark={addBookmark}
            bookmarkPosition={bookmarkPosition}
            setBookmarkPosition={setBookmarkPosition}
            decayRate={decayRate}
          />

          <Drawer></Drawer>

          <BottomTab lat={cursorPosition.lat} lng={cursorPosition.lng}></BottomTab>

        </div>
      </MarkerProvider>
    </AppContext.Provider>
  );
}

export default App;
