<?php

class Response
{
    /**
     * Send a JSON response to the client and immediately stop execution
     * 
     * @param mixed $data Information (array or object) to be encoded and returned
     * @param int $statusCode HTTP Status Code (like 200 OK, 404 Not Found, etc.)
     */
    public static function json($data, int $statusCode = 200)
    {
        // Set the appropriate HTTP Status Code for the browser client to recognize
        http_response_code($statusCode);
        
        // Output the data converted accurately into JSON string format
        echo json_encode($data);
        
        // Terminate the script gracefully so no unexpected HTML or blank string outputs follow
        exit();
    }
}
