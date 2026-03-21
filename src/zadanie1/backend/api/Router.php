<?php

class Router {

    // Array to store all registered routes
    private $routes = [];

    // Core method to add a new route to the router
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

    // Start matching the current URL to the registered routes
    public function run()
    {
        // Get the current HTTP request method and URI
        $method = $_SERVER["REQUEST_METHOD"];
        $uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
        
        // Remove the "/api" prefix from the URI since endpoints are registered without it
        $uri = preg_replace("#^/api#", "", $uri);

        // Iterate over all registered routes
        foreach ($this->routes as $route) {

            // Skip routes that don't match the current HTTP method (e.g., skip POST if request is GET)
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

        // If no routes matched, return a 404 Not Found JSON response
        Response::json(["error" => "Not Found"], 404);
    }
}