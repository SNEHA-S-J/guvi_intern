$(document).ready(function() {
    // Handle Registration form submission
    $('#registerForm').submit(function(event) {
        event.preventDefault();  // Prevent form from submitting the default way

        // Collect form data
        var formData = {
            username: $('#username').val(),
            password: $('#password').val(),
            email: $('#email').val()
        };

        // Basic client-side validation
        if (!formData.username || !formData.password || !formData.email) {
            $('#check').text("All fields are required.");
            return;
        }

        // Send the data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '/register',  // Backend route to handle registration
            data: formData,
            dataType: 'json',
            success: function(response) {
                // Display success or error message
                $('#check').text(response.message); 

                // If registration is successful, redirect to login page
                if (response.success) {
                    setTimeout(function() {
                        window.location.href = "/login";  // Redirect to login page
                    }, 2000); // Wait 2 seconds before redirecting
                }

                // Clear feedback message after 3 seconds
                setTimeout(function() {
                    $('#check').text('');
                }, 3000);
            },
            error: function() {
                $('#check').text("An error occurred, please try again.");
            }
        });
    });
});
