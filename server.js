/*
DESCRIPTION: This file is the node.js entry point for the application and sets up the server
*/

// Imports
const path = require('path')
const express = require('express')
const fs = require('fs')
const multer = require('multer')

// ensure uploads directory exists
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Tells Multer where to save uploaded files
const upload = multer({ dest: uploadDir });

app = express();
// These lines are needed to populate the request.body object with the submitted inputs
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// Tell express which static files to serve
app.use(express.static('public'))

// Send the user to the index.html page if they send a GET request for the root page '/'
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/index.html', { root: '.' });
});

// Call handleFileUpload() if we recieve a POST request to the uploads folder
app.post('/uploads', upload.array('files'), handleFileUpload);
function handleFileUpload(request, response) {
    console.log(request.body);
    console.log(request.files);
    response.json({message: 'Successfully uploaded files'});
}

// Start the server on some port
port = 5000
server = app.listen(port, function() {
    console.log(`Server is running on port ${port}`)
    fs.writeFile(__dirname + '/uploads/test.txt', "bla", err => {
        if (err) {
            console.error(err);
        }
    });
});

function graceFullShutdown() {
    console.log('Server shutting down...');
    server.close(function() {
        console.log('Deleting files in uploads folder...');
        // Delete all files in the uploads folder
        const dir = __dirname + '/uploads';
        // Get the files in the folder
        fs.readdir(dir, (err, files) => {
            if (err){
                console.error(err);
            }
            for (const file of files) {
                // Delete each file
                fs.unlink(path.join(dir, file), (err) => {
                    if (err) {
                        console.error(err)
                    }
                });
            }
        })
        console.log("Server closed.");
    });
}

// Execute graceful shutdown when the server is closed
process.on('SIGTERM', graceFullShutdown);
process.on('SIGINT', graceFullShutdown);