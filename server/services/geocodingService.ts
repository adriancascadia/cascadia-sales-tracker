export async function geocodeAddress(address?: string, city?: string, state?: string, zip?: string): Promise<{ lat: number, lng: number } | null> {
    const parts = [address, city, state, zip].filter(p => p && p.trim().length > 0);

    if (parts.length === 0) return null;

    const fullAddress = parts.join(", ") + ", USA";
    const encodedAddress = encodeURIComponent(fullAddress);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'SalesForce-Tracker-App'
                }
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.error(`Failed to geocode: ${fullAddress}`, error);
    }

    return null;
}
