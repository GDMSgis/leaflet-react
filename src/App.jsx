import React, { useState } from 'react';
import {MyMap, MarkerProvider} from './MyMap';
import Button from '@mui/material/Button';
import { BsBroadcast } from "react-icons/bs";
import { RiShip2Line, RiDraggable, RiFilterFill, RiFilterOffLine } from "react-icons/ri";
import { FaBroadcastTower } from "react-icons/fa";
import { TbChartCircles } from "react-icons/tb";
import { TfiLayoutLineSolid } from "react-icons/tfi";

function App() {
    const [currentInteractionMode, setCurrentInteractionMode] = useState('dragging');
    const [visibility, setVisibility] = useState({
        RFF: true,
        Signal: true,
        Boat: true,
        lines: true,
        circles: true,
    });

    const handleInteractionModeChange = (mode) => {
        setCurrentInteractionMode(mode);
    };

    const toggleVisibility = (type) => {
        setVisibility(prevVisibility => ({
            ...prevVisibility,
            [type]: !prevVisibility[type]
        }));
    };

    return (
        <div className="flex flex-row" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="flex flex-col w-96 h-full gap-2 py-4 px-4" style={{ backgroundColor: '#f5f5f5' }}> {/* soft grey background */}                <Button variant="contained" color={currentInteractionMode === 'dragging' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('dragging')}>
                    <RiDraggable /> Dragging
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'RFF' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('RFF')}>
                    <FaBroadcastTower /> Add RFF Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'Signal' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('Signal')}>
                    <BsBroadcast /> Add Signal Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'Boat' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('Boat')}>
                    <RiShip2Line /> Add Boat Marker
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'lines' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('lines')}>
                    <TfiLayoutLineSolid /> Lines
                </Button>
                <Button variant="contained" color={currentInteractionMode === 'circles' ? "primary" : "secondary"} onClick={() => handleInteractionModeChange('circles')}>
                    <TbChartCircles /> Circles
                </Button>

                {/* Visibility Toggle Buttons */}
                <Button variant="outlined" color={!visibility.RFF ? "error" : "success"} onClick={() => toggleVisibility('RFF')}>
                    {!visibility.RFF ? <RiFilterOffLine /> : <RiFilterFill />} RFF Visibility
                </Button>
                <Button variant="outlined" color={!visibility.Signal ? "error" : "success"} onClick={() => toggleVisibility('Signal')}>
                    {!visibility.Signal ? <RiFilterOffLine /> : <RiFilterFill />} Signal Visibility
                </Button>
                <Button variant="outlined" color={!visibility.Boat ? "error" : "success"} onClick={() => toggleVisibility('Boat')}>
                    {!visibility.Boat ? <RiFilterOffLine /> : <RiFilterFill />} Boat Visibility
                </Button>
                <Button variant="outlined" color={!visibility.lines ? "error" : "success"} onClick={() => toggleVisibility('lines')}>
                    {!visibility.lines ? <RiFilterOffLine /> : <RiFilterFill />} Lines Visibility
                </Button>
                <Button variant="outlined" color={!visibility.circles ? "error" : "success"} onClick={() => toggleVisibility('circles')}>
                    {!visibility.circles ? <RiFilterOffLine /> : <RiFilterFill />} Circles Visibility
                </Button>
            </div>
            <MarkerProvider>
                <MyMap
                    currentInteractionMode={currentInteractionMode}
                    visibility={visibility}
                />
            </MarkerProvider>
        </div>
    );
}

export default App;
