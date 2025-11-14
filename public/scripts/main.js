/**
 * Extends this Array with other_array in-place by pushing each element of other_array to this Array.
 * @param {<Array>} other_array - The array with which to extend this array
 * @example
 * // a, b, c and d can be any objects
 * arr1 = [a, b];
 * arr2 = [c, d];
 * arr1.extend(arr2) // = [a, b, c, d]
 */
Array.prototype.extend = function extend(other_array) {
    // Check if other_array is an array
    if (!Array.isArray(other_array)){
        console.warn(`Failed to extend [${this}] - other object is not an Array!`);
        return
    }
    other_array.forEach(element => {
        this.push(element);
    });
}

// OSM tile usage compliance
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_TILE_ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Global reference to map and heatmap
let leafletMap = null;
let heatLayer = null;

function submitFiles(input) {
    /**
     * Accepts either a filelist or an <input> element with a .files attribute.
     */

    // files will be a list of files
    let files;
    if (input instanceof FileList) { // If the input is a file list (from dragging and dropping)
        files = input;
    }
    else if (input instanceof File) { // If the input is a single file
        files = [input];
    }
    else if (input && input.files && input.files instanceof FileList) { // If the input exists and has the .files attribute, and this is a filelist (happens if the input is a <input type='file'> element)
        files = input.files;
    }
    else {
        console.error('submitFiles: No files found in argument', input);
    }

    // Append files to FormData object in order to pass it to Multer
    const formData = new FormData();
    for(let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    // Send the files to the server
    fetch('uploads', {
        method: 'POST',
        body: formData
    })
    .then((result) => result.json()) // The server sent back a JSON of the parsed data and the points, read it
    .then(json => {
        // Grab the results
        parseResults = json.parseResults;
        console.log('Results after parsing: ', parseResults);

        // Validate points before trying to make a heatmap
        const validPoints = []; // Will be [[lat, long, intensity], ...]
        const invalidPoints = [];
        parseResults.forEach(result => {
            for (const point of result.points) {
                // Check if the coords are finite, and if they are valid latitudes/longtitudes
                if ((Number.isFinite(point.lat) && Number.isFinite(point.long)) &&
                    (point.lat >= -90 && point.lat <= 90) && (point.long >= -180 && point.long <= 180)) {
                        validPoints.extend([[point.lat, point.long, 1]]);
                } else {
                    invalidPoints.extend([[point.lat, point.long, 1]]);
                }
            }
        });
        // For debugging
        percentage_valid = validPoints.length / (validPoints.length + invalidPoints.length) * 100
        console.log(`Number of valid points: ${validPoints.length} (${percentage_valid}%)`);

        // Make the heatmap with the valid points
        makeHeatMap(validPoints);

        // Get rid of the loader
        $('#loader').addClass('hide');
        $('#content').addClass('show');
    });
}

/**
 * Takes in GPS points and makes a heatmap
 * @param {<Array>} points - An array of [lat, long, intensity] points for the heatmap
 */
function makeHeatMap(points) {
    // Remove the text behind the map
    document.getElementById('map').innerHTML = "";

    if (!Array.isArray(points) || points.length == 0) {
        console.error('makeHeatMap: No points provided, or points not an Array!');
    }

    // Remove the existing map, if present
    if (leafletMap != null) {  
        try {
            leafletMap.remove();
        } catch (err) {
            console.error(err);
        }
    }

    // Initialize map centered on a random point from the data
    initial_center = points[Math.floor(Math.random()*points.length)];
    console.log('Initial map center: ', [initial_center[0], initial_center[1]]);

    leafletMap = L.map('map', {
        center: [initial_center[0], initial_center[1]],
        zoom: 11
    });

    L.tileLayer(OSM_TILE_URL, {
        maxZoom: 19,
        attribution: OSM_TILE_ATTRIBUTION
    }).addTo(leafletMap);
    console.log('Leaflet map initialized!');

    // Add heatmap layer
    heatLayer = L.heatLayer(points, {
        radius: 5,
        blur: 5
    }).addTo(leafletMap);
    console.log('Heatmap drawn!');
}