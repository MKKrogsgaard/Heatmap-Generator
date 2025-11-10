/*
DESCRIPTION: Contains functions for parsing a raw .fit file and for extracting GPS points from its records
*/

// Imports
const FitParser = require('fit-file-parser').default || require('fit-file-parser');
const { timeStamp } = require('console');
const fs = require('fs');
const { type } = require('os');

function semicirclesToDeg(sc) {
    /**
     * Converts from semicircle coordinatres (the format used by .fit files) to degrees
     */
    return sc * (180.0 / 2.0**(31));
}
/**
 * Reads a .fit file and parses it to JSON
 * @param {string} filepath - Path to the .fit file 
 * @returns {Promise<object>} - Promise that resolves to a JSON representation of the .fit file
 */
function parseFitFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, content) => {
            if (err){
                return reject(err);
            }
            // Initialize a fitparser. Most of these options are the default choices, but this is for clarity
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
 * Takes in a raw parsed .fit file and returns an array containing all of the points in the GPS records of that file (i.e. a point-for-point record of the route the user took)
 * @param {<object>} data - A (raw) parsed .fit file, the object returned by the parseFitFile() parser
 * @returns {<Array>{lat:number, long:number, timestamp?:string, altitude?: number, heart_rate?:number}} - Array containing GPS points and some supplementary info
 */
function getGpsPoints(data) {
    /* 
    We the data we are interested in are located in 
    {data} -> {activity} -> [sessions] -> {ith session} -> [laps] -> {jth lap}

    The structure of the parsed data is confusing AF 
    TODO: Include some kind of illustration of the structure in the repo
    */
    const points = [];
    sessions = data.activity.sessions;

    // This is kind of ugly, maybe find some way to NOT make this a triple for loop? :P
    // Loop through the sessions, and the laps within each session, and extract the data we want
    for (const session of sessions) {
        const laps = session.laps;
        for (const lap of laps) {
            for (const record of lap.records) {
                if (typeof record.position_lat !== 'undefined' && typeof record.position_long !== 'undefined') { // Make sure the current record actually contains position data
                points.push({
                    lat: semicirclesToDeg(record.position_lat),
                    long: semicirclesToDeg(record.position_long),
                    timestamp: record.timeStamp || null,
                    altitude: record.altitude || null,
                    heart_rate: record.heart_rate || null
                });
            }
            }
        }
    }

    return points;
}

module.exports = {
    parseFitFile,
    getGpsPoints
}



