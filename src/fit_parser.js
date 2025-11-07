/*
DESCRIPTION: Converts a FIT file to JSON using the community fit-file-parser
*/

const FitParser = require("fit-file-parser")

function semicirclesToDeg(sc) {
    /**
     * Converts from semicircle coordinatres (the format used by .fit files) to degrees
     */
    return sc * (180.0 / 2.0**(31));
}
