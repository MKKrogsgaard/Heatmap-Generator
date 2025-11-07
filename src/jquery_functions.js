// Only run these when the page has loaded
$(document).ready(function(){
    // Add/remove file dropping styling to the file upload field if the user is hovering over it with a file in hand
    $(".file-upload-wrapper").bind("dragover", function() {
        $(".file-upload-wrapper").addClass("file-dropping");
    });
    $(".file-upload-wrapper").bind("dragleave", function() {
        $(".file-upload-wrapper").removeClass("file-dropping");
    });
});