<?php

//calling this endpoint during the start of application, if the user is already logged in

require_once(__DIR__ . "/../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-type");
header('Access-Control-Allow-Credentials: true');

if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

session_start();

if(!isset($_SESSION["user_id"])){
    http_response_code(401);
    echo json_encode(["authenticated" => false]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if(!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Chyba pripojenia k databáze"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, first_name, last_name, email, auth_type FROM users WHERE id = :id LIMIT 1");
$stmt->execute([":id" => $_SESSION["user_id"]]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$user){
    http_response_code(401);
    echo json_encode(["authenticated" => false]);
    exit();
}

echo json_encode([
    "authenticated" => true,
    "user" => $user,
], JSON_UNESCAPED_UNICODE);