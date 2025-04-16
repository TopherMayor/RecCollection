#!/usr/bin/env node
"use strict";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const yaml = require("js-yaml");

const argv = yargs(hideBin(process.argv))
  .option("config", {
    alias: "c",
    type: "string",
    description: "Path to config file (JSON/YAML)",
  })
  .option("port", {
    alias: "p",
    type: "number",
    description: "Server port number",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Verbose output",
  })
  .config("config", "Load configuration from file", (configPath) => {
    const configFile = fs.readFileSync(configPath, "utf8");
    return configPath.endsWith(".yaml") || configPath.endsWith(".yml")
      ? yaml.load(configFile)
      : JSON.parse(configFile);
  }).argv;

const defaultConfig = {
  port: 3000,
  logLevel: "info",
  database: {
    host: "localhost",
    port: 5432,
  },
};

const finalConfig = {
  ...defaultConfig,
  ...argv,
};

console.log("Starting application with configuration:");
console.log(finalConfig);

// Main application logic would go here
