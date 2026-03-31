<?php

declare(strict_types=1);

/**
 * JSON Response helper class.
 * Wraps all API responses in a standard envelope: { "success": bool, "data": ... }
 * Ensures consistent response format across all endpoints.
 */
class Response
{
    /**
     * Send a success JSON response.
     *
     * @param mixed $data The response data payload
     * @param int $statusCode HTTP status code (default 200)
     * @return void
     */
    public static function success(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send an error JSON response.
     *
     * @param string $message Error message to include in response
     * @param int $statusCode HTTP status code (400, 404, 422, 500)
     * @return void
     */
    public static function error(string $message, int $statusCode = 400): void
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'data' => [
                'message' => $message,
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
