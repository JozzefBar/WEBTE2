<?php

//Returns details of one Olympian by ID

require_once(__DIR__ . "/../../../config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-type");

if($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method is not allowed"]);
    exit();
}

// Olympian ID must be in the URL: /api/athlete.php?id=5
if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid ID"]);
    exit();
}

$id = (int)$_GET["id"];

$pdo = connectDatabase($hostname, $database, $username, $password);
if(!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Database connection error"]);
    exit();
}

//getting information from athlete
$stmt = $pdo->prepare("
    SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.birth_date,
        a.birth_place,
        c_birth.name AS birth_country,
        a.death_date,
        a.death_place,
        c_death.name AS death_country
    FROM athletes a
    LEFT JOIN countries c_birth ON a.birth_country_id = c_birth.id
    LEFT JOIN countries c_death ON a.death_country_id = c_death.id
    WHERE a.id = :id
");

$stmt->execute([":id" => $id]);
$athlete = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$athlete) {
    http_response_code(404);
    echo json_encode(["error" => "Olympian not found"]);
    exit();
}

//getting all medails from athlete

$medalsStmt = $pdo->prepare("
    SELECT
        og.year,
        og.city AS games_city,
        og.type AS games_type,
        c_games.name AS games_country,
        d.name AS discipline,
        d.category,
        mt.name AS medal_name,
        mt.placing
    FROM athlete_medals am
    JOIN olympic_games og ON am.olympic_games_id = og.id
    JOIN disciplines d ON am.discipline_id = d.id
    JOIN medal_types mt ON am.medal_type_id = mt.id
    LEFT JOIN countries c_games ON og.country_id = c_games.id
    WHERE am.athlete_id = :id
    ORDER BY og.year ASC
");

$medalsStmt->execute([":id" => $id]);
$medals = $medalsStmt->fetchAll(PDO::FETCH_ASSOC);

//connect athlete with his medails

$athlete["medals"] = $medals;
echo json_encode($athlete, JSON_UNESCAPED_UNICODE);