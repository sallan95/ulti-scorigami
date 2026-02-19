#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Fetch team game statistics from the provided URL.
 * 
 * @param {string} url - The URL to fetch data from
 * @returns {Promise<object|null>} - The JSON response data or null if error
 */
async function fetchTeamStats(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    return null;
  }
}

/**
 * Display the team game statistics in a readable format.
 * 
 * @param {object} statsData - The JSON data containing team game statistics
 */
function displayStats(statsData) {
  if (!statsData) {
    console.log("No data to display.");
    return;
  }
  
  console.log(`Total records: ${statsData.count || 'Unknown'}`);
  console.log("\nTeam Game Statistics:");
  console.log("-".repeat(80));
  
  for (const game of statsData.records || []) {
    console.log(`Game ID: ${game.gameID}`);
    console.log(`Team: ${game.teamName} (ID: ${game.teamID})`);
    console.log(`Opponent: ${game.opponentName} (ID: ${game.opponentID})`);
    console.log(`Date: ${game.gameDate}`);
    console.log(`Score: ${game.teamScore} - ${game.opponentScore}`);
    console.log(`Result: ${game.isWin ? 'Win' : 'Loss'}`);
    console.log("-".repeat(80));
  }
}

/**
 * Save the team game statistics to a JSON file.
 * 
 * @param {object} statsData - The JSON data containing team game statistics
 * @param {string} filename - The name of the file to save the data to
 */
function saveToFile(statsData, filename = "team_stats.json") {
  if (!statsData) {
    console.log("No data to save.");
    return;
  }
  
  try {
    fs.writeFileSync(filename, JSON.stringify(statsData, null, 4));
    console.log(`Data saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving data to file: ${error.message}`);
  }
}

/**
 * Main function to fetch and process team statistics
 */
async function main() {
  // New URL for fetching game data
  const url = "https://www.backend.ufastats.com/api/v1/games?date=2012-01-01:2024-12-31";
  console.log(`Fetching game data from: ${url}`);
  
  // Fetch the data and print the structure to understand it
  const data = await fetchTeamStats(url);
  
  if (data) {
    // Print the structure of the data to understand it
    console.log("Data structure:");
    if (typeof data === 'object' && data !== null) {
      console.log(`Keys: ${Object.keys(data)}`);
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          console.log(`Sample ${key} item keys: ${Object.keys(data[key][0])}`);
        }
      }
    } else if (Array.isArray(data) && data.length > 0) {
      console.log(`List with ${data.length} items`);
      console.log(`Sample item keys: ${Object.keys(data[0])}`);
    }
    
    // Save the raw data for inspection
    saveToFile(data, "games_data_raw.json");
    console.log("Raw data saved to games_data_raw.json for inspection");
  }
}

// Run the main function
main().catch(console.error);
