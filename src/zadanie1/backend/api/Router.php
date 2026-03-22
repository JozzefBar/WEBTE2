<?php

class Router {

    // Array to store all registered routes
    private $routes = [];

    public function add($method, $route, $handler)
    {
        $this->routes[] = [
            "method" => $method,   // HTTP Method (GET, POST, etc.)
            "route" => $route,     // URL Path (e.g., /users/{id})
            "handler" => $handler  // Target Array (e.g., [UserController::class, "index"])
        ];
    }

    // Helper methods for specific HTTP verbs
    public function get($route, $handler) { $this->add("GET", $route, $handler); }
    public function post($route, $handler) { $this->add("POST", $route, $handler); }
    public function put($route, $handler) { $this->add("PUT", $route, $handler); }
    public function delete($route, $handler) { $this->add("DELETE", $route, $handler); }

    public function run()
    {
        // --- CORS headers (allow frontend to call the API)
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        
        if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
            http_response_code(200);
            exit();
        }

        // Get the current HTTP request method and URI
        $method = $_SERVER["REQUEST_METHOD"];
        
        // Support Vite proxy: _route query param passes the REST endpoint directly
        if (isset($_GET['_route'])) {
            $uri = $_GET['_route'];
        } else {
            $uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
            // Remove the "/api" prefix from the URI since endpoints are registered without it
            $uri = preg_replace("#^/api#", "", $uri);
        }

        foreach ($this->routes as $route) {

            if ($route["method"] !== $method) {
                continue;
            }

            // Convert dynamic placeholders like {id} into a regex matching group ([^/]+)
            // Example: "/users/{id}" becomes "/users/([^/]+)"
            $pattern = preg_replace("#\{[a-zA-Z]+\}#", "([^/]+)", $route["route"]);
            
            // Allow regex from the very start (^) to the very end ($) of the string
            $pattern = "#^" . $pattern . "$#";

            // If the current URI matches the route's regex pattern...
            if (preg_match($pattern, $uri, $matches)) {

                // Remove the full match at index 0, keeping only the captured dynamic variables (like {id})
                array_shift($matches);

                // Destructure the handler array into Class name and Function name
                [$class, $function] = $route["handler"];
                
                // Instantiate the targeted controller class dynamically
                $controller = new $class;

                // Call the controller's method and pass the extracted URL parameters ($matches) as arguments
                return call_user_func_array([$controller, $function], $matches);
            }
        }

        Response::json(["error" => "Not Found"], 404);
    }
}