<?php

class Response
{
    //Send a JSON response to the client and immediately stop execution
    public static function json($data, int $statusCode = 200)
    {
        http_response_code($statusCode);
        
        // Output the data converted accurately into JSON string format
        echo json_encode($data);
        
        exit();
    }
}
