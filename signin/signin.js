document.getElementById('sign-in-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const signInMessage = document.getElementById('sign-in-message');

    // Simple validation
    if (username && password) {
        // Store user data in local storage
        localStorage.setItem('username', username);
        localStorage.setItem('password', password); // Consider storing a hashed password for security

        signInMessage.textContent = 'Account created successfully! You can now log in.';
        signInMessage.style.color = 'green';
        signInMessage.style.display = 'block';
    } else {
        signInMessage.textContent = 'Please fill in all fields.';
        signInMessage.style.color = 'red';
        signInMessage.style.display = 'block';
    }
});
