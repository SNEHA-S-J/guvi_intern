<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $email = $_POST['email'];
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Simulate database connection
    $db = new mysqli("localhost", "root", "", "your_database");

    if ($db->connect_error) {
        die("Connection failed: " . $db->connect_error);
    }

    // Check if the username already exists
    $query = "SELECT * FROM users WHERE username = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "Username already taken!";
    } else {
        // Insert new user into the database
        $query = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->bind_param("sss", $username, $hashed_password, $email);

        if ($stmt->execute()) {
            echo "Registration successful!";
        } else {
            echo "Error during registration!";
        }
    }

    $stmt->close();
    $db->close();
}
?>
