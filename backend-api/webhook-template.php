<?php
/**
 * SERVER-LOCAL DEPLOYMENT WEBHOOK (TEMPLATE ONLY)
 * ===============================================
 *
 * IMPORTANT SECURITY INSTRUCTIONS:
 * 1. DO NOT commit this file to your public repository if it contains your real secret token.
 * 2. This file should be placed on the server manually.
 * 3. RENAME this file to an unguessable name. (e.g., `webhook-deploy-9a8f3c.php`).
 * 4. Ensure your server's `.env` file containing `DEPLOY_SECRET_TOKEN` is located safely
 *    OUTSIDE the `public_html` or web-accessible directory.
 */

// 1. Enforce HTTP Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'method not allowed']);
    exit;
}

// 2. Locate and Load Secret Token Safely
// Example: The main Laravel .env is usually one level above public/
$secretFilePath = dirname(__DIR__) . '/.env'; 
$expectedToken = '';

if (file_exists($secretFilePath)) {
    $envVariables = parse_ini_file($secretFilePath);
    if (isset($envVariables['DEPLOY_SECRET_TOKEN'])) {
        $expectedToken = $envVariables['DEPLOY_SECRET_TOKEN'];
    }
}

if (empty($expectedToken)) {
    http_response_code(500);
    echo json_encode(['status' => 'server configuration error']);
    exit;
}

// 3. Verify Authorization Header (e.g., X-Deploy-Token)
$receivedToken = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';

if (empty($receivedToken) || !hash_equals($expectedToken, $receivedToken)) {
    http_response_code(403);
    echo json_encode(['status' => 'forbidden']);
    exit;
}

// 4. Set Execution Paths
// Use absolute paths configured specifically for your server
$projectRoot = dirname(__DIR__); // Assuming this script sits in <project_root>/public initially
$deployScript = $projectRoot . '/backend-api/deploy.sh';

// Verify the bash script exists
if (!is_file($deployScript)) {
    http_response_code(500);
    echo json_encode(['status' => 'deploy script missing']);
    exit;
}

// 5. Asynchronous Background Execution
// We pipe stdout and stderr to /dev/null and run in the background (&)
// Action logging happens inside deploy.sh, avoiding terminal output in this HTTP response.
$command = "cd " . escapeshellarg($projectRoot) . " && bash " . escapeshellarg($deployScript) . " > /dev/null 2>&1 &";
shell_exec($command);

// 6. Minimal Safe JSON Response
http_response_code(200);
echo json_encode(['status' => 'deployment queued']);
exit;
