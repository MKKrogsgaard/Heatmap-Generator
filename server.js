/*
DESCRIPTION: This file is the node.js entry point for the application and sets up the server
*/

// Imports
const path = require('path');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const {parseFitFile, getFitPoints} = require(path.join(__dirname, 'src/fit_parser.js'));
const {parseGpxFile} = require(path.join(__dirname, 'src/gpx_parser.mjs'));


// Ensure uploads directory exists, create it if it doesn't
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Tells Multer where to save uploaded files
const storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, uploadDir);
    },
    filename: function(request, file, callback) {
        const randomName = Math.random().toFixed(5) + file.originalname;
        // Put in a few random characters to avoid overwriting files in case of duplicate filenames
        callback(null, randomName); 
    }
});
const upload = multer({ storage });

app = express();
// These lines are needed to populate the request.body object with the submitted inputs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Tell express which static files to serve
app.use(express.static('public'));

// Send the user to the index.html page if they send a GET request for the root page '/'
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html', { root: '.' });
});

app.get('/public/test_data/list', async (request, response) => {
    try {
        const testDir = path.join(__dirname, 'public', 'test_data');
        const filenames = await fs.promises.readdir(testDir);
        response.json(filenames);
    } catch (err) {
        response.status(500).json({error: err.message})
    }
});

// Call handleFileUpload() if we recieve a POST request to the uploads folder
app.post('/uploads', upload.array('files'), handleFileUpload);
/**
 * This is called when a POST request is made to upload a file
 * It uploads the file using Multer and saves it to the uploads folder, 
 * then renames it back to the original file name instead of the random filename Multer chose
 */
async function handleFileUpload(request, response) {
    if (!request.files || request.files.length === 0) { // Throw error if something went wrong with the file upload
        return response.status(400).json({ error: 'No files uploaded' });
    }
    
    // Parse the files
    const filenames = await fs.promises.readdir(uploadDir);
    
    const parsePromises = filenames.map(async filename => {
        const filepath = path.join(__dirname + '/uploads', filename);

        ext = path.extname(filepath);

        // FIT files
        if (ext === '.fit') {
            try {
                const parsedData = await parseFitFile(filepath); // Raw parsed FIT file object
                const points = getFitPoints(parsedData, filepath); // Simplified array of points
                // // We are done parsing the file, delete it before returning
                // fs.unlink(filepath, (err) => {
                //     if (err) {
                //         console.error(err)
                //     }
                // });
                return {file: filename, parsed: true, parsed_data: parsedData, points: points};
            } catch (err) {
                // // We are done parsing the file, delete it before returning
                // fs.unlink(filepath, (err) => {
                //     if (err) {
                //         console.error(err)
                //     }
                // });
                return {file: filename, error: err};
            }
        } 
        // GPX files
        else if (ext === '.gpx') {
            try {
                const parsedData = await parseGpxFile(filepath); // Raw parsed GPX file object
                console.log(`Parsed data type: ${typeof parsedData}`);
                console.log(parsedData);

            } catch (err) {
                console.error('Failed to parse GPX file', filename, err);
            }
        }
        

        
    });
    const parseResults = await Promise.all(parsePromises);

    // Send a response with the file renamning status and the results from parsing (includes the simplified array of points)
    response.json({parseResults});
}

// Required by Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000; // If running on local machine
}

const server = app.listen(port, function() {
    console.log(`Server is running on port ${port}`)
});

async function gracefulShutdown() {
    console.log('Server shutting down...');
    // Stop accepting new connections
    server.close(err => {
        if (err) {
            console.log(err);
        }
    });

    console.log('Deleting files in /uploads...');
    const dir = path.join(__dirname, 'uploads');
    const files = await fs.promises.readdir(dir);
    try {
        for (const file of files) {
            fs.unlink(path.join(dir, file), (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } 
    } catch (err) {
        console.error('Failed to delete files in /uploads', err);
    }

    console.error('Server closed');
    process.exit(0);
}

// Execute graceful shutdown when the server is closed
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);