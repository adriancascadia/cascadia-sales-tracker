
import { geocodeAddress } from "../services/geocodingService";

async function runVerification() {
    console.log("Starting Geocoding Verification...");

    const testCases = [
        {
            name: "Full Address",
            address: "1600 Amphitheatre Parkway",
            city: "Mountain View",
            state: "CA",
            zip: "94043"
        },
        {
            name: "Missing Zip",
            address: "1600 Amphitheatre Parkway",
            city: "Mountain View",
            state: "CA",
            zip: undefined
        },
        {
            name: "Missing State and Zip",
            address: "1600 Amphitheatre Parkway",
            city: "Mountain View",
            state: undefined,
            zip: undefined
        },
        {
            name: "Only Address and City",
            address: "Empire State Building",
            city: "New York",
            state: undefined,
            zip: undefined
        },
        {
            name: "Only Address",
            address: "White House, Washington DC", // Nominatim is smart enough usually
            city: undefined,
            state: undefined,
            zip: undefined
        }
    ];

    for (const test of testCases) {
        console.log(`\nTesting: ${test.name}`);
        console.log(`Input: ${JSON.stringify(test)}`);
        try {
            const result = await geocodeAddress(test.address, test.city, test.state, test.zip);
            if (result) {
                console.log(`✅ Success: Lat: ${result.lat}, Lng: ${result.lng}`);
            } else {
                console.log(`❌ Failed: No result returned`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error}`);
        }
    }
}

runVerification();
