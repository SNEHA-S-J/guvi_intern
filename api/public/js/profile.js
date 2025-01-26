$(document).ready(function() {
  // Fetch profile data once the page is loaded
  $.ajax({
      type: 'GET',
      url: '/profile', // API route to fetch the profile
      success: function(response) {
          if (response.success) {
              // Populate profile information in the HTML
              $('#username_given').text(response.data.username || "User");
              $('#email').text(response.data.email || "No email provided");
          } else {
              // Handle failure and redirect to login
              $('#error-message').text("Not authenticated. Redirecting to login...").show();
              setTimeout(function() {
                  window.location.href = '/login';
              }, 3000);
          }
      },
      error: function(xhr, status, error) {
          // Handle error and display message before redirecting
          console.error("Error:", error);
          $('#error-message').text("An error occurred. Redirecting to login...").show();
          setTimeout(function() {
              window.location.href = '/login';
          }, 3000); // Redirect after 3 seconds
      }
  });
});
