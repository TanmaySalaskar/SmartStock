document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Basic validation (you can add more complex validation here)
    if (username === 'admin' && password === 'password123') {
        window.location.href = 'index.html'; // Redirect to the main page after successful login
    } else {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.style.display = 'block';
    }
});
