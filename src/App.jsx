// App.jsx
import React, { useState } from 'react';
import MyMap from './MyMap';

function App() {
    const buttonStyle = "rounded-md bg-gray-200 border border-black hover:bg-blue-200";

    const [mode, setMode] = useState('markers');
    const [markers, setMarkers] = useState([]);
    const [lines, setLines] = useState([]);
    const [circles, setCircles] = useState([]);

    const addMarker = (latlng) => {
        setMarkers([...markers, latlng]);
    };

    const addLine = (line) => {
        setLines([...lines, line]);
    };

    const addCircle = (circle) => {
        setCircles([...circles, circle]);
    };

    return (
        <div className="App">
                <div className="flex flex-col w-96 h-full gap-2 py-4 px-4">
                    <button className={ buttonStyle + (mode === "dragging" ? " bg-yellow-200" : "")}
                            onClick={() => setMode("dragging")}>
                        Dragging
                    </button>
                    <button className={buttonStyle + (mode === "markers" ? " bg-yellow-200" : "")}
                            onClick={() => setMode("markers")}>
                        Markers
                    </button>
                    <button className={buttonStyle + (mode === "lines" ? " bg-yellow-200" : "")}
                            onClick={() => setMode("lines")}
                    >
                        Lines
                    </button>
                    <button className={buttonStyle + (mode === "circles" ? " bg-yellow-200" : "")}
                            onClick={() => setMode("circles")}
                    >
                        Circles
                    </button>
                </div>
            <MyMap
                mode={mode}
                markers={markers}
                lines={lines}
                circles={circles}
                addMarker={addMarker}
                addLine={addLine}
                addCircle={addCircle}
            />
        </div>
    );
}

export default App;
