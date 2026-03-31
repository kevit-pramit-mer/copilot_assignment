<?php

declare(strict_types=1);

/**
 * Database connection class using PDO singleton pattern.
 * Connects to MySQL with error handling and UTF-8 charset.
 * Returns the same PDO instance across the application.
 */
class Database
{
    /** @var PDO|null Singleton PDO instance */
    private static ?PDO $instance = null;

    /** @var string Database host */
    private const DB_HOST = 'localhost';

    /** @var string Database name */
    private const DB_NAME = 'task_manager';

    /** @var string Database username */
    private const DB_USER = 'root';

    /** @var string Database password */
    private const DB_PASS = '';

    /**
     * Get the singleton PDO database connection instance.
     *
     * @return PDO The PDO connection instance
     * @throws PDOException If connection fails
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=utf8mb4',
                self::DB_HOST,
                self::DB_NAME
            );

            self::$instance = new PDO($dsn, self::DB_USER, self::DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }

        return self::$instance;
    }

    /**
     * Prevent direct instantiation (singleton pattern).
     */
    private function __construct()
    {
    }

    /**
     * Prevent cloning (singleton pattern).
     */
    private function __clone()
    {
    }
}
