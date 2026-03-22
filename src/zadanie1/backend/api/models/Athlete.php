<?php
use Google\Service\PeopleService\Birthday;

require_once __DIR__ . '/../../upload.php';

class Athlete
{
    //Store the PDO database connection
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    //Get all athletes with their medals, same query and logic as in athletes.php

    public function getALL(?string $type = null, ?int $year = null, ?int $placing = null, ?string $discipline = null): array
    {
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

        //Dynamic filter building
        $params = [];

        if ($type !== null) {
            $sql .= "AND og.type = :type";
            $params[":type"] = $type;
        }

        if ($year !== null) {
            $sql .= "AND og.year = :year";
            $params[":year"] = $year;
        }

        if ($placing !== null) {
            $sql .= "AND mt.placing = :placing";
            $params[":placing"] = $placing;
        }

        if ($discipline !== null) {
            $sql .= "AND d.name = :discipline";
            $params[":discipline"] = $discipline;
        }

        $sql .= " ORDER BY a.last_name ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    //GET filter options for dropdowns
    public function getFilterOptions(): array
    {
        $yearStmt = $this->pdo->query("SELECT DISTINCT year FROM olmypic_games ORDER BY year DESC");

        $years = $yearStmt->fetchAll(PDO::FETCH_COLUMN);

        $discStmt = $this->pdo->query("SELECT DISTINCT name FROM disciplines ORDER BY year ASC");
        $disciplines = $discStmt->fetchAll(PDO::FETCH_COLUMN);

        return [
            "years" => $years,
            "disciplines" => $disciplines
        ];
    }

    //GET athlete by his ID - return his info 
    public function getById(int $id): ?array
    {
        //get personal data
        $stmt = $this->pdo->prepare("
        SELECT
            a.id, a.first_name, a.last_name,
            a.birth_date, a.birth_place,
            c_birth.name AS birth_country,
            a.birth_country_id,
            a.death_date, a.death_place,
            c_death.name AS death_country,
            a.death_country_id
        FROM athletes a
        LEFT JOIN countries c_birth ON a.birth_country_id = c_birth.id
        LEFT JOIN countries c_death ON a.death_country_id = c_death.id
        WHERE a.id = :id
        ");

        $stmt->execute([":id" => $id]);
        $athlete = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$athlete)
            return null;

        //get all his medals
        $medalStmt = $this->pdo->prepare("
        SELECT
            am.id AS medal_record_id,
            og.year, og.city AS games_city, og.type AS games_type,
            c_games.name AS games_country,
            d.name AS discipline, d.category,
            mt.name AS medal_name, mt.placing
        FROM athlete_medals am
        JOIN olympic_games og ON am.olympic_games_id = og.id
        JOIN disciplines d ON am.discipline_id = d.id
        JOIN medal_types mt ON am.medal_type_id = mt.id
        LEFT JOIN countries c_games ON og.country_id = c_games.id
        WHERE am.athlete_id = :id
        ORDER BY og.year ASC
        ");

        $medalStmt->execute([":id" => $id]);
        $athlete["medals"] = $medalStmt->fetchAll(PDO::FETCH_ASSOC);

        return $athlete;
    }

    //create a new athlete with medal info
    public function create(array $data): array
    {
        //personal data of athlete
        $firstName = $data["first_name"] ?? null;
        $lastName = $data["last_name"] ?? null;
        $birthDate = $data["birth_date"] ?? null;
        $birthPlace = $data["birth_place"] ?? null;
        $birthCountry = $data["birth_country"] ?? null;
        $deathDate = $data["death_date"] ?? null;
        $deathPlace = $data["death_place"] ?? null;
        $deathCountry = $data["death_country"] ?? null;

        //Medals and game data
        $gameYear = isset($data["year"]) ? (int)$data["year"] : null;
        $gameType = $data["games_type"] ?? null;
        $gameCity = $data["games_city"] ?? null;
        $gameCountry = $data["games_country"] ?? null;
        $discipline = $data["discipline"] ?? null;
        $placing = isset($data["placing"]) ? (int)$data["placing"] : null;

        $birthCountryId = $birthCountry ? getOrCreateCountry($this->pdo, $birthCountry) : null;
        $deathCountryId = $deathCountry ? getOrCreateCountry($this->pdo, $deathCountry) : null;

        //check if athlete exists (<=> returns true even when both sides are NULL)
        $findStmt = $this->pdo->prepare(
            "SELECT id FROM athletes
            WHERE first_name :fn AND last_name :ln AND birthdate <=> : bd
            LIMIT 1"
        );

        $findStmt->execute([
            ":fn" => $firstName,
            ":ln" => $lastName,
            ":bd" => $birthDate,
        ]);
        $athleteId = $findStmt->fetchColumn();

        if (!$athleteId) {
            $insertStmt = $this->pdo->prepare("
                INSERT INTO athletes (first_name, last_name, birth_date, birth_place, birth_country_id,
                                        death_date, death_place, death_country_id)
                VALUES (:fn, :ln, :bd, :bp, :bci, :dd, :dp, :dci)    
            ");
            $insertStmt->execute([
                ":fn" => $firstName,
                ":ln" => $lastName,
                ":bd" => $birthDate,
                ":bp" => $birthPlace,
                ":bci" => $birthCountryId,
                ":dd" => $deathDate,
                ":dp" => $deathPlace,
                ":dci" => $deathCountryId,
            ]);

            $athleteId = (int)$this->pdo->lastInsertId();
        }

        //if medal is provided, add the medal record for this athlete
        if ($gameYear && $gameType && $gameCity && $gameCountry && $discipline && $placing) {
            $gameCountryId = getOrCreateCountry($this->pdo, $gameCountry);
            $gamesId = getOrCreateGames($this->pdo, $gameYear, $gameType, $gameCity, $gameCountryId);
            $disciplineId = getOrCreateDiscipline($this->pdo, $discipline);
            $medalTypeId = getOrCreateMedalType($this->pdo, $placing);

            $checkStmt = $this->pdo->prepare("
            SELECT id FROM athlete_medals
            WHERE athlete_id = :aid AND olympic_games_id = :gid AND discipline_id = :did AND medal_type_id = :mid
            LIMIT 1
        ");

            $checkStmt->execute([
                ":aid" => $athleteId,
                ":gid" => $gamesId,
                ":did" => $disciplineId,
                ":mid" => $medalTypeId,
            ]);

            if (!$checkStmt->fetchColumn()) {
                $medalStmt = $this->pdo->prepare("
                INSERT INTO athlete_medals (athlete_id, olympic_games_id, discipline_id, medal_type_id)
                VALUES (:aid, :gid, :did, :mid)
            ");
                $medalStmt->execute([
                    ":aid" => $athleteId,
                    ":gid" => $gamesId,
                    ":did" => $disciplineId,
                    ":mid" => $medalTypeId,
                ]);
            }
        }

        return ["id" => $athleteId];
    }

    //Update existing athlete
    public function update(int $id, array $data): bool
    {
        //personal data of athlete
        $firstName = $data["first_name"] ?? null;
        $lastName = $data["last_name"] ?? null;
        $birthDate = $data["birth_date"] ?? null;
        $birthPlace = $data["birth_place"] ?? null;
        $birthCountry = $data["birth_country"] ?? null;
        $deathDate = $data["death_date"] ?? null;
        $deathPlace = $data["death_place"] ?? null;
        $deathCountry = $data["death_country"] ?? null;

        $birthCountryId = $birthCountry ? getOrCreateCountry($this->pdo, $birthCountry) : null;
        $deathCountryId = $deathCountry ? getOrCreateCountry($this->pdo, $deathCountry) : null;
    
        $stmt = $this->pdo->prepare("
            UPDATE athletes SET
                first_name = :fn,
                last_name = :ln,
                birth_date = :bd,
                birth_place = :bp,
                birth_country_id = :bci,
                death_date = :dd,
                death_place = :dp,
                death_country_id = :dci
            WHERE id = :id
        ");

        $stmt->execute([
            ":fn" => $firstName,
            ":ln" => $lastName,
            ":bd" => $birthDate,
            ":bp" => $birthPlace,
            ":bci" => $birthCountryId,
            ":dd" => $deathDate,
            ":dp" => $deathPlace,
            ":dci" => $deathCountryId,
            ":id" => $id,
        ]);

        return $stmt->rowCount() > 0;
    }

    //Delete athlete and all their medals
    public function delete(int $id): bool{
        //Must delete medals first and then the athlete
        $delMedals = $this->pdo->prepare("DELETE FROM athlete_medals WHERE athlete_id = :id");
        $delMedals->execute([":id" => $id]);

        $delAthlete = $this->pdo->prepare("DELETE FROM athletes WHERE id = :id");
        $delAthlete->execute([":id" => $id]);

        return $delAthlete->rowCount() > 0;
    }

    //Batch create, add multiple athletes from JSON
    public function batchCreate(array $items): array {
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        $this->pdo->beginTransaction();

        try{
            foreach($items as $index => $item){
                if(empty($item["first_name"]) || empty($item["last_name"])){
                    $skipped++;
                    $errors[] = "V riadku $index: chýba meno alebo priezvisko";
                    continue;
                }

                $this->create($item);
                $inserted++;
            }

            $this->pdo->commit();
        }  catch (Exception $e){
            $this->pdo->rollback();
            throw $e;
        }

        return [
            "inserted" => $inserted,
            "skipped" => $skipped,
            "errors" => $errors,
        ];
    }
}