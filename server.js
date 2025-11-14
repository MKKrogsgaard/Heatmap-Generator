/*
DESCRIPTION: This file is the node.js entry point for the application and sets up the server
*/

// Imports
const path = require('path')
const express = require('express')
const fs = require('fs')
const multer = require('multer')

const {parseFitFile, getGpsPoints} = require(path.join(__dirname, 'src/fit_parser.js'))

// Ensure uploads directory exists, create it if it doesn't
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Tells Multer where to save uploaded files
const upload = multer({ dest: uploadDir });

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
        try {
            const parsedData = await parseFitFile(filepath); // Raw parsed .fit file object
            const points = getGpsPoints(parsedData, filepath); // Simplified array of points
            // We are done parsing the file, delete it before returning
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.error(err)
                }
            });
            return {file: filename, parsed: true, parsed_data: parsedData, points: points};
        } catch (err) {
            // We are done parsing the file, delete it before returning
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.error(err)
                }
            });
            return {file: filename, error: err};
        }
    });
    const parseResults = await Promise.all(parsePromises);

    // Send a response with the file renamning status and the results from parsing (includes the simplified array of points)
    response.json({parseResults});
}

// Start the server on some port
port = 5000
server = app.listen(port, function() {
    console.log(`Server is running on port ${port}`)
});

function graceFullShutdown() {
    console.log('Server shutting down...');
    server.close(function() {
        console.log('Deleting files in uploads folder...');
        // Delete all files in the uploads folder
        const dir = __dirname + '/uploads';
        fs.readdir(dir, (err, files) => {
            if (err){
                console.error(err);
            }
            for (const file of files) {
                fs.unlink(path.join(dir, file), (err) => {
                    if (err) {
                        console.error(err)
                    }
                });
            }
        })
        console.log("Server closed");
    });
}

// Execute graceful shutdown when the server is closed
process.on('SIGTERM', graceFullShutdown);
process.on('SIGINT', graceFullShutdown);