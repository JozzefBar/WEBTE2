<?php

//logout - destroying session
//require_once('/var/www/config.php');
require_once(__DIR__ . "/../../config.php");

header("Content-Type: application/json; charset=utf-8");
//header("Access-Control-Allow-Origin: https://node26.webte.fei.stuba.sk");
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

echo json_encode(["success" => true, "message" => "Odhlásenie úspešné"], JSON_UNESCAPED_UNICODE);