<template>
  <RouterView />
</template>


<script setup>
import { watch } from 'vue';
import {  useRouter } from 'vue-router';

const router = useRouter();




watch(() => {
  fetch('http://localhost:8000/api/v1/users/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      router.push('/signin');
      console.error('Error:', error);
    });

});

</script>
<style></style>
