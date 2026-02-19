#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.get('/', (req, res) => {
  console.log('Rendering home page');
  res.render('layout', { 
    title: 'Ultimate Frisbee Scorigami',
    active: 'home',
    content: 'index'
  });
});

app.get('/scorigami', (req, res) => {
  console.log('Rendering scorigami page');
  res.render('layout', { 
    title: 'UFA Scorigami Visualization',
    active: 'scorigami',
    content: 'scorigami'
  });
});

// Health check endpoint for hosting platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Scorigami API - fetches live data from UFA Stats API
app.get('/api/scorigami-data', async (req, res) => {
  try {
    // Fetch all completed games from UFA Stats API
    const response = await axios.get('https://www.backend.ufastats.com/api/v1/games', {
      params: {
        date: '2012:',
        statuses: 'Final'
      }
    });

    const games = response.data.data || [];

    // Process games into scorigami format
    const combinations = {};
    const yearsSet = new Set();
    let maxScore = 0;

    games.forEach(game => {
      const homeScore = game.homeScore || 0;
      const awayScore = game.awayScore || 0;

      // Normalize to winning/losing (higher score = winning)
      const winningScore = Math.max(homeScore, awayScore);
      const losingScore = Math.min(homeScore, awayScore);

      maxScore = Math.max(maxScore, winningScore);

      // Extract year from game ID or timestamp
      const year = game.startTimestamp
        ? new Date(game.startTimestamp).getFullYear()
        : parseInt(game.gameID?.substring(0, 4)) || null;

      if (year) yearsSet.add(year);

      const key = `${winningScore}-${losingScore}`;

      if (!combinations[key]) {
        combinations[key] = {
          winningScore,
          losingScore,
          count: 0,
          games: []
        };
      }

      combinations[key].count++;
      combinations[key].games.push({
        gameID: game.gameID,
        date: game.startTimestamp ? game.startTimestamp.split('T')[0] : null,
        homeTeam: game.homeTeamID,
        awayTeam: game.awayTeamID,
        homeScore,
        awayScore,
        year
      });
    });

    // Calculate statistics
    const totalGames = games.length;
    const uniqueScores = Object.keys(combinations).length;
    // For triangular grid: possible combinations = (maxScore+1) * (maxScore+2) / 2
    const possibleCombinations = ((maxScore + 1) * (maxScore + 2)) / 2;
    const coverage = possibleCombinations > 0
      ? ((uniqueScores / possibleCombinations) * 100).toFixed(1)
      : 0;

    res.json({
      maxScore,
      years: Array.from(yearsSet).sort((a, b) => b - a),
      combinations,
      stats: {
        totalGames,
        uniqueScores,
        possibleCombinations: Math.floor(possibleCombinations),
        coverage
      }
    });
  } catch (error) {
    console.error('Error fetching scorigami data:', error.message);
    res.status(500).json({ error: 'Failed to fetch game data from UFA Stats API' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
