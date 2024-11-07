<template>
  <div class="container">
    <div class="template-container">
      <h3>Templates</h3>
      <div @click="createMindMap" class="blank-map">
        <span style="font-size: 40px;">+</span>
        <span>Blank Map</span>
      </div>
      <button @click="logout">logout</button>
    </div>
    <div>
      <h3>All Maps</h3>
      <table>
        <thead>
          <tr>
            <th style="column-width: 300px;">Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mindmap in mindmaps" :key="mindmap.id">
            <RouterLink :to="`/mindmap/${mindmap.id}`">
              <td>{{ mindmap?.title }}</td>
            </RouterLink>
            <td>
              <button @click="openMindMap(mindmap.id)">Open</button>
              <button @click="deleteMindMap(mindmap.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
// import { useMindmapsStore } from '@/store/useMindmapsStore';

// const maps = useMindmapsStore();

// console.log(maps.mindmaps)

const currentUser = ref(null);

onMounted(() => {
  fetch('http://localhost:8000/api/v1/users/current-user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

    .then((response) => response.json())
    .then((data) => {
      currentUser.value = data.data._id;
      console.log('current userrrr', currentUser.value);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

});




const mindmaps = ref([]);
// const currentMindMap = ref([]);

// http://localhost:8000/api/v1/users/create-mindmap

const router = useRouter();
// onMounted(() => {
//   if (JSON.parse(localStorage.getItem('mindMapList'))) {
//     console.log(JSON.parse(localStorage.getItem('mindMapList')), '>>> locl storage');
//     mindmaps.value = JSON.parse(localStorage.getItem('mindMapList'))
//   } else {
// mindmaps.value.push({
//   id: 1,
//   title: `Mind Map 1`,
//   nodes: {
//     id: 1,
//     label: 'My Hive',
//     color: '#6BF58A',
//     textColor: 'black',
//     editing: false,
//     borderShape: '',
//     borderStyle: "solid",
//     type: 'root',
//     history: [],
//     children: [
//       {
//         id: 2,
//         label: 'Consumer App',
//         color: '#6BF58A',
//         textColor: 'black',
//         editing: false,
//         children: [{
//           id: 20,
//           label: 'Initial app setup',
//           color: '#6BF58A',
//           textColor: 'black',
//           editing: false,
//           children: [{
//             id: 21,
//             label: 'Onboarding',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 22,
//             label: ' Authentication',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [{
//               id: 222,
//               label: ' User can log in by providing their mobile number',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             }, {
//               id: 223,
//               label: 'User can log in using email and password',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             },],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 23,
//             label: ' Explore',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 24,
//             label: 'Bookings',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           },],
//           type: 'milestone',
//           borderShape: '',
//           borderStyle: "solid",
//           history: [],
//         },],
//         type: 'module',
//         borderShape: '',
//         borderStyle: "solid",
//         history: [],
//       },
//       {
//         id: 3,
//         label: 'Provider App',
//         color: '#6BF58A',
//         textColor: 'black',
//         editing: false,
//         children: [{
//           id: 31,
//           label: ' Initial app setup',
//           color: '#6BF58A',
//           textColor: 'black',
//           editing: false,
//           children: [{
//             id: 321,
//             label: ' Onboarding',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 322,
//             label: ' Authentication',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [{
//               id: 3222,
//               label: 'User can log in by providing their mobile number',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             }, {
//               id: 3223,
//               label: 'User can log in using email and password',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             },],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 323,
//             label: 'Explore',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 324,
//             label: 'Bookings',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           },],
//           type: 'milestone',
//           borderShape: '',
//           borderStyle: "solid",
//           history: [],
//         },],
//         type: 'module',
//         borderShape: '',
//         borderStyle: "solid",
//         history: [],
//       },
//       {
//         id: 4,
//         label: 'Company App',
//         color: '#6BF58A',
//         textColor: 'black',
//         editing: false,
//         children: [{
//           id: 41,
//           label: 'Initial app setup',
//           color: '#6BF58A',
//           textColor: 'black',
//           editing: false,
//           children: [{
//             id: 241,
//             label: 'Onboarding',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 242,
//             label: 'Authentication',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [{
//               id: 2242,
//               label: 'User can log in by providing their mobile number',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             }, {
//               id: 2243,
//               label: 'User can log in using email and password',
//               color: '#6BF58A',
//               textColor: 'black',
//               editing: false,
//               children: [],
//               type: 'story',
//               borderShape: '',
//               borderStyle: "solid",
//               history: [],
//             },],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 423,
//             label: 'Explore',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           }, {
//             id: 424,
//             label: 'Bookings',
//             color: '#6BF58A',
//             textColor: 'black',
//             editing: false,
//             children: [],
//             type: 'feature',
//             borderShape: '',
//             borderStyle: "solid",
//             history: [],
//           },],
//           type: 'milestone',
//           borderShape: '',
//           borderStyle: "solid",
//           history: [],
//         },],
//         type: 'module',
//         borderShape: '',
//         borderStyle: "solid",
//         history: [],
//       },

//     ],
//   }
// })
//     localStorage.setItem('mindMapList', JSON.stringify(mindmaps.value))
//   }
// })
// Function to create a new mind map

watch(currentUser, () => {
  if (currentUser != null) {
    fetch(`http://localhost:8000/api/v1/mindmaps/get-all-mindmaps/${currentUser.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        console.log(data, '>>> data all maps');
        mindmaps.value = data.message;
        // console.log(mindmaps.value, '>>>>>>>> mindmaps');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  // maps.initialize();
  // mindmaps.value = maps.mindmaps;
})


function createMindMap() {
  // const newMindMap = {
  //   id: mindmaps.value.length + 1,
  //   title: `Mind Map ${mindmaps.value.length + 1}`,
  //   nodes: {
  //     id: 1,
  //     label: 'Root Node',
  //     color: '#6BF58A',
  //     textColor: 'black',
  //     editing: false,
  //     borderShape: '',
  //     borderStyle: "solid",
  //     type: 'root',
  //     history: [],
  //     children: []
  //   }
  // };
  // mindmaps.value.push(newMindMap);
  // localStorage.setItem('mindMapList', JSON.stringify(mindmaps.value));
  // Navigate to the new mind map's route
  router.push(`/mindmap/${mindmaps.value.length + 1}`);
}

function openMindMap(id) {
  router.push(`/mindmap/${id}`);
}

function deleteMindMap(id) {
  // mindmaps.value = mindmaps.value.filter((mindmap) => mindmap.id !== id);
  // localStorage.setItem('mindMapList', JSON.stringify(mindmaps.value));
  fetch(`http://localhost:8000/api/v1/mindmaps/delete-mindmap/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
  })
    .then(response => response.json())
    .then(data => {
      console.log(data, '>>> data');
      mindmaps.value = mindmaps.value.filter((mindmap) => mindmap.id !== id);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function logout() {
  fetch('http://localhost:8000/api/v1/users/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
    .then(response => response.json())
    .then(data => {
      toast.success(data.message || 'Logout successful! Redirecting...');
      router.push('/signin');
    })
    .catch((error) => {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    });
}

</script>

<style scoped>
a:-webkit-any-link {
  text-decoration: none;
  color: black;
}

table {
  width: 100%;
}

td,
th {
  padding: 20px;
}

tr {
  overflow: hidden;
  padding: 20px;
  border-radius: 20px;
}

tr:nth-child(even),
thead {
  background: #3cc553b0;
  color: black;
}

.blank-map {
  cursor: pointer;
  width: 100px;
  height: 80px;
  background: #000;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 30px;
  padding: 20px;
}

.blank-map h1 {
  font-size: 40px;
}

.container {
  width: 100%;
  max-width: 1440px;
  margin: auto;
  padding: 20px;
}

button {
  background: #3cc553;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  margin: 0px 15px;
}
</style>