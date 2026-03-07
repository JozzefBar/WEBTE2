<?php

//deletion of data from db
//available only for logged users

require_once(__DIR__ . "/../../config.php");

header('Content-Type: application/json; charset=utf-8');
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
    echo json_encode(['error' => 'You are not logged in']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method is not available']);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo) { 
    http_response_code(500); 
    echo json_encode(['error' => 'Missing DB']); 
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

    //reset AUTO_INCREMENT
    $pdo->exec("ALTER TABLE athlete_medals AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE olympic_games AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE athletes AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE disciplines AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE countries AUTO_INCREMENT = 1");

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'All Olympic data has been deleted. You can upload a new import.',
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'delete error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}