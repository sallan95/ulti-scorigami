# UFA Scorigami

A web application that visualizes "scorigami" (unique final score combinations) for UFA (Ultimate Frisbee Association) games.

## Tech Stack
- **Backend**: Node.js, Express
- **Frontend**: EJS templates, Bootstrap 5, vanilla JS Canvas API
- **Data**: Live from UFA Stats API (`https://www.backend.ufastats.com/api/v1`)

## Project Structure
```
ulti-scorigami/
├── src/
│   └── server.js         # Express server with API endpoint
├── views/
│   ├── layout.ejs        # Main layout with navbar
│   ├── index.ejs         # Home page
│   └── scorigami.ejs     # Scorigami visualization (canvas + modal)
├── public/
│   ├── css/styles.css    # Custom styles
│   └── js/main.js        # Client utilities
├── package.json
├── render.yaml           # Render.com deployment config
└── swagger.json          # UFA Stats API documentation
```

## Running Locally
```bash
npm install
npm start
# Open http://localhost:3000
```

## Routes
- `/` - Home page
- `/ufa-scorigami` - Scorigami visualization
- `/health` - Health check endpoint
- `/api/scorigami-data` - JSON API (fetches live from UFA Stats)

## Key Features
- **Triangular grid**: Winning score (Y) vs Losing score (X)
- **Binary coloring**: Green = score occurred, White = hasn't occurred
- **Year filter**: Filter by season using dropdown
- **Click interaction**: Click cell to see all games with that score
- **Game links**: Each game links to WatchUFA game page

## Deployment
Hosted on Render.com. Auto-deploys from GitHub on push to main.

## Future Plans
- Add support for additional leagues (not just UFA)

## API Reference
See `swagger.json` for UFA Stats API documentation. Key endpoint used:
```
GET https://www.backend.ufastats.com/api/v1/games?date=2012:&statuses=Final
```
