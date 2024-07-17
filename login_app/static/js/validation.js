document.getElementById('registerForm').addEventListener('submit', function(event) {
    var email = document.getElementById('email').value;
    var mobile = document.getElementById('mobile').value;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var mobilePattern = /^[0-9]{10}$/;

    if (!emailPattern.test(email)) {
        alert('Invalid email address');
        event.preventDefault();
    } else if (!mobilePattern.test(mobile)) {
        alert('Invalid mobile number');
        event.preventDefault();
    }
});
