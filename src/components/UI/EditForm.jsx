import React, { useEffect, useState } from 'react';

function EditForm({ marker, updateSignalInDatabase, setPopup }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (marker) {
            setFormData({
                id: marker.id,
                channel: marker.channel || '',
                starttime: marker.starttime || '',
                stoptime: marker.stoptime || '',
                fix: marker.fix || '',
                bearing1: marker.bearing1 || '',
                rff1: marker.rff1 || ''
            });
        }
    }, [marker]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSignalInDatabase(formData);
        setPopup(null);
    };

    return (
        <div className="modal">
            <form onSubmit={handleSubmit}>
                {/* form fields for each editable property */}
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setPopup(null)}>Cancel</button>
            </form>
        </div>
    );
}

export default EditForm;
