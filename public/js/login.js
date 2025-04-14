document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier,
                password,
                rememberMe
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token to localStorage if rememberMe is checked
            if (rememberMe) {
                localStorage.setItem('authToken', data.token);
            } else {
                sessionStorage.setItem('authToken', data.token);
            }
            
            // Redirect to dashboard or home page
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});