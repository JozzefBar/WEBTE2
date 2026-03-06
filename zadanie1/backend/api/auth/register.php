<?php

//Registration of new user 

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

//reading json body from React
$body = json_decode(file_get_contents('php://input'), true);

$errors = [];

$firstName = isset($body["first_name"]) ? trim($body["first_name"]) : "";
$lastName = isset($body["last_name"]) ? trim($body["last_name"]) : "";
$email = isset($body["email"]) ? trim($body["email"]) : "";
$password = isset($body["password"]) ? $body["password"] : "";

if (empty($firstName))
    $errors["first_name"] = "First name is required";

if (empty($lastName))
    $errors["last_name"] = "Last name is required";

if (empty($email))
    $errors["email"] = "Email is required";
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors["email"] = "Invalid email format";

if(empty($password))
    $errors["password"] = "Password is required";
else if (strlen($password) < 8)
    $errors["password"] = "Password must be at least 8 characters long";

if (!empty($errors)){
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

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute([":email" => $email]);
if($stmt->fetchColumn()){
    http_response_code(409);
    echo json_encode(["errors" => ["This email is already registered"]]);
    exit();
}

//Password hashing - PASSWORD_BCRYPT is an algorithm designed for hashing passwords
$hashedPassword = password_hash($password, PASSWORD_ARGON2ID);

//Save user

$stmt = $pdo->prepare("
    INSERT INTO users (first_name, last_name, email, password, auth_type, created_at)
    VALUES (:fn, :ln, :email, :pass, 'local', NOW())
");
$stmt->execute([
    ":fn"       => $firstName
    ":ln"       => $lastName
    ":email"    => $email
    ":pass"     => $hashedPassword
]);

http_response_code(201);
echo json_encode(["success" => true, "message" => "Registration successful"], JSON_UNESCAPED_UNICODE);