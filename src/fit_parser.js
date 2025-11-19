/*
DESCRIPTION: Contains functions for parsing a raw .fit file and for extracting GPS points from its records
*/

// Imports
const FitParser = require('fit-file-parser').default || require('fit-file-parser');
const fs = require('fs');

/**
 * Reads a FIT file and parses it
 * @param {string} filepath Path to the FIT file 
 * @returns {Promise<object>} Promise that resolves to the (raw) parsed FIT file
 */
function parseFitFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, content) => {
            if (err){
                return reject(err);
            }

            let fitParser = new FitParser({
                mode: 'cascade',
                lengthUnit: 'm',
                temperatureUnit: 'celsius',
                speedUnit: 'm/s',
                force: true,
                elapsedRecordField: true
            });

            // Parse the file
            fitParser.parse(content, (err, data) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(data); // Return parsed data
                }
            });
        });
    });
}
/**
 * Takes in a raw parsed FIT file and returns an array containing all of the points in the GPS records of that file (i.e. a point-for-point record of the route the user took)
 * @param {object} data A (raw) parsed FIT file produced by parseFitFile()
 * @returns {Array{lat:number, long:number, timestamp?:string, altitude?: number}} Array containing GPS points
 */
function getFitPoints(data) {
    /* 
    The gps points we are interested in are located in 
    {data} -> {activity} -> [sessions] -> {session} -> [laps] -> {lap} -> [records] -> {record}

    The structure of the parsed data is confusing AF 
    TODO: Include some kind of illustration of the structure in the repo?
    */
    const points = [];
    sessions = data.activity.sessions;

    // This is kind of ugly, maybe find some way to not make this a triple for loop? :P
    // Loop through the sessions, and the laps within each session, and extract the data we want
    for (const session of sessions) {
        const laps = session.laps;
        for (const lap of laps) {
            records = lap.records;
            for (const record of records) {
                if (typeof record.position_lat !== 'undefined' && typeof record.position_long !== 'undefined') { // Make sure the current record actually contains position data
                    points.push({
                        lat: record.position_lat,
                        long: record.position_long,
                        altitude: record.altitude || null
                    });
                } else {
                    console.warn("A FIT record had undefined position values!");
                }
            }
        }
    }

    return points;
}

module.exports = {
    parseFitFile,
    getFitPoints
}



