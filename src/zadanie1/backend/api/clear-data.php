<?php

//deletion of data from db
//available only for logged users

//require_once('/var/www/config.php');
require_once(__DIR__ . "/../config.php");

header('Content-Type: application/json; charset=utf-8');
//header('Access-Control-Allow-Origin: https://node26.webte.fei.stuba.sk');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nie si prihlásený']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metóda nie je povolená']);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo) { 
    http_response_code(500); 
    echo json_encode(['error' => 'Chyba pripojenia k databáze']);
    exit(); 
}

try {

    //Removing firstly tables which refer to others (child tables)
    //and then the tables they refer to (parent tables)

    $pdo->beginTransaction();

    $pdo->exec("DELETE FROM athlete_medals");
    $pdo->exec("DELETE FROM olympic_games");
    $pdo->exec("DELETE FROM athletes");
    $pdo->exec("DELETE FROM disciplines");
    $pdo->exec("DELETE FROM countries");
    $pdo->exec("DELETE FROM medal_types");

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Všetky olympijské dáta boli vymazané. Môžeš nahrať nový import.',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Chyba pri mazaní: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}