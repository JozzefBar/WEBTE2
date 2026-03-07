<?php
//

require_once(__DIR__ . "/../../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true"); 

if($_SERVER["REQUEST_METHOD"] === "OPTIONS") { 
    http_response_code(200); 
    exit(); 
}

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nie si prihlásený']);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo) { http_response_code(500); echo json_encode(['error' => 'Chyba DB']); exit(); }

//loading the history sorted from newest to oldest
$stmt = $pdo->prepare("
    SELECT login_type, created_at, ip_address
    FROM login_history
    WHERE user_id = :uid
    ORDER BY created_at DESC
    LIMIT 50
");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['data' => $history], JSON_UNESCAPED_UNICODE);