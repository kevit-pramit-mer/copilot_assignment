<?php

declare(strict_types=1);

/**
 * Entry point for the Task Management REST API.
 * Handles routing: parses the URI and HTTP method, dispatches to TaskController.
 * Sets CORS headers and JSON content type for all responses.
 */

// Set response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/controllers/TaskController.php';
require_once __DIR__ . '/helpers/Response.php';

// Parse the request URI — strip the base path to get the API route
$basePath = '/github_copilot_assignment/backend';
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = str_replace($basePath, '', $requestUri);
$route = '/' . trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON request body for POST/PUT
$data = [];
if (in_array($method, ['POST', 'PUT'])) {
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        $data = json_decode($rawBody, true) ?? [];
    }
}

// Initialize controller
$controller = new TaskController();

// Route matching
// GET    /api/tasks          → index
// POST   /api/tasks          → store
// GET    /api/tasks/stats    → stats
// GET    /api/tasks/:id      → show
// PUT    /api/tasks/:id      → update
// DELETE /api/tasks/:id      → destroy
// POST   /api/tasks/:id/complete → complete

try {
    if ($route === '/api/tasks' && $method === 'GET') {
        $controller->index();
    } elseif ($route === '/api/tasks' && $method === 'POST') {
        $controller->store($data);
    } elseif ($route === '/api/tasks/stats' && $method === 'GET') {
        $controller->stats();
    } elseif (preg_match('#^/api/tasks/([a-f0-9\-]+)/complete$#i', $route, $matches) && $method === 'POST') {
        $controller->complete($matches[1]);
    } elseif (preg_match('#^/api/tasks/([a-f0-9\-]+)$#i', $route, $matches)) {
        $id = $matches[1];
        match ($method) {
            'GET' => $controller->show($id),
            'PUT' => $controller->update($id, $data),
            'DELETE' => $controller->destroy($id),
            default => Response::error('Method not allowed', 405),
        };
    } else {
        Response::error('Route not found', 404);
    }
} catch (\Exception $e) {
    error_log('Router error: ' . $e->getMessage());
    Response::error('An unexpected error occurred', 500);
}
