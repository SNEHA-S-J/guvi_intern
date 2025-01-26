// This code ensures smooth transition effect when clicking on links.
$(document).ready(function() {
  // Smooth scrolling to links (just in case you want to add scrolling transitions)
  $('a').on('click', function(event) {
      // Prevent the default action of the link
      if (this.hash !== "") {
          event.preventDefault();

          // Store hash
          var hash = this.hash;

          // Animate scroll
          $('html, body').animate({
              scrollTop: $(hash).offset().top
          }, 800, function() {
              // Add hash to URL after the scroll
              window.location.hash = hash;
          });
      }
  });
});
