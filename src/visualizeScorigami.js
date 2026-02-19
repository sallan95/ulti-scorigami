#!/usr/bin/env node

import { createCanvas } from 'chartjs-node-canvas';
import { Chart, registerables } from 'chart.js';
import fs from 'fs';
import path from 'path';
import { loadData, createOutputDirectory, saveChart } from './utils.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Create a visualization of the scorigami (unique score combinations) with team colors.
 * 
 * @param {object} gameData - The JSON data containing game statistics
 * @returns {Promise<string|null>} - Path to the saved visualization file or null if error
 */
async function visualizeScorigami(gameData) {
  if (!gameData || !gameData.data) {
    console.log("No valid data to visualize.");
    return null;
  }
  
  // Extract game information
  const games = [];
  for (const game of gameData.data) {
    const homeScore = game.homeScore || 0;
    const awayScore = game.awayScore || 0;
    const homeTeam = game.homeTeamID || '';
    const awayTeam = game.awayTeamID || '';
    const date = game.startTimestamp ? game.startTimestamp.split('T')[0] : '';
    
    games.push({
      home_score: homeScore,
      away_score: awayScore,
      home_team: homeTeam,
      away_team: awayTeam,
      date: date,
      game_id: game.gameID || ''
    });
  }
  
  if (games.length === 0) {
    console.log("No game data found.");
    return null;
  }
  
  // Find the maximum score to determine grid size
  const maxHome = Math.max(...games.map(game => game.home_score));
  const maxAway = Math.max(...games.map(game => game.away_score));
  const maxScore = Math.max(maxHome, maxAway) + 1;
  
  // Create a grid to store team information
  const grid = Array(maxScore).fill().map(() => Array(maxScore).fill(null));
  
  // Get unique teams for color mapping
  const allTeams = new Set();
  games.forEach(game => {
    allTeams.add(game.home_team);
    allTeams.add(game.away_team);
  });
  
  // Create a color map for teams
  const baseColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  
  // Create a dictionary mapping teams to colors
  const teamColors = {};
  const teamsList = Array.from(allTeams).sort();
  teamsList.forEach((team, i) => {
    teamColors[team] = baseColors[i % baseColors.length];
  });
  
  // Fill the grid with the first game for each score combination
  games.forEach(game => {
    const home = game.home_score;
    const away = game.away_score;
    if (grid[home][away] === null) {
      grid[home][away] = game;
    }
  });
  
  // Create canvas for the scorigami visualization
  const width = 1000;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  // Calculate grid dimensions
  const margin = 50;
  const gridWidth = width - 2 * margin;
  const gridHeight = height - 2 * margin;
  const cellWidth = gridWidth / maxScore;
  const cellHeight = gridHeight / maxScore;
  
  // Draw grid cells
  for (let home = 0; home < maxScore; home++) {
    for (let away = 0; away < maxScore; away++) {
      const x = margin + away * cellWidth;
      const y = height - margin - (home + 1) * cellHeight;
      
      if (grid[home][away] !== null) {
        // Use home team color
        const homeTeam = grid[home][away].home_team;
        ctx.fillStyle = teamColors[homeTeam] || '#cccccc';
      } else {
        // White for no game
        ctx.fillStyle = 'white';
      }
      
      ctx.fillRect(x, y, cellWidth, cellHeight);
      ctx.strokeStyle = '#dddddd';
      ctx.strokeRect(x, y, cellWidth, cellHeight);
    }
  }
  
  // Draw axes
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, height - margin);
  ctx.stroke();
  
  // Add labels and ticks
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  
  // X-axis ticks and labels
  for (let i = 0; i < maxScore; i++) {
    const x = margin + i * cellWidth + cellWidth / 2;
    const y = height - margin + 20;
    ctx.fillText(i.toString(), x, y);
    
    // Tick
    ctx.beginPath();
    ctx.moveTo(margin + i * cellWidth, height - margin);
    ctx.lineTo(margin + i * cellWidth, height - margin + 5);
    ctx.stroke();
  }
  
  // Y-axis ticks and labels
  ctx.textAlign = 'right';
  for (let i = 0; i < maxScore; i++) {
    const x = margin - 10;
    const y = height - margin - i * cellHeight - cellHeight / 2 + 5;
    ctx.fillText(i.toString(), x, y);
    
    // Tick
    ctx.beginPath();
    ctx.moveTo(margin - 5, height - margin - i * cellHeight);
    ctx.lineTo(margin, height - margin - i * cellHeight);
    ctx.stroke();
  }
  
  // Add axis labels
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Away Score', width / 2, height - 10);
  
  // Y-axis label (rotated)
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Home Score', 0, 0);
  ctx.restore();
  
  // Add title
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Ultimate Frisbee Scorigami: Team Colors', width / 2, 30);
  
  // Add statistics
  const uniqueScores = grid.flat().filter(cell => cell !== null).length;
  const totalGames = games.length;
  const possibleCombinations = maxScore * maxScore;
  
  const statsText = [
    `Total games: ${totalGames}`,
    `Unique score combinations: ${uniqueScores}`,
    `Percentage of unique combinations: ${(uniqueScores/totalGames*100).toFixed(1)}%`,
    `Possible combinations (0-${maxScore-1}): ${possibleCombinations}`,
    `Coverage: ${(uniqueScores/possibleCombinations*100).toFixed(1)}%`
  ];
  
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'black';
  
  // Draw stats box
  const statsBoxX = margin + 20;
  const statsBoxY = margin + 20;
  const statsBoxWidth = 300;
  const statsBoxHeight = 110;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(statsBoxX, statsBoxY, statsBoxWidth, statsBoxHeight);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.strokeRect(statsBoxX, statsBoxY, statsBoxWidth, statsBoxHeight);
  
  ctx.fillStyle = 'black';
  statsText.forEach((text, i) => {
    ctx.fillText(text, statsBoxX + 10, statsBoxY + 25 + i * 20);
  });
  
  // Add legend for team colors
  const legendX = width - margin - 150;
  const legendY = margin + 20;
  const legendWidth = 130;
  const legendHeight = Math.min(20 * teamsList.length + 30, height - 2 * margin);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Home Teams', legendX + 65, legendY + 20);
  
  ctx.font = '12px Arial';
  teamsList.forEach((team, i) => {
    // Color box
    ctx.fillStyle = teamColors[team];
    ctx.fillRect(legendX + 10, legendY + 35 + i * 20, 15, 15);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(legendX + 10, legendY + 35 + i * 20, 15, 15);
    
    // Team name
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(team, legendX + 35, legendY + 47 + i * 20);
  });
  
  // Save the image
  const outputDir = createOutputDirectory();
  const filename = `${outputDir}/scorigami.png`;
  const buffer = canvas.toBuffer('image/png');
  return saveChart(buffer, filename);
}

