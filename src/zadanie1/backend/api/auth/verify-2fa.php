<?php

//STEP 2 in loggin

require_once(__DIR__ . "/../../config.php");
require_once(__DIR__ . '/../../../../vendor/autoload.php');

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

session_start();

//user have to be in state - "waiting for 2FA"
if (!isset($_SESSION["pending_2fa_user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid request - please enter your email and password first."]);
    exit();
}

$body = json_decode(file_get_contents("php://input"), true);
$code = isset($body["code"]) ? trim($body["code"]) : "";

if(empty($code)){
    http_response_code(422);
    echo json_encode(["errors" => ["code" => "2FA code is mandatory"]]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
$userId = $_SESSION["pending_2fa_user_id"];

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
$stmt->execute([":id" => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$user || !$user["tfa_secret"]) {
    http_response_code(401);
    echo json_encode(["error" => "User does not have 2FA set up"]);
    exit();
}

//Verifying a TOTP code using a library

$tfa = new TwoFactorAuth(new BaconQrCodeProvider());
if (!$tfa->verifyCode($user["tfa_secret"], $code, 2)) {
    http_response_code(401);
    echo json_encode(["error" => "Incorrect 2FA code"]);
    exit();
}

unset($_SESSION["pending_2fa_user_id"]);

$_SESSION["user_id"] = $user["id"];
$_SESSION["user_email"] = $user["email"];
$_SESSION["auth_type"] = "local";

//record to history

try {
    $pdo->prepare("
        INSERT INTO login_history(user_id, auth_type)
        VALUES (:uid, 'local');
    ")->execute([
        ":uid" => $userId,
    ]);
} catch (Exception $e) {
    error_log("login_history insert failed: " . $e->getMessage());
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user["id"],
        "first_name" => $user["first_name"],
        "last_name" => $user["last_name"],
        "email" => $user["email"],
        "auth_type" => $user["auth_type"],
    ]
], JSON_UNESCAPED_UNICODE);