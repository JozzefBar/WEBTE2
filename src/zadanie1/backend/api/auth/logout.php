<?php

//logout - destroying session
require_once(__DIR__ . "/../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

session_start();

//Destroying the session - $_SESSION is cleared, the session cookie is destroyed
$_SESSION = [];
session_destroy();

echo json_encode(["success" => true, "message" => "Logout successful"], JSON_UNESCAPED_UNICODE);