/**
 * Analyze and print information about scorigami (unique score combinations).
 * 
 * @param {object} gameData - The JSON data containing game statistics
 */
function analyzeScorigami(gameData) {
  if (!gameData || !gameData.data) {
    console.log("No valid data to analyze.");
    return;
  }
  
  // Extract score values and game information
  const games = [];
  for (const game of gameData.data) {
    // Extract date from startTimestamp
    const date = game.startTimestamp ? game.startTimestamp.split('T')[0] : '';
    
    games.push({
      home_score: game.homeScore || 0,
      away_score: game.awayScore || 0,
      date: date,
      game_id: game.gameID || ''
    });
  }
  
  // Find unique score combinations
  const scoreCombinations = {};
  games.forEach(game => {
    const scoreKey = `${game.home_score}-${game.away_score}`;
    if (!scoreCombinations[scoreKey]) {
      scoreCombinations[scoreKey] = [];
    }
    scoreCombinations[scoreKey].push(game);
  });
  
  // Print analysis
  console.log("\n===== SCORIGAMI ANALYSIS =====");
  console.log(`Total games analyzed: ${games.length}`);
  console.log(`Unique score combinations: ${Object.keys(scoreCombinations).length}`);
  
  // Print the most common score combinations
  console.log("\nMost common score combinations:");
  const commonScores = Object.entries(scoreCombinations)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);
  
  commonScores.forEach(([scoreKey, occurrences], i) => {
    const [home, away] = scoreKey.split('-');
    console.log(`${i+1}. ${home}-${away}: ${occurrences.length} times`);
    
    // Show up to 3 examples
    occurrences.slice(0, 3).forEach(game => {
      console.log(`   - ${game.date} (Game ID: ${game.game_id})`);
    });
    
    if (occurrences.length > 3) {
      console.log(`   - ... and ${occurrences.length-3} more`);
    }
  });
  
  // Print the scorigamis (score combinations that occurred exactly once)
  const scorigamis = Object.entries(scoreCombinations)
    .filter(([_, games]) => games.length === 1)
    .map(([scoreKey, _]) => scoreKey);
  
  console.log(`\nScorigamis (score combinations that occurred exactly once): ${scorigamis.length}`);
  
  // Print some examples of scorigamis
  if (scorigamis.length > 0) {
    console.log("Examples of scorigamis:");
    
    scorigamis.slice(0, 5).forEach((scoreKey, i) => {
      const [home, away] = scoreKey.split('-');
      const game = scoreCombinations[scoreKey][0];
      console.log(`${i+1}. ${home}-${away} on ${game.date} (Game ID: ${game.game_id})`);
    });
    
    if (scorigamis.length > 5) {
      console.log(`... and ${scorigamis.length-5} more`);
    }
  }
  
  // Calculate some statistics
  const maxHomeScore = Math.max(...games.map(g => g.home_score));
  const maxAwayScore = Math.max(...games.map(g => g.away_score));
  const totalPossible = (maxHomeScore + 1) * (maxAwayScore + 1);
  
  console.log(`\nCoverage of possible score combinations: ${(Object.keys(scoreCombinations).length/totalPossible*100).toFixed(1)}%`);
  console.log(`Percentage of games with unique scores: ${(scorigamis.length/games.length*100).toFixed(1)}%`);
}

/**
 * Main function to load data and create visualization
 */
async function main() {
  console.log("Loading game data...");
  const gameData = loadData("games_data_raw.json");
  
  console.log(`Game data loaded: ${gameData !== null}`);
  if (gameData) {
    console.log(`Game data structure: ${typeof gameData}`);
    console.log(`Game data keys: ${Object.keys(gameData).join(', ')}`);
    
    // Create scorigami visualization
    console.log("Creating scorigami visualization...");
    await visualizeScorigami(gameData);
    
    // Analyze scorigami data
    console.log("Analyzing scorigami data...");
    analyzeScorigami(gameData);
  } else {
    console.log("Failed to load game data.");
  }
}

// Run the main function
main().catch(console.error);
