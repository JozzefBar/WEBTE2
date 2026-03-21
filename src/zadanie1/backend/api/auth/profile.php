<?php

//require_once('/var/www/config.php');
require_once(__DIR__ . "/../../config.php");

header("Content-Type: application/json; charset=utf-8");
//header("Access-Control-Allow-Origin: https://node26.webte.fei.stuba.sk");
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
    echo json_encode(["error" => "Nie si prihlásený"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Metóda nie je povolená"]);
    exit();
}

$body = json_decode(file_get_contents("php://input"), true);

$firstName       = isset($body["first_name"])       ? trim($body["first_name"])       : "";
$lastName        = isset($body["last_name"])        ? trim($body["last_name"])        : "";
$newPassword     = isset($body["new_password"]) && $body["new_password"] !== '' ? $body["new_password"] : null;
$newPasswordRep  = isset($body["new_password_repeat"]) && $body["new_password_repeat"] !== '' ? $body["new_password_repeat"] : null;

$errors = [];
if (empty($firstName))            $errors["first_name"] = "Meno je povinné";
elseif (strlen($firstName) > 64)  $errors["first_name"] = "Max. 64 znakov";
if (empty($lastName))             $errors["last_name"]  = "Priezvisko je povinné";
elseif (strlen($lastName) > 64)   $errors["last_name"]  = "Max. 64 znakov";

if ($newPassword !== null || $newPasswordRep !== null) {
    if ($newPassword === null || $newPassword === "") {
        $errors["new_password"] = "Zadaj nové heslo";
    } elseif (strlen($newPassword) < 8) {
        $errors["new_password"] = "Heslo musí mať aspoň 8 znakov";
    } 
    
    if ($newPassword !== $newPasswordRep) {
        $errors["new_password_repeat"] = "Heslá sa nezhodujú";
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo) {
    http_response_code(500);
    echo json_encode(["error" => "Chyba pripojenia k databáze"]);
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
