# Ultimate Frisbee Scorigami Web Application

A web application for visualizing Ultimate Frisbee game statistics, with a focus on "scorigami" - the tracking of unique score combinations.

## Overview

This project provides an interactive web interface to explore Ultimate Frisbee game data, featuring a Scorigami visualization that shows unique score combinations that have occurred in games.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Usage

Start the web application:

```bash
npm start
```

Then open your browser and navigate to `http://localhost:3000`

You can also run individual data processing scripts:

```bash
# Fetch team game statistics from the API
npm run fetch-data

# Update team statistics with game dates
npm run update-stats
```

## Features

- **Interactive Visualization**: The Scorigami chart is interactive with tooltips and hover effects
- **Responsive Design**: Works on desktop and mobile devices
- **Data Analysis**: Provides statistical analysis for the visualization
- **API Endpoints**: Access raw data through API endpoints

## Project Structure

```
ulti-scorigami/
├── package.json         # Project configuration and dependencies
├── README.md            # Project documentation
├── team_stats.json      # Processed team statistics data
├── games_data_raw.json  # Raw game data from API
├── src/                 # Server-side code
│   ├── server.js            # Express server and API endpoints
│   ├── fetchTeamStats.js    # Fetch data from API
│   ├── updateTeamStats.js   # Process and update team statistics
│   └── utils.js             # Shared utility functions
├── views/               # EJS templates
│   ├── layout.ejs           # Main layout template
│   ├── index.ejs            # Home page
│   └── scorigami.ejs        # Scorigami visualization
└── public/              # Static assets
    ├── css/                 # Stylesheets
    ├── js/                  # Client-side JavaScript
    └── images/              # Images and icons
```

## API Endpoints

- `/api/team-stats` - Get team statistics data
- `/api/game-data` - Get raw game data

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Templating**: EJS
- **Data Visualization**: Chart.js
- **HTTP Requests**: Axios

## License

ISC
