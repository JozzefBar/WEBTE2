<?php

// endpoint for athletes with medals
// filtering is supported

//require_once('/var/www/config.php');
require_once(__DIR__ . "/../config.php");

header("Content-Type: application/json; charset=utf-8");
//CORS headers
//header("Access-Control-Allow-Origin: https://node26.webte.fei.stuba.sk");
header("Access-Control-Allow-Origin: http://localhost:5173");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-type");


if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

//Only get requests
if($_SERVER["REQUEST_METHOD"] !== "GET"){
    http_response_code(405);
    echo json_encode(["error" => "Metóda nie je povolená"]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if (!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Chyba pripojenia k databáze"]);
    exit();
}

//GET reading (filters + paging)
$year = isset($_GET["year"]) && $_GET["year"] !== "" ? (int)$_GET["year"] : null;
$category = isset($_GET['category']) && $_GET['category'] !== '' ? trim($_GET['category']) : null;
$page = isset($_GET['page']) && (int)$_GET['page'] > 0 ? (int)$_GET['page'] : 1;
if (isset($_GET['per_page']) && $_GET['per_page'] === 'all') {
    $perPage = null;
} else {
    $perPage = isset($_GET['per_page']) && in_array((int)$_GET['per_page'], [10, 20, 50]) ? (int)$_GET['per_page'] : 10;
}
$allowedSortColumns = ['last_name', 'year', 'category'];
$sortBy = isset($_GET['sort_by']) && in_array($_GET['sort_by'], $allowedSortColumns) ? $_GET['sort_by'] : null;
$sortDir = isset($_GET['sort_dir']) && strtoupper($_GET['sort_dir']) === 'DESC' ? 'DESC' : 'ASC';

// Building an SQL query
$sql = "
    SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.birth_date,
        a.birth_place,
        c_birth.name AS birth_country,
        og.year,
        og.type AS games_type,
        og.city AS games_city,
        c_games.name AS games_country,
        d.name AS discipline,
        d.category,
        mt.name AS medal_name,
        mt.placing
    FROM athlete_medals am 
    JOIN athletes a ON am.athlete_id = a.id
    JOIN olympic_games og ON am.olympic_games_id = og.id
    JOIN disciplines d ON am.discipline_id = d.id
    JOIN medal_types mt ON am.medal_type_id = mt.id
    LEFT JOIN countries c_birth ON a.birth_country_id = c_birth.id
    LEFT JOIN countries c_games ON og.country_id = c_games.id
    WHERE 1 = 1
";

$params = [];

//Dynamically add WHERE conditions based on filters
if ($year !== null){
    $sql .= " AND og.year = :year";
    $params[":year"] = $year;
}

if ($category !== null) {
    $sql .= " AND d.category = :category";
    $params[":category"] = $category;
}

// total nubmer of pages
$countSql = "SELECT COUNT(*) FROM ($sql) AS total_count";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$totalRecords = (int)$countStmt->fetchColumn();
$totalPages = $perPage !== null ? (int)ceil($totalRecords / $perPage) : 1;

//adding sorting
if($sortBy !== null) {
    //maping columns
    $sortColumnMap = [
        "last_name" => "a.last_name",
        "year" => "og.year",
        "category" => "d.category",
    ];
    $sql .= " ORDER BY " . $sortColumnMap[$sortBy] . " " . $sortDir;
} else {
    $sql .= " ORDER BY a.last_name ASC";
}


if ($perPage !== null) {
    $offset = ($page - 1) * $perPage;
    $sql .= " LIMIT :limit OFFSET :offset";
}

$stmt = $pdo->prepare($sql);

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

if ($perPage !== null) {
    $stmt->bindValue(":limit", $perPage, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
}

$stmt->execute();
$athletes = $stmt->fetchAll(PDO::FETCH_ASSOC);

//getting unique values for dropdown filters
// OH years
$yearsStmt = $pdo->query("SELECT DISTINCT year FROM olympic_games ORDER BY year DESC");
$years = $yearsStmt->fetchAll(PDO::FETCH_COLUMN);

// disciplines
$disciplinesStmt = $pdo->query("SELECT DISTINCT name FROM disciplines ORDER BY name ASC");
$disciplines = $disciplinesStmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode([
    "data" => $athletes,
    "pagination" => [
        "current_page" => $page,
        "per_page" => $perPage,
        "total_records" => $totalRecords,
        "total_pages" => $totalPages,
    ],
    "filters" => [
        "year" => $years,
        "disciplines" => $disciplines,
    ]
], JSON_UNESCAPED_UNICODE);