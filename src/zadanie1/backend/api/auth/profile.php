<?php

require_once(__DIR__ . "/../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$body = json_decode(file_get_contents("php://input"), true);

$firstName = isset($body["first_name"]) ? trim($body["first_name"]) : "";
$lastName  = isset($body["last_name"])  ? trim($body["last_name"])  : "";
$newPassword = isset($body["new_password"]) ? $body["new_password"] : null;

$errors = [];
if (empty($firstName)) $errors["first_name"] = "Meno je povinné";
if (empty($lastName))  $errors["last_name"]  = "Priezvisko je povinné";
if ($newPassword !== null && strlen($newPassword) < 8)
    $errors["new_password"] = "Heslo musí mať aspoň 8 znakov";

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection error"]);
    exit();
}

$userId = $_SESSION["user_id"];

if ($newPassword) {
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET first_name = :fn, last_name = :ln, password_hash = :pw WHERE id = :id");
    $stmt->execute([":fn" => $firstName, ":ln" => $lastName, ":pw" => $hash, ":id" => $userId]);
} else {
    $stmt = $pdo->prepare("UPDATE users SET first_name = :fn, last_name = :ln WHERE id = :id");
    $stmt->execute([":fn" => $firstName, ":ln" => $lastName, ":id" => $userId]);
}

echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
