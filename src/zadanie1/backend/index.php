// example/index.php
<?php
//require_once('/var/www/config.php');
require_once(__DIR__ . '/config.php');

$conn = connectDatabase($hostname, $database, $username, $password);
if ($conn) {
    echo "Pripojene k DB.";
}
?>