<?php

//Login user - with email verification

require_once(__DIR__ . "/../../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true"); 

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode(["error" => "Method is not allowed"]);
    exit();
}

session_start();

$body = json_decode(file_get_contents("php://input"), true);

$email = isset($body["email"]) ? trim($body["email"])   : "";
$password = isset($body["password"]) ? trim($body["password"])   : "";

//backend validation

$errors = [];
if(empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors["email"] = "Invalid email";

if(empty($password))
    $errors["password"] = "Heslo is required";

if(!empty($errors)){
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if(!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Database connection error"]);
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND auth_type = 'local' LIMIT1");
$stmt->execute([":email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);