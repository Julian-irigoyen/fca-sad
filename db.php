<?php
$host = 'localhost';
$user = 'laticsfc_admindocentes';
$password = 'Laticsfcauach2025*';
$database = 'laticsfc_bdfca';

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8");
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?> 