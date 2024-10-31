export async function addSignalToDatabase(rff1 = "---", bearing1 = "---") {
    try {
        const response = await fetch('http://localhost:8000/caller/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: "16",
                bearing1,
                rff1,
                fix: "---",
                starttime: new Date().toISOString(),
                stoptime: "---",
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
