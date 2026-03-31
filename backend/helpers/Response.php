<?php

declare(strict_types=1);

/**
 * Custom exception thrown by Response helper to halt request processing.
 * Carries the HTTP status code and JSON body for testability.
 */
class ResponseException extends \RuntimeException
{
    /** @var int HTTP status code */
    public int $statusCode;

    /** @var string JSON response body */
    public string $body;

    /**
     * @param int $statusCode HTTP status code
     * @param string $body JSON response body
     */
    public function __construct(int $statusCode, string $body)
    {
        $this->statusCode = $statusCode;
        $this->body = $body;
        parent::__construct($body, $statusCode);
    }
}

/**
 * JSON Response helper class.
 * Wraps all API responses in a standard envelope: { "success": bool, "data": ... }
 * Ensures consistent response format across all endpoints.
 */
class Response
{
    /** @var bool When true, throws ResponseException instead of exit (for testing) */
    public static bool $testMode = false;

    /**
     * Send a success JSON response.
     *
     * @param mixed $data The response data payload
     * @param int $statusCode HTTP status code (default 200)
     * @return void
     * @throws ResponseException In test mode
     */
    public static function success(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        $body = json_encode([
            'success' => true,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
        echo $body;

        if (self::$testMode) {
            throw new ResponseException($statusCode, $body);
        }

        exit;
    }

    /**
     * Send an error JSON response.
     *
     * @param string $message Error message to include in response
     * @param int $statusCode HTTP status code (400, 404, 422, 500)
     * @return void
     * @throws ResponseException In test mode
     */
    public static function error(string $message, int $statusCode = 400): void
    {
        http_response_code($statusCode);
        $body = json_encode([
            'success' => false,
            'data' => [
                'message' => $message,
            ],
        ], JSON_UNESCAPED_UNICODE);
        echo $body;

        if (self::$testMode) {
            throw new ResponseException($statusCode, $body);
        }

        exit;
    }
}
