// Only run these when the page has finished loading
$(document).ready(function(){
    // Global variables

    // Add/remove file dropping styling to the file upload field if the user is hovering over it with a file in hand
    $('.file-upload-wrapper').bind('dragover', function() {
        $(".file-upload-wrapper").addClass('file-dropping');
    });
    $('.file-upload-wrapper').bind('dragleave', function() {
        $('.file-upload-wrapper').removeClass('file-dropping');
    });

    // Event listener for file uploads (when the user drops files into the wrapper)
    $('.file-upload-wrapper').on('drop', function(event) {
        event.preventDefault(); // Prevent the default action that the browser takes when a form is submitted
        event.stopPropagation(); // Stops the event from traveling up the hierarchy of elements (so listeners on parent elements don't trigger)
        $('.file-upload-wrapper').removeClass('file-dropping') // Get rid of the dropping styling

        const dataTransfer = event.originalEvent.dataTransfer || event.dataTransfer; // Use originalEvent.dataTransfer if available, otherwise use event.dataTransfer (for cross-browser compatability)
        const files = dataTransfer.files;
       
        if (files && files.length > 0) { // Check to ensure that files contains at least one file
            submitFiles(files);
        }
    });

    // Event listener for file uploads (when the user picks files via the file selector)
    $('.file-upload-input').on('change', function() {
        submitFiles(this);
    });

    // Event listener for the ''generate heatmap with test data'' button
    $('.file-upload-button').on('click', async function() {
        testDir = '/test_data';
        const response = await fetch('public/test_data/list'); // Get the names of the test files from the server

        if(!response.ok) {
            console.error('Test file(s) error: Failed to fetch file list from server');
            alert('Could not load the test files!');
            return;
        }

        const filenames = await response.json();

        if (!Array.isArray(filenames) || filenames.length === 0) {
            console.error('Test file(s) error: No files in the test folder');
            alert('Could not load the test files!');
            return;
        }
        
        const dataTransfer = new DataTransfer(); // Format compatible with submitFiles()
        try {
            for (const filename of filenames) {
                const filepath = encodeURIComponent(testDir.concat('/', filename));
                const result = await fetch(filepath);
                if (!result.ok) {
                    throw new Error('Failed to fetch the file at ' + filepath);
                }
                const blob = await result.blob(); // Gotta figure out what< 1 this is at some point
                const file = new File([blob], filepath, {type: blob.type});
                dataTransfer.items.add(file);
            }
            submitFiles(dataTransfer.files);
        } catch (err) {
            console.error('Test file(s) error', err);
            alert('Could not load the test files!');
        }
    });
}); 