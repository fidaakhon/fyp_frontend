<template>
    <div class="forgot-password-container">
        <h2 class="forgot-password-title">Forgot Password</h2>
        <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
            <!-- Email Field -->
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
                <label>New Password</label>
                <input type="password" id="password" v-model="password" placeholder="Enter your new password"
                    required />
            </div>

            <!-- Submit Button -->
            <button type="submit" class="forgot-password-btn">Reset Password</button>

            <!-- Additional Links -->
            <div class="forgot-password-links">
                <a href="/signin">Back to Sign In</a>
            </div>
        </form>
    </div>
</template>

<script setup>
import router from '@/router/router';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// Reactive email data
const email = ref('');
const password = ref('');

// Forgot password handler
const handleForgotPassword = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/v1/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.value, newPassword: password.value }),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show success message
            toast.success('Password changed successfully');
            router.push('/signin');
        } else {
            // Show error message if the request fails
            toast.error(data.message || 'Failed to send reset email. Please try again.');
        }
    } catch (error) {
        // Handle network or server errors
        toast.error('Failed to send reset email. Please try again.');
    }
};
</script>

<style scoped>
/* Forgot Password Page Styling */
.forgot-password-container {
    width: 100%;
    max-width: 400px;
    margin: 100px auto;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
}

.forgot-password-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.forgot-password-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    margin-top: 15px;
    color: #444;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.form-group input:focus {
    border-color: #3498db;
    outline: none;
}

.forgot-password-btn {
    width: 100%;
    background-color: #3498db;
    color: white;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.forgot-password-btn:hover {
    background-color: #2980b9;
}

.forgot-password-links {
    margin-top: 15px;
    text-align: center;
}

.forgot-password-links a {
    color: #3498db;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s ease;
}

.forgot-password-links a:hover {
    color: #2980b9;
}
</style>