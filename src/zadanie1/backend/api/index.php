<?php

/*
 * DEPRECATION NOTICE
 * The following procedural files from Assignment 1 are now DEPRECATED:
 * - athletes.php
 * - athlete.php
 * - import.php
 * - clear-data.php
 * 
 * They have been completely replaced by this new REST API structure 
 * (Router, Controllers, Models) which was built for Assignment 2.
 */

// Require the Router class mapping URLs to controllers
require "Router.php";
// Require the Controller classes which handles the business logic
require "controllers/UserController.php";
require "controllers/AthleteController.php";

// Set the HTTP header so the client expects the response in JSON format
header("Content-Type: application/json");

$router = new Router();

// Define API routes

// --- User routes (existing) ---
$router->get("/users", [UserController::class, "index"]);
$router->get("/users/{id}", [UserController::class, "show"]);
$router->post("/users", [UserController::class, "create"]);
$router->put("/users/{id}", [UserController::class, "update"]);
$router->delete("/users/{id}", [UserController::class, "delete"]);
// --- Athlete routes (NEW) ---
$router->get("/athletes", [AthleteController::class, "index"]);
$router->post("/athletes/batch", [AthleteController::class, "batchCreate"]);
$router->get("/athletes/{id}", [AthleteController::class, "show"]);
$router->post("/athletes", [AthleteController::class, "create"]);
$router->put("/athletes/{id}", [AthleteController::class, "update"]);
$router->delete("/athletes/{id}", [AthleteController::class, "delete"]);

$router->run();