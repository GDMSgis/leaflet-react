import React, { useState, useContext, createContext, useEffect } from 'react';
import MyMap from './components/Map/MyMap';
import { MarkerProvider } from './context/MarkerContext.jsx';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import Drawer from './components/UI/Minivariantdrawer';
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
}

function App() {
  const [cursorPosition, setCursorPosition] = useState({ lat: 0, lng: 0 });
  const [currentInteractionMode, setCurrentInteractionMode] = useState('dragging');
  const [visibility, setVisibility] = useState({
    RFF: true,
    Signal: true,
    Boat: true,
    lines: true,
    circles: true,
    areas: true,
    Placemark: true,
  });
  const [decayRate, setDecayRate] = useState(15000);
  const [replay, setReplay] = useState(false);
  const [pauseReplay, setPauseReplay] = useState(false);

  function handleInteractionModeChange(mode) {
    setCurrentInteractionMode(mode);
  }

  function toggleVisibility(type) {
    setVisibility(prevVisibility => ({
      ...prevVisibility,
      [type]: !prevVisibility[type],
    }));
  }

  return (
      <AppContext.Provider value={{
        handleInteractionModeChange,
        toggleVisibility,
        visibility,
        decayRate,
        setDecayRate,
        replay,
        setReplay,
        pauseReplay,
        setPauseReplay,
      }}>
        <MarkerProvider>
          <div>
            <MyMap
                currentInteractionMode={currentInteractionMode}
                visibility={visibility}
                setCursorPosition={setCursorPosition}
                decayRate={decayRate}
            />
            <Drawer />
            <BottomTab lat={cursorPosition.lat} lng={cursorPosition.lng} />
          </div>
        </MarkerProvider>
      </AppContext.Provider>
  );
}

export default App;
