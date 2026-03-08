<?php

if (__FILE__ === realpath($_SERVER['SCRIPT_FILENAME'])) {
    $data = [];
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
        $file = $_FILES['csv_file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (strtolower($ext) !== 'csv') {
            die("Povolené sú iba CSV súbory.");
        }
        if ($file['error'] === 0) {
            $data = parseCsvToAssocArray($file['tmp_name'], ";");
        }
    }
    ?>
    <!DOCTYPE html>
    <html lang="sk">
    <head><meta charset="UTF-8"><title>CSV Upload</title></head>
    <body>
    <form method="POST" enctype="multipart/form-data">
        <input type="file" name="csv_file" accept=".csv" required><br><br>
        <button type="submit">Nahrať a spracovať</button>
    </form>
    <?php if (!empty($data)): ?>
        <h3>Obsah súboru:</h3>
        <pre><?php print_r($data); ?></pre>
    <?php endif; ?>
    </body>
    </html>
    <?php
    exit();
}

function parseCsvToAssocArray(string $filePath, string $delimiter = ";"): array
{
    $result = [];
    if (!file_exists($filePath)) {
        die("Súbor neexistuje: " . $filePath);
    }

    $handle = fopen($filePath, 'r');

    if (!$handle) {
        die("Nepodarilo sa otvoriť súbor: " . $filePath);
    }

    $headers = fgetcsv($handle, 0, $delimiter); // Nacitanie hlavicky - prveho riadku suboru. Nazvy v hlavicke sa pouziju ako kluce asoc. pola.

    if (!$headers) {
        fclose($handle);
        die("Súbor nemá hlavičku alebo je prázdny.");
    }

    // Strip UTF-8 BOM from the first header if present
    $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");

    // Parsovanie riadkov
    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
        if (count($row) === count($headers)) {
            $data[] = array_combine($headers, $row);
        }
    }

    // Korektne ukoncenie prace so suborom a vratenie spracovanych dat.
    fclose($handle);
    return $data;
}
?>
