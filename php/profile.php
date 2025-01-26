<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $age = $_POST['age'];
    $dob = $_POST['dob'];
    $contact = $_POST['contact'];
    $user_id = $_SESSION['user_id'];

    // Simulate database connection
    $db = new mysqli("localhost", "root", "", "your_database");

    if ($db->connect_error) {
        die("Connection failed: " . $db->connect_error);
    }

    $query = "UPDATE users SET age = ?, dob = ?, contact = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("sssi", $age, $dob, $contact, $user_id);

    if ($stmt->execute()) {
        echo "Profile updated successfully!";
    } else {
        echo "Error updating profile!";
    }

    $stmt->close();
    $db->close();
}
?>
