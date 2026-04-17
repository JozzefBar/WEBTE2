<?php

//Registration of new user

//require_once('/var/www/config.php');
//require_once('/var/www/node26.webte.fei.stuba.sk/vendor/vendor/autoload.php');

require_once(__DIR__ . "/../../config.php");
require_once(__DIR__ . '/../../../../vendor/autoload.php');

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

header("Content-Type: application/json; charset=utf-8");
//header("Access-Control-Allow-Origin: https://node26.webte.fei.stuba.sk");
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
    echo json_encode(["error" => "Metóda nie je povolená"]);
    exit();
}

//reading json body from React
$body = json_decode(file_get_contents('php://input'), true);

$errors = [];

$firstName = isset($body["first_name"]) ? trim($body["first_name"]) : "";
$lastName = isset($body["last_name"]) ? trim($body["last_name"]) : "";
$email = isset($body["email"]) ? trim($body["email"]) : "";
$userPassword = isset($body["password"]) ? $body["password"] : "";   // renamed to avoid conflict with DB credentials

if (empty($firstName))
    $errors["first_name"] = "Meno je povinné";
elseif (strlen($firstName) > 64)
    $errors["first_name"] = "Max. 64 znakov";

if (empty($lastName))
    $errors["last_name"] = "Priezvisko je povinné";
elseif (strlen($lastName) > 64)
    $errors["last_name"] = "Max. 64 znakov";

if (empty($email))
    $errors["email"] = "Email je povinný";
elseif (strlen($email) > 128)
    $errors["email"] = "Max. 128 znakov";
elseif (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email))
    $errors["email"] = "Neplatný formát emailu";

if(empty($userPassword))
    $errors["password"] = "Heslo je povinné";
else if (strlen($userPassword) < 8)
    $errors["password"] = "Heslo musí mať aspoň 8 znakov";

if (!empty($errors)){
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit();
}

// $password is the DB password defined in config.php; do not overwrite it with user input.
$pdo = connectDatabase($hostname, $database, $username, $password);
if(!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Chyba pripojenia k databáze"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute([":email" => $email]);
if($stmt->fetchColumn()){
    http_response_code(409);
    echo json_encode(["errors" => ["email" => "Tento email je už zaregistrovaný"]]);
    exit();
}

//Password hashing - PASSWORD_BCRYPT is an algorithm designed for hashing passwords
$hashedPassword = password_hash($userPassword, PASSWORD_ARGON2ID);

//Generate 2FA secret and QR code
$tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
$tfaSecret = $tfa->createSecret();
$qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $tfaSecret);

//Save user
$stmt = $pdo->prepare("
    INSERT INTO users (first_name, last_name, email, password_hash, auth_type, tfa_secret)
    VALUES (:fn, :ln, :email, :pass, 'local', :tfa)
");
$stmt->execute([
    ":fn"       => $firstName,
    ":ln"       => $lastName,
    ":email"    => $email,
    ":pass"     => $hashedPassword,
    ":tfa"      => $tfaSecret,
]);

http_response_code(201);
echo json_encode([
    'success'    => true,
    'message'    => 'Registrácia úspešná. Naskenuj QR kód do aplikácie Google Authenticator.',
    'tfa_secret' => $tfaSecret, 
    'qr_code'    => $qrCode,  
], JSON_UNESCAPED_UNICODE);