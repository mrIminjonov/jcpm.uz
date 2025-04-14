document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('Form yuborilmoqda...'); // Debug uchun
    
    // Form ma'lumotlarini yig'ish
    const formData = {
        givenName: document.getElementById('givenName').value,
        familyName: document.getElementById('familyName').value,
        affiliation: document.getElementById('affiliation').value,
        country: document.getElementById('country').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('repeatPassword').value, // repeatPassword deb o'zgartirildi
        privacyAgreement: document.getElementById('privacyAgreement').checked,
        newsletter: document.getElementById('newsletter').checked
    };

    console.log('Form ma\'lumotlari:', formData); // Debug uchun

    // Parollarni tekshirish
    if (formData.password !== formData.confirmPassword) {
        alert('Parollar mos kelmadi!');
        return;
    }

    if (!formData.privacyAgreement) {
        alert('Shaxsiy ma\'lumotlarni qayta ishlash shartlariga rozilik bildirishingiz kerak!');
        return;
    }

    try {
        console.log('Serverga so\'rov yuborilmoqda...'); // Debug uchun
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Javob olindi:', response); // Debug uchun

        const data = await response.json();
        console.log('Javob ma\'lumotlari:', data); // Debug uchun

        if (response.ok) {
            alert("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi: ' + (data.message || 'Noma\'lum xato'));
        }
    } catch (error) {
        console.error('Xato:', error);
        alert('Serverga ulanishda xatolik: ' + error.message);
    }
});