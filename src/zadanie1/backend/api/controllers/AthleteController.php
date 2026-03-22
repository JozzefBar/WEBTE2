<?php

//load config and required model
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../models/Athlete.php';
require_once __DIR__ . '/../Response.php';

class AthleteController
{

    /*
        HTTP RESPONSES

        200 = OK (successful GET, PUT)
        201 = Created (successful POST)
        400 = Bad Request (missing/invalid fields)
        401 = Unauthorized (unregistered)
        404 = Not Found (record does not exist)
        500 = Internal Server Error (DB error)
    */

    private Athlete $athleteModel;

    public function __construct(){
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        if (!$pdo) {
            Response::json(["error" => "Database connection failed"], 500);
        }
        $this->athleteModel = new Athlete($pdo);
    }

    //list all athletes with optional filters
    public function index(){
        $type       = isset($_GET["type"]) && $_GET["type"] !== "" ? $_GET["type"] : null;
        $year       = isset($_GET["year"]) && $_GET["year"] !== "" ? (int)$_GET["year"] : null;
        $placing    = isset($_GET["placing"]) && $_GET["placing"] !== "" ? (int)$_GET["placing"] : null;
        $discipline = isset($_GET["discipline"]) && $_GET["discipline"] !== "" ? $_GET["discipline"] : null;
    
        $athletes = $this->athleteModel->getAll($type, $year, $placing, $discipline);

        $filters = $this->athelteModel->getFilterOptions();

        Response::json([
            "data" => $athletes,
            "filters" => $filters,
        ]);
    }

    //show details of the athlete
    public function show($id)
    {
        $athlete = $this->athleteModel->getById((int)$id);
        if (!$athlete) {
            Response::json(["error" => "Athlete not found"], 404);
        }
        Response::json($athlete);
    }

    //Create a single new athlete
    public function create(){
        session_start();
        if(!isset($_SESSION["user_id"])){
            Response::json(["error" => "Unauthorized"], 401);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        //validation
        if (empty($data["first_name"]) || empty($data["last_name"])) {
            Response::json(["error" => "Missing required fields: first_name, last_name"], 400);
        }

        try {
            $result = $this->athleteModel->create($data);
            Response::json(["message" => "Athlete created", "id" => $result["id"]], 201);
        } catch (\PDOException $e) {
            Response::json(["error" => "Database error: " . $e->getMessage()], 500);
        }
    }

    //Create athletes from JSON array
    public function batchCreate()
    {
        session_start();
        if (!isset($_SESSION["user_id"])) {
            Response::json(["error" => "Unauthorized"], 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (!is_array($data)) {
            Response::json(["error" => "Request body must be a JSON array"], 400);
        }
        try {
            $result = $this->athleteModel->batchCreate($data);
            Response::json([
                "message" => "Batch import completed",
                "inserted" => $result["inserted"],
                "skipped" => $result["skipped"],
                "errors" => $result["errors"],
            ], 201);
        } catch (\Exception $e) {
            Response::json(["error" => "Import error: " . $e->getMessage()], 500);
        }
    }

    //Update an existing athlete
    public function update($id)
    {
        session_start();
        if (!isset($_SESSION["user_id"])) {
            Response::json(["error" => "Unauthorized"], 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data["first_name"]) || empty($data["last_name"])) {
            Response::json(["error" => "Missing required fields: first_name, last_name"], 400);
        }
        // Check if the athlete exists first
        $existing = $this->athleteModel->getById((int)$id);
        if (!$existing) {
            Response::json(["error" => "Athlete not found"], 404);
        }
        try {
            $success = $this->athleteModel->update((int)$id, $data);
            if ($success) {
                Response::json(["message" => "Athlete updated successfully"]);
            } else {
                Response::json(["error" => "No changes were made"], 400);
            }
        } catch (\PDOException $e) {
            Response::json(["error" => "Database error: " . $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        session_start();
        if (!isset($_SESSION["user_id"])) {
            Response::json(["error" => "Unauthorized"], 401);
        }
        $existing = $this->athleteModel->getById((int)$id);
        if (!$existing) {
            Response::json(["error" => "Athlete not found"], 404);
        }
        try {
            $this->athleteModel->delete((int)$id);
            Response::json(["message" => "Athlete deleted successfully"]);
        } catch (\PDOException $e) {
            Response::json(["error" => "Database error: " . $e->getMessage()], 500);
        }
    }
}
