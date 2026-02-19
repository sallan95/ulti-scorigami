import fs from 'fs';
import path from 'path';

/**
 * Load data from a JSON file.
 * 
 * @param {string} filename - The name of the file to load the data from
 * @returns {object|null} - The loaded JSON data or null if error
 */
export function loadData(filename) {
  try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    return data;
  } catch (error) {
    console.error(`Error loading data from ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Create a directory for output visualizations if it doesn't exist.
 * 
 * @returns {string} - The path to the output directory
 */
export function createOutputDirectory() {
  const outputDir = "visualizations";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

/**
 * Save a chart as an image file.
 * 
 * @param {Buffer} buffer - The image buffer to save
 * @param {string} filename - The name of the file to save the image to
 * @returns {string|null} - The path to the saved file or null if error
 */
export function saveChart(buffer, filename) {
  try {
    fs.writeFileSync(filename, buffer);
    console.log(`Visualization saved as '${filename}'`);
    return filename;
  } catch (error) {
    console.error(`Error saving visualization: ${error.message}`);
    return null;
  }
}
