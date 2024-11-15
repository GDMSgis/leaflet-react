export async function addSignalToDatabase({ name = "caller1", starttime, stoptime, fix = "---", receivers = [] }) {
    try {
        const response = await fetch('http://localhost:8000/caller/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                channel: "16",
                starttime,
                stoptime,
                fix,
                receivers, // structured as an array of { RFF, bearing }
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating signal marker:', error);
    }
}

export async function updateSignalInDatabase(updatedData) {
    const { id, ...data } = updatedData;
    try {
        const response = await fetch(`http://localhost:8000/caller/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating signal marker:', error);
    }
}

export async function deleteSignalInDatabase(id) {
    try {
        await fetch(`http://localhost:8000/caller/${id}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Error deleting signal marker:', error);
    }
}
