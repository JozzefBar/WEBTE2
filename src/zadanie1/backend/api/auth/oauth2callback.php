<?php

//Google OAuth2 login
//this page is set as redirect URI in google cloud
//there will be transfered user after successful autorization


session_start();

//require_once('/var/www/config.php');
//require_once('/var/www/node26.webte.fei.stuba.sk/vendor/vendor/autoload.php');

require_once(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/../../../../vendor/autoload.php');

use Google\Client;
use Google\Service\Oauth2;

$client = new Client();

//$client->setAuthConfig('/var/www/node26.webte.fei.stuba.sk/Z1/backend/client_secret/client_secret_251050637037-srt1v9kdlkvleh4lr3n56q579trn6p7u.apps.googleusercontent.com.json');

//$redirectUri = 'https://node26.webte.fei.stuba.sk/Z1/backend/api/auth/oauth2callback.php';

$client->setAuthConfig(__DIR__ . '/../../client_secret/client_secret_251050637037-srt1v9kdlkvleh4lr3n56q579trn6p7u.apps.googleusercontent.com.json');

$redirectUri = 'http://localhost:8080/zadanie1/backend/api/auth/oauth2callback.php';
$client->setRedirectUri($redirectUri);

//specific scopes
$client->addScope(["email", "profile"]);
$client->setIncludeGrantedScopes(true);
//offline = we get a refresh token, we can restore access without user interaction
$client->setAccessType("offline");


//Step1 - user is not autentified yet -- transfer him to Google
if(!isset($_GET["code"]) && !isset($_GET["error"])){
    //state - random token against CSRF attack
    $state = bin2hex(random_bytes(16));
    $client->setState($state);
    $_SESSION["oauth_state"] = $state;

    $authUrl = $client->createAuthUrl();
    header("Location: " . filter_var($authUrl, FILTER_SANITIZE_URL));
    exit();
}

//STEP2 - Google sent him back with authentication code
if (isset($_GET["code"])){
    //state verification
    if(!isset($_GET["state"]) || $_GET["state"] !== $_SESSION["oauth_state"]){
        http_response_code(403);
        die("Security error: state mismatch. Possible CSRF attack.");
    }

    //switch authentication code for access token
    $token = $client->fetchAccessTokenWithAuthCode($_GET["code"]);

    if(isset($token["error"]))
        die("Google OAuth error: " . $token["error_description"]);

    $client->setAccessToken($token);

    //get information from Google account

    $oauth = new Oauth2($client);
    $accountInfo = $oauth->userinfo->get();
    $googleId = $accountInfo->id;
    $email = $accountInfo->email;
    $firstName = $accountInfo->givenName ?? "";
    $lastName = $accountInfo->familyName ?? "";

    $pdo = connectDatabase($hostname, $database, $username, $password);

    // trying to find account based on google id or email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = :gid OR (email = :email AND auth_type = 'google') LIMIT 1");
    $stmt->execute([":gid" => $googleId, ":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        // let's check if the email exists from local registration
        $stmtLocal = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmtLocal->execute([":email" => $email]);
        $localUser = $stmtLocal->fetch(PDO::FETCH_ASSOC);

        if ($localUser) {
            // Email exists from local auth - attach google_id to it and update auth_type
            $userId = $localUser["id"];
            // If we want to allow login by both, we might just set the google_id
            $stmtUpdate = $pdo->prepare("UPDATE users SET google_id = :gid WHERE id = :uid");
            $stmtUpdate->execute([":gid" => $googleId, ":uid" => $userId]);
        } else {
            // Completely new user
            $stmt = $pdo->prepare("
                INSERT INTO users (first_name, last_name, email, auth_type, google_id)
                VALUES (:fn, :ln, :email, 'google', :gid)
            ");
            $stmt->execute([
                ":fn" => $firstName,
                ":ln" => $lastName,
                ":email" => $email,
                ":gid" => $googleId,
            ]);
            $userId = (int)$pdo->lastInsertId();
        }
    }
    else {
        $userId = $user["id"];
    }

    //Session configuration
    $_SESSION['user_id']    = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['auth_type']  = 'google';

    //record to History
    $pdo->prepare("
        INSERT INTO login_history (user_id, auth_type)
        VALUES (:uid, 'google')
    ")->execute([
        ':uid' => $userId,
    ]);

    // Redirect to React frontend - private zone
    $welcomeName = urlencode($firstName);
    //header("Location: https://node26.webte.fei.stuba.sk/Z1/frontend/dist/?welcome=google&name={$welcomeName}");
    header("Location: http://localhost:5173/dashboard?welcome=google&name={$welcomeName}");
    exit();
}

// Google returned an error (e.g. user denied access)
if (isset($_GET['error'])) {
    //header('Location: https://node26.webte.fei.stuba.sk/Z1/frontend/dist/login?error=oauth_denied');
    header('Location: http://localhost:5173/login?error=oauth_denied');
    exit();

}