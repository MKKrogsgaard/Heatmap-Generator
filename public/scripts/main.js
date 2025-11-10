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
    // Log the result of the upload
    .then((result) => console.log(result))
    // Log errors if they occur
    .catch((err) => console.error('An error ocurred', err))
}

/**
 * Takes in GPS points and makes a heatmap
 * @param {<Array>} runs - An array where each entry is the set of points associated with a run
 */
function makeHeatMap(runs) {
    // Extract all of the GPS points from the runs
    const points = [];
    // Initialize heatmap centered on the first point
    const map = L.map('map', {

    });
}