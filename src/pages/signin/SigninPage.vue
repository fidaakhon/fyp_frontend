<template>
  <div class="signin-container">
    <h2 class="signin-title">Welcome Back</h2>
    <form @submit.prevent="handleSignIn" class="signin-form">
      <!-- Username Field -->
      <div class="form-group">
        <label for="username">Email</label>
        <input
          type="text"
          id="email"
          v-model="form.email"
          placeholder="Enter your username"
          required
        />
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          placeholder="Enter your password"
          required
        />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="signin-btn">Sign In</button>

      <!-- Additional Links -->
      <div class="signin-links">
        <a href="#">Forgot Password?</a>
        <a href="/signup">Create an Account</a>
      </div>
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

// Reactive form data
const form = ref({
  email: '',
  password: ''
});



// Sign-in handler
const handleSignIn = () => {
  fetch('http://localhost:8000/api/v1/users/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form.value)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success message
        toast.success('Sign in successful! Redirecting...');
        console.log(data);

        // Redirect to the dashboard
        router.push('/');
      } else {
        // Show error message
        toast.error(data.message);
      }
    })
    .catch(() => {
      // Show error message
      toast.error('An error occurred. Please try again.');
    });
};
</script>

<style scoped>
/* Sign In Page Styling */
.signin-container {
  width: 100%;
  max-width: 400px;
  margin: 100px auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.signin-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.signin-form {
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

.signin-btn {
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

.signin-btn:hover {
  background-color: #2980b9;
}

.signin-links {
  margin-top: 15px;
  text-align: center;
}

.signin-links a {
  color: #3498db;
  font-size: 14px;
  margin: 0 10px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.signin-links a:hover {
  color: #2980b9;
}
</style>
