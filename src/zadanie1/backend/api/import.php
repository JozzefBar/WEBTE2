<?php

//endpoint will handle the upload of the CSV file and insert the data into the database.
// only for logged users

require_once(__DIR__ . "/../config.php");
require_once(__DIR__ . "/../parser.php");
require_once(__DIR__ . "/../upload.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");    //for session cookies

if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(200);
    exit();
}

//Session start
session_start();

//check if user is logged
if(!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Not logged in"]);
    exit();
}


if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode(["error" => "Method is not allowed"]);
    exit();
}

if (!isset($_FILES["csv_file"])) {
    http_response_code(400);
    echo json_encode(["error" => "No file uploaded"]);
    exit();
}

$file = $_FILES["csv_file"];


//error and suffix check
if ($file["error"] !== UPLOAD_ERR_OK){
    http_response_code(400);
    echo json_encode(["error" => "Error uploading file: " . $file["error"]]);
    exit();
}

$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
if ($ext !== "csv"){
    http_response_code(400);
    echo json_encode(["error" => "Only csv files are allowed"]);
    exit();
}

//parsing
$data = parseCsvToAssocArray($file["tmp_name"], ";");

if(empty($data)){
    http_response_code(400);
    echo json_encode(["error" => "CSV file is empty or invalid"]);
    exit();
}

$pdo = connectDatabase($hostname, $database, $username, $password);
if(!$pdo){
    http_response_code(500);
    echo json_encode(["error" => "Database connection error"]);
    exit();
}

//Transaction start - if something goes wrong, rollback and there will be no inconsistent data left
$pdo->beginTransaction();

$inserted = 0;
$skipped = 0;
$errors = [];

try{
    foreach($data as $row){
        //Expected columns in CSV, based on instructions/oh_v2.csv

        //Helper function to get a value from a row (returns null if it doesn't exist/is empty)
        $get = function(string $key) use ($row): ?string {
            return isset($row[$key]) && $row[$key] !== "" ? trim($row[$key]) : null;
        };

        //Countries
        $birthCountryId = $get("KrajinaNarodenia") ? getOrCreateCountry($pdo, $get("KrajinaNarodenia")) : null;
        $deathCountryId = $get("KrajinaUmrtia") ? getOrCreateCountry($pdo, $get("KrajinaUmrtia")) : null;
        $gamesCountryId = $get("KrajinaOH") ? getOrCreateCountry($pdo, $get("KrajinaOH")) : null;

        //olympic games
        $year = $get("RokOH") ? (int)$get("RokOH") : null;
        $type = $get('TypOH');
        $city = $get('MestoOH');

        if(!$year || !$type || !$city || !$gamesCountryId){
            $skipped++;
            $errors[] = "Skipped line - missing OH data: " . json_encode($row, JSON_UNESCAPED_UNICODE);
            continue;
        }

        //enum validation
        if(!in_array($type, ['LOH', 'ZOH'])){
            $skipped++;
            $errors[] = "Invalid OH type '$type' in line: " . json_encode($row, JSON_UNESCAPED_UNICODE);
            continue;
        }

        $gamesId = getOrCreateGames($pdo, $year, $type, $city, $gamesCountryId);

        //Athlete

        $firstName = $get("Meno");
        $lastName = $get("Priezvisko");

        if(!$firstName || !$lastName){
            $skipped++;
            $errors[] = "Skipped line - missing first/last name";
            continue;
        }

        //Attempt to find the athlete based on his first and last name
        $findStmt = $pdo->prepare("
            SELECT id FROM athletes
            WHERE first_name = :fn AND last_name = :ln AND birth_date <=> :bd
            LIMIT 1
        ");


        $findStmt->execute([
            ":fn" => $firstName,
            ":ln" => $lastName,
            ":bd" => $get("DatumNarodenia"),
        ]);

        $athleteId = $findStmt->fetchColumn();

        if(!$athleteId){
            $athleteId = insertAthlete(
                $pdo,
                $firstName,
                $lastName,
                $get("DatumNarodenia"),
                $get("MiestoNarodenia"),
                $birthCountryId,
                $get("DatumUmrtia"),
                $get("MiestoUmrtia"),
                $deathCountryId
            );
        }

        //discipline
        $disciplineName = $get("Disciplina");
        $category = $get("Kategoria");

        if(!$disciplineName){
            $skipped++;
            $errors[] = "Skip the line - lack of discipline";
            continue;
        }

        $discStmt = $pdo->prepare("SELECT id FROM disciplines WHERE name = :name LIMIT 1");
        $discStmt->execute([":name" => $disciplineName]);
        $disciplineId = $discStmt->fetchColumn();

        if(!$disciplineId) {
            $discInsert = $pdo->prepare("INSERT INTO disciplines (name, category) VALUES (:name, :cat)");
            $discInsert->execute([":name" => $disciplineName, ":cat" => $category]);
            $disciplineId = (int)$pdo->lastInsertId();
        }

        //medail type
        $medalName = $get("Medaila");

        if(!$medalName){
            $skipped++;
            $errors[] = "Skip line - missing medal type";
            continue;
        }

        $medalStmt = $pdo->prepare("SELECT id FROM medal_types WHERE name = :name LIMIT 1");
        $medalStmt->execute([":name" => $medalName]);
        $medalTypeId = $medalStmt->fetchColumn();

        if(!$medalTypeId){
            $skipped++;
            $errors[] = "Unknown medal type: $medalName";
            continue;
        }

        $checkStmt = $pdo->prepare("
            SELECT id FROM athlete_medals
            WHERE athlete_id = :aid AND olympic_games_id = :gid AND discipline_id = :did AND medals_type_id = :mid
            LIMIT 1
        ");

        $checkStmt->execute([
            ":aid" => $athleteId,
            ":gid" => $gamesId,
            ":did" => $disciplineId,
            ":mid" => $medalTypeId,
        ]);

        if(!$checkStmt->fetchColumn()){
            $insertStmt = $pdo->prepare("
                INSERT INTO athlete_medals (athlete_id, olympic_games_id, discipline_id, medals_type_id)
                VALUES (:aid, :gid, :did, :mid)
            ");

            $insertStmt->execute([
                ":aid" => $athleteId,
                ":gid" => $gamesId,
                ":did" => $disciplineId,
                ":mid" => $medalTypeId,
            ]);
            $inserted++;
        }
        else 
            $skipped++;
    }

    //commit all
    $pdo->commit();

    echo json_encode([
        "succes" => true,
        "message" => "Import completed. Inserted: $inserted, Skipped: $skipped",
        "inserted" => $inserted,
        "skipped" => $skipped,
        "errors" => $errors,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e){
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
      'error' => 'Issue during import: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}