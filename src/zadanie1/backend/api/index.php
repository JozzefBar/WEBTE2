<?php

// Require the Router class mapping URLs to controllers
require "Router.php";
// Require the UserController which handles the business logic
require "controllers/UserController.php";

// Set the HTTP header so the client expects the response in JSON format
header("Content-Type: application/json");

// Initialize a new Router instance
$router = new Router();

// Define API routes. 
// When an HTTP GET request to "/users" occurs, execute the 'index' method of UserController.
$router->get("/users", [UserController::class, "index"]);

// The {id} is a dynamic URL parameter (e.g., /users/5).
// When matched, it passes '5' to the 'show' method of UserController.
$router->get("/users/{id}", [UserController::class, "show"]);

// Define the POST route for creating a new user. 
$router->post("/users", [UserController::class, "create"]);

// Define the PUT route for updating an existing user by ID.
$router->put("/users/{id}", [UserController::class, "update"]);

// Define the DELETE route for removing an existing user by ID.
$router->delete("/users/{id}", [UserController::class, "delete"]);

// Run the router to process the incoming request based on defined routes
$router->run();