import React, { useContext } from 'react';
import { MarkerContext } from '../../context/MarkerContext.jsx';

function Inspect() {
    const { click, setPopup } = useContext(MarkerContext);

    return (
        <div className="modal">
            <h3>Inspect Marker</h3>
            <p>Latitude: {click.mapLat}</p>
            <p>Longitude: {click.mapLng}</p>
            <button onClick={() => setPopup(null)}>Close</button>
        </div>
    );
}

export default Inspect;
