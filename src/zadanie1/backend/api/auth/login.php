<?php

//Login user - with email verification

require_once(__DIR__ . "/../../config.php");

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

//If user is already registered, we can skip this whole part
if (isset($_SESSION['user_id'])) {
    echo json_encode(['already_logged_in' => true]);
    exit();
}

$body = json_decode(file_get_contents("php://input"), true);

$email = isset($body["email"]) ? trim($body["email"])   : "";
$userPassword = isset($body["password"]) ? trim($body["password"])   : "";

//backend validation

$errors = [];
if(empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors["email"] = "Invalid email";

if(empty($userPassword))
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

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND auth_type = 'local' LIMIT 1");
$stmt->execute([":email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

//warning with specific wrong input
if(!$user || !password_verify($userPassword, $user["password_hash"])){
    http_response_code(401);
    echo json_encode(["error" => "Incorrect email or password"]);
    exit();
}

//If password is okay, we can do to 2FA step
$_SESSION["pending_2fa_user_id"] = $user["id"];

echo json_encode([
    "required_2fa" => true,
    "message"  => "Enter the code from the Google Authenticator app",
], JSON_UNESCAPED_UNICODE);