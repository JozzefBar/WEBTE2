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
    // TODO: kontrola, ci argument type splna podmienky ENUM typu (LOH,ZOH)

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
        ':birth_place' => $birthPlace,
        ':birth_country_id' => $birthCountryId,
        ':death_date' => $deathDate,
        ':death_place' => $deathPlace,
        ':death_country_id' => $deathCountryId
    ]);

    return (int) $pdo->lastInsertId();
}

function getOrCreateCountry(PDO $pdo, string $name): int {
    // Najprv najdi, ci krajina s danym nazvom uz existuje.
    $stmt = $pdo->prepare("SELECT id FROM countries WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $name]);
    $id = $stmt->fetchColumn();

    // Ak existuje, vrat jej ID
    if ($id) {
        return (int) $id;
    }

    // Ak neexistuje, vloz novy zaznam a vrat jeho ID.
    $stmt = $pdo->prepare("INSERT INTO countries (name, code) VALUES (:name, NULL)");
    $stmt->execute([':name' => $name]);
    return (int) $pdo->lastInsertId();
}

function getOrCreateGames(PDO $pdo, int $year, string $type, string $city, int $countryId): int {
    // Najdi OH, podla roku konania a typu - kedze sme ich definovali ako UNIQUE
    $stmt = $pdo->prepare("SELECT id FROM olympic_games WHERE year = :year AND type = :type LIMIT 1");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type
    ]);
    $id = $stmt->fetchColumn();

    // Ak existuje, vrat ID.
    if ($id) {
        return (int) $id;
    }

    // TODO: kontrola, ci argument type splna podmienky ENUM typu (LOH,ZOH)

    // Ak neexistuje, vytvor novy zaznam.
    $stmt = $pdo->prepare("INSERT INTO olympic_games (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type,
        ':city' => $city,
        ':country_id' => $countryId
    ]);

    // Vrat ID novovytvoreneho zaznamu.
    return (int) $pdo->lastInsertId();
}