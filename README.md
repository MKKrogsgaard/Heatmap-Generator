# Heatmap generator

A simple heatmap maker for FIT and GPX files with location data. You drag and drop (or select) some files, and get an interactive heatmap!

Garmin uses FIT files while Strava uses GPX files, so this heatmap generator should work with any activity data you can download from Garmin or Strava (and pretty much anywhere else, for that matter). 

I made this because I couldn't be arsed to pay for a Strava subscription, but I think the heatmap is cool :)

# Instructions

1. Make sure you have `node.js` and `npm` installed.
2. Download the code from this repository and unzip the folder.
3. Open a terminal and navigate to the root folder of the repo (the folder you just unzipped).
4. Run `npm install` in the terminal.
5. Run `node server.js` in the terminal.

You should now be able to access the heatmap generator on port `5000` by going to `http://localhost:5000/` with your web browser of choice.
