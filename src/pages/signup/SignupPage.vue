<template>
    <div class="signup-container">
        <h2 class="signup-title">Create Your Account</h2>
        <form @submit.prevent="handleSignup" class="signup-form">
            <!-- Full Name Field -->
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" v-model="form.fullName" placeholder="Enter your full name" required />
            </div>

            <!-- Username Field -->
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" v-model="form.username" placeholder="Choose a username" required />
            </div>

            <!-- Email Field -->
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="form.email" placeholder="Enter your email" required />
            </div>

            <!-- Password Field -->
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="form.password" placeholder="Enter your password"
                    required />
            </div>

            <!-- Submit Button -->
            <button type="submit" class="signup-btn">Sign Up</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useRouter } from 'vue-router';

// Use the useRouter function to access the router instance
const router = useRouter();

// Define reactive form data
const form = ref({
    fullName: '',
    username: '',
    email: '',
    password: '',
});

// Define the handleSignup method
const handleSignup = () => {
    fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.value),
    })
        .then((response) => response.json())
        .then((data) => {
            // Redirect to the login page after successful signup
            console.log('Signup response:', data);
            if (data.success) {
                toast(message || "Registered Succeddfully", {
                    autoClose: 4000
                })
                router.push('/signin');
            } else {
                toast(message || "Something went wrong", {
                    autoClose: 4000
                })
            }
        })
        .catch((error) => {
            toast({
                title: 'Signup Error',
                body: 'An error occurred while creating your account. Please try again.',
                type: 'error',
            });
            console.error('Signup error:', error);
        });
};
</script>


<style scoped>
/* Signup Page Styling */
.signup-container {
    width: 100%;
    max-width: 400px;
    margin: 100px auto;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
}

.signup-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.signup-form {
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

.signup-btn {
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

.signup-btn:hover {
    background-color: #2980b9;
}
</style>