import GPX from 'gpx-parser-builder';
import fs from 'fs';

/**
 * Reads a GPX file and parses it to
 * @param {string} filepath Path to the GPX file
 * @returns {Promise<object>} Promise that resolves to the (raw) parsed GPX file
 */
function parseGpxFile(filepath) {
    console.log('Currently parsing ' + filepath);
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, content) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            // Parse the file and return it
            try {
                let parsedGpx = GPX.parse(content.toString());
                console.log(parsedGpx);
                return resolve(parsedGpx);
            } catch (err) {
                console.error(err);
                return reject(err);
            }
        });
    });
}

export {
    parseGpxFile
}


