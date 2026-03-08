<?php

function insertCountry(PDO $pdo, string $name, ?string $code = null): int {
    $sql = "INSERT INTO countries (name, code) VALUES (:name, :code)";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':name' => $name,
        ':code' => $code
    ]);

    return (int) $pdo->lastInsertId();
}

function insertOlympicGames(PDO $pdo, int $year, string $type, string $city, int $countryId): int {
    if (!in_array($type, ['LOH', 'ZOH'])) {
        throw new InvalidArgumentException("Invalid type '$type'. Must be 'LOH' or 'ZOH'.");
    }

    $sql = "INSERT INTO olympic_games (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':year' => $year,
        ':type' => $type,
        ':city' => $city,
        ':country_id' => $countryId
    ]);

    return (int) $pdo->lastInsertId();
}

function insertAthlete(
    PDO $pdo,
    string $firstName,
    string $lastName,
    ?string $birthDate = null,
    ?string $birthPlace = null,
    ?int $birthCountryId = null,
    ?string $deathDate = null,
    ?string $deathPlace = null,
    ?int $deathCountryId = null
): int {
    $sql = "INSERT INTO athletes
            (first_name, last_name, birth_date, birth_place, birth_country_id,
             death_date, death_place, death_country_id)
            VALUES
            (:first_name, :last_name, :birth_date, :birth_place, :birth_country_id,
             :death_date, :death_place, :death_country_id)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':birth_date' => $birthDate,
        ':birth_place' => $birthPlace ?? '',
        ':birth_country_id' => $birthCountryId,
        ':death_date' => $deathDate,
        ':death_place' => $deathPlace ?? '',
        ':death_country_id' => $deathCountryId,
    ]);

    return (int) $pdo->lastInsertId();
}

function getOrCreateCountry(PDO $pdo, string $name): int {
    $stmt = $pdo->prepare("SELECT id FROM countries WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $name]);
    $id = $stmt->fetchColumn();

    if ($id) {
        return (int) $id;
    }

    $stmt = $pdo->prepare("INSERT INTO countries (name, code) VALUES (:name, '')");
    $stmt->execute([':name' => $name]);
    return (int) $pdo->lastInsertId();
}

function getOrCreateGames(PDO $pdo, int $year, string $type, string $city, int $countryId): int {
    $stmt = $pdo->prepare("SELECT id FROM olympic_games WHERE year = :year AND type = :type LIMIT 1");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type
    ]);
    $id = $stmt->fetchColumn();

    if ($id) {
        return (int) $id;
    }

    if (!in_array($type, ['LOH', 'ZOH'])) {
        throw new InvalidArgumentException("Invalid type '$type'. Must be 'LOH' or 'ZOH'.");
    }

    $stmt = $pdo->prepare("INSERT INTO olympic_games (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type,
        ':city' => $city,
        ':country_id' => $countryId
    ]);

    return (int) $pdo->lastInsertId();
}

function getOrCreateMedalType(PDO $pdo, int $placing): int {
    $stmt = $pdo->prepare("SELECT id FROM medal_types WHERE placing = :placing LIMIT 1");
    $stmt->execute([':placing' => $placing]);
    $id = $stmt->fetchColumn();

    if ($id) {
        return (int) $id;
    }

    $names = [1 => 'Zlatá', 2 => 'Strieborná', 3 => 'Bronzová'];
    $descs = [1 => 'Zlatá medaila', 2 => 'Strieborná medaila', 3 => 'Bronzová medaila'];
    $name = $names[$placing] ?? "Umiestnenie $placing";
    $desc = $descs[$placing] ?? "Umiestnenie $placing";

    $stmt = $pdo->prepare("INSERT INTO medal_types (placing, name, description) VALUES (:p, :n, :d)");
    $stmt->execute([':p' => $placing, ':n' => $name, ':d' => $desc]);
    return (int) $pdo->lastInsertId();
}