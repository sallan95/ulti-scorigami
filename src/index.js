#!/usr/bin/env node

/**
 * Ultimate Frisbee Scorigami - Main Entry Point
 * 
 * This script provides a command-line interface to run the various
 * data fetching and visualization scripts in the project.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

// Define available commands
const commands = {
  'fetch-data': {
    script: './src/fetchTeamStats.js',
    description: 'Fetch team game statistics from the API'
  },
  'update-stats': {
    script: './src/updateTeamStats.js',
    description: 'Update team statistics with game dates'
  },
  'visualize-scorigami': {
    script: './src/visualizeScorigami.js',
    description: 'Create a visualization of unique score combinations'
  },
  'all': {
    description: 'Run all commands in sequence'
  }
};

/**
 * Display help information
 */
function showHelp() {
  console.log('Ultimate Frisbee Scorigami - Command Line Interface\n');
  console.log('Usage: node src/index.js [command]\n');
  console.log('Available commands:');
  
  Object.entries(commands).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(20)} ${info.description}`);
  });
  
  console.log('\nExamples:');
  console.log('  node src/index.js fetch-data');
  console.log('  node src/index.js visualize-scorigami');
  console.log('  node src/index.js all');
}

/**
 * Run a command
 * 
 * @param {string} command - The command to run
 * @returns {Promise<void>}
 */
async function runCommand(command) {
  if (!commands[command]) {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  if (command === 'all') {
    // Run all commands in sequence
    const commandsToRun = Object.entries(commands)
      .filter(([name]) => name !== 'all')
      .map(([_, info]) => info.script);
    
    for (const script of commandsToRun) {
      try {
        console.log(`\nRunning ${script}...\n`);
        const { stdout, stderr } = await execAsync(`node ${script}`);
        console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error(`Error running ${script}: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
      }
    }
  } else {
    // Run a single command
    const script = commands[command].script;
    try {
      console.log(`\nRunning ${script}...\n`);
      const { stdout, stderr } = await execAsync(`node ${script}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Error running ${script}: ${error.message}`);
      if (error.stdout) console.log(error.stdout);
      if (error.stderr) console.error(error.stderr);
    }
  }
}

/**
 * Main function
 */
async function main() {
  // Make sure script files are executable
  const scripts = Object.values(commands)
    .filter(info => info.script)
    .map(info => info.script);
  
  for (const script of scripts) {
    try {
      await fs.promises.chmod(script, 0o755);
    } catch (error) {
      console.warn(`Warning: Could not make ${script} executable: ${error.message}`);
    }
  }
  
  // Parse command line arguments
  const command = process.argv[2];
  
  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }
  
  await runCommand(command);
}

// Run the main function
main().catch(console.error);
