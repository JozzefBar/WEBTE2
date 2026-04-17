<?php

require_once __DIR__.'/../../config.php';
require_once __DIR__.'/../models/User.php';
require_once __DIR__.'/../Response.php';

class UserController {

    // Internal property holding the active User Model
    private User $userModel;

    // Triggered automatically whenever 'new UserController' is executed
    public function __construct()
    {
        // Pull database configuration variables defined in config.php from the global scope
        global $hostname, $database, $username, $password;
        
        // Connect to the DB using the custom function from config.php
        $pdo = connectDatabase($hostname, $database, $username, $password);
        
        // Instantiate the User Model using the active PDO connection
        $this->userModel = new User($pdo);
    }

    // Displays all available users
    public function index()
    {
        $users = $this->userModel->getAll();
        // Return 200 OK along with the array of users formatted as JSON
        Response::json($users);
    }

    // Displays details of a specific user. The $id param is received from the router e.g. /users/{id}
    public function show($id)
    {
        // Find user by ID making sure $id is cast to boolean/integer
        $user = $this->userModel->getById((int)$id);

        // If no user matches the database query...
        if (!$user) {
            // ...abort and return a 404 (Not Found) error response immediately
            Response::json(["error" => "User not found"], 404);
        }

        // Output single user data as JSON
        Response::json($user);
    }

    // Create a new user from incoming frontend request body
    public function create()
    {
        // Fetch raw JSON data from frontend request payload and decode it into a PHP array
        $data = json_decode(file_get_contents("php://input"), true);

        // Make sure all required properties exist in the payload
        if (
            !isset($data["first_name"]) ||
            !isset($data["last_name"]) ||
            !isset($data["email"]) ||
            !isset($data["password"])
        ) {
            // Throw returning 400 Bad Request error if something is missing
            Response::json(["error" => "Missing required fields"], 400);
        }

        try {
            // Execute the create function inside our model
            $id = $this->userModel->create(
                $data["first_name"],
                $data["last_name"],
                $data["email"],
                $data["password"]
            );

            // Respond indicating the creation was successful using code 201 Created
            Response::json([
                "message" => "User created",
                "id" => $id
            ], 201);

        } catch (PDOException $e) {
            
            // Check if the Database error code implies a UNIQUE constraint duplicate (like email existing)
            if ($e->getCode() == "23000") {
                Response::json(["error" => "Email already exists"], 409); // 409 Conflict
            }

            // Fallback general 500 error if another DB issue occurs
            Response::json(["error" => "Database error"], 500);
        }
    }

    public function update($id)
    {
        // Endpoint handler to alter an already existing user details
        // Fetch raw JSON data from frontend request payload and decode it into a PHP array
        $data = json_decode(file_get_contents("php://input"), true);
        // Make sure required properties exist in the payload
        if (!isset($data["first_name"]) || !isset($data["last_name"])) {
            Response::json(["error" => "Missing required fields: first_name, last_name"], 400);
        }
        // Optional: First check if the user actually exists before updating
        if (!$this->userModel->getById((int)$id)) {
            Response::json(["error" => "User not found"], 404);
        }
        // Execute the update logic inside the model
        $success = $this->userModel->update(
            (int)$id,
            $data["first_name"],
            $data["last_name"]
        );
        // Respond based on whether the update query was successful
        if ($success) {
            Response::json(["message" => "User updated successfully"]);
        } else {
            // Can also mean the user sent the exact same data as before (no rows affected)
            Response::json(["error" => "Failed to update user or no changes were made"], 500);
        }
    }

    public function delete($id)
    {
        // Endpoint handler to remove user details from the database completely
        // First check if the user actually exists
        if (!$this->userModel->getById((int)$id)) {
            Response::json(["error" => "User not found"], 404);
        }
        // Attempt to delete the user from the database
        $success = $this->userModel->delete((int)$id);
        // Respond based on the query result
        if ($success) {
            Response::json(["message" => "User deleted successfully"]);
        } else {
            Response::json(["error" => "Failed to delete user"], 500);
        }
    }
}