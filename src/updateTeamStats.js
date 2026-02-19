#!/usr/bin/env node

import fs from 'fs';

/**
 * Extract the date from a gameID string.
 * 
 * @param {string} gameId - The gameID string in format like "2024-07-21-OAK-LA"
 * @returns {string|null} - The extracted date in YYYY-MM-DD format or null if invalid
 */
function extractDateFromGameId(gameId) {
  // Split the gameID by '-' and take the first 3 parts (year, month, day)
  const parts = gameId.split('-');
  if (parts.length >= 3) {
    const dateParts = parts.slice(0, 3);
    return dateParts.join('-');
  }
  return null;
}

/**
 * Read team_stats.json, add a gameDate field to each record, and save the updated data.
 */
function updateTeamStatsWithDate() {
  try {
    // Read the existing JSON file
    const data = JSON.parse(fs.readFileSync('team_stats.json', 'utf8'));
    
    // Add gameDate field to each record
    for (const record of data.stats || []) {
      const gameId = record.gameID;
      if (gameId) {
        record.gameDate = extractDateFromGameId(gameId);
      }
    }
    
    // Save the updated data back to the file
    fs.writeFileSync('team_stats.json', JSON.stringify(data, null, 4));
    
    console.log("Successfully added gameDate field to each record in team_stats.json");
  } catch (error) {
    console.error(`Error updating team_stats.json: ${error.message}`);
  }
}

// Run the update function
updateTeamStatsWithDate();
