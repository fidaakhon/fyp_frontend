<template>
    <div class="signin-container">
      <h2 class="signin-title">Welcome Back</h2>
      <form @submit.prevent="handleSignIn" class="signin-form">
        <!-- Username Field -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
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
  
  <script>
  export default {
    data() {
      return {
        form: {
          username: '',
          password: '',
        },
      };
    },
    methods: {
      handleSignIn() {
        // Handle sign-in logic here (e.g., form submission)
        console.log('Sign-in form data:', this.form);
      },
    },
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
  