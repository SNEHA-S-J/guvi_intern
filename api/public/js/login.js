$(document).ready(function() {
  // Handle Login form submission
  $('#loginForm').submit(function(event) {
      event.preventDefault();  // Prevent form from submitting the default way

      // Collect form data
      var formData = {
          email: $('#email').val(),
          password: $('#password').val()
      };

      // Basic client-side validation
      if (!formData.email || !formData.password) {
          $('#check').text("Email and password are required.");
          return;
      }

      // Send the data to the backend using AJAX
      $.ajax({
          type: 'POST',
          url: '/login',  // Backend route to handle login
          data: JSON.stringify(formData),
          contentType: 'application/json',
          dataType: 'json',
          success: function(response) {
              // Display success or error message
              $('#check').text(response.message); 

              // If login is successful, redirect to profile page
              if (response.success) {
                  setTimeout(function() {
                      window.location.href = "profile";  // Redirect to profile.html
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
