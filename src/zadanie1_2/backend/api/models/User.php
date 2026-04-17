<?php

class User
{
    // Store the PDO database connection internally
    private PDO $pdo;

    // The constructor forces you to provide an active database connection
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Insert a new user into the database and return the newly generated numeric ID
    public function create(string $firstName, string $lastName, string $email, string $password): int
    {
        // Hash the password securely instead of saving it in plain-text
        $hash = password_hash($password, PASSWORD_DEFAULT);

        // SQL Query to insert the record (using placeholders to prevent SQL injection)
        $sql = "INSERT INTO users 
                (first_name, last_name, email, password_hash)
                VALUES (:first_name, :last_name, :email, :password_hash)";

        // Prepare the query before execution
        $stmt = $this->pdo->prepare($sql);

        // Execute the query by binding actual variables to the placeholders
        $stmt->execute([
            ":first_name" => $firstName,
            ":last_name" => $lastName,
            ":email" => $email,
            ":password_hash" => $hash
        ]);

        // Return the auto-incremented ID of the newly inserted row
        return (int)$this->pdo->lastInsertId();
    }

    // Retrieve a single user from the database by ID
    public function getById(int $id): ?array
    {
        $sql = "SELECT id, first_name, last_name, email, created_at
                FROM users
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([":id" => $id]);

        // Fetch a single row as an associative array
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function getByEmail(string $email): ?array
    {
        // Check if an email address already exists
        $sql = "SELECT id, first_name, last_name, email, created_at
                    FROM users
                    WHERE email = :email";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([":email" => $email]);

        // Fetch a single row as an associative array
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function getAll(): array
    {
        // Get all users
        $sql = "SELECT id, first_name, last_name, email, created_at
                FROM users
                ORDER BY id ASC";

        $stmt = $this->pdo->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    }

    public function update(int $id, string $firstName, string $lastName): bool
    {
        //Update first_name and last_name of user
        $sql = "UPDATE users
                SET first_name = :first_name, last_name = :last_name
                WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ":first_name" => $firstName,
            ":last_name" => $lastName,
            ":id" => $id
        ]);
        
        return $stmt->rowCount() > 0;
    }

    public function changePassword(int $id, string $password): bool
    {
        // Change user password explicitly
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        
        $sql = "UPDATE users
                SET password_hash = :password_hash
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            "password_hash" => $hash,
            "id" => $id
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        // Perform deletion
        $sql = "DELETE FROM users WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            "id" => $id
        ]);

        return $stmt->rowCount() > 0;
    }

    public function verifyPassword(string $email, string $password): bool
    {
        // Used during login to compare plain text pass with db hash
        $user = $this->getByEmail($email);

        if(!$user)
            return false;

        return password_verify($password, $user["password_hash"]);
    }
}