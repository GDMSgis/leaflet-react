// App.js
import React, { useState } from 'react';
import MyMap from './MyMap';

function App() {
    const [mode, setMode] = useState('dragging'); // default mode to 'dragging'
    const [visibility, setVisibility] = useState({
        markers: true,
        lines: true,
        circles: true,
    });

    const buttonStyle = "rounded-md bg-gray-200 border border-black hover:bg-blue-200 m-2";

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode !== 'all') {
            setVisibility({ ...visibility, [newMode]: true });
        } else {
            setVisibility({ markers: true, lines: true, circles: true });
        }
    };

    const toggleVisibility = (type) => {
        setVisibility({ ...visibility, [type]: !visibility[type] });
    };

    return (
        <div className="flex flex-row">
            <div className="flex flex-col w-96 h-full gap-2 py-4 px-4">
                <button
                    className={`${buttonStyle} ${mode === 'dragging' ? "bg-yellow-200" : ""}`}
                    onClick={() => handleModeChange('dragging')}
                >
                    Dragging
                </button>
                <button
                    className={`${buttonStyle} ${mode === 'markers' ? "bg-yellow-200" : ""}`}
                    onClick={() => handleModeChange('markers')}
                >
                    Markers
                </button>
                <button
                    className={`${buttonStyle} ${mode === 'lines' ? "bg-yellow-200" : ""}`}
                    onClick={() => handleModeChange('lines')}
                >
                    Lines
                </button>
                <button
                    className={`${buttonStyle} ${mode === 'circles' ? "bg-yellow-200" : ""}`}
                    onClick={() => handleModeChange('circles')}
                >
                    Circles
                </button>

                <button
                    className={`${buttonStyle} ${!visibility.markers ? "bg-red-200" : ""}`}
                    onClick={() => toggleVisibility('markers')}
                >
                    Toggle Markers Visibility
                </button>
                <button
                    className={`${buttonStyle} ${!visibility.lines ? "bg-red-200" : ""}`}
                    onClick={() => toggleVisibility('lines')}
                >
                    Toggle Lines Visibility
                </button>
                <button
                    className={`${buttonStyle} ${!visibility.circles ? "bg-red-200" : ""}`}
                    onClick={() => toggleVisibility('circles')}
                >
                    Toggle Circles Visibility
                </button>
                <button
                    className={`${buttonStyle} ${mode === 'all' ? "bg-yellow-200" : ""}`}
                    onClick={() => handleModeChange('all')}
                >
                    Show All
                </button>
            </div>
            <MyMap
                mode={mode}
                showMarkers={visibility.markers}
                showLines={visibility.lines}
                showCircles={visibility.circles}
            />
        </div>
    );
}

export default App;
