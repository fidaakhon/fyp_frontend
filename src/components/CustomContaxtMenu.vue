<template>
    <div v-if="visible" :style="{ top: `${y}px`, left: `${x + 400}px` }" class="context-menu" @click.stop>
      <ul>
        <li @click="handleAction('edit')">Edit</li>
        <li @click="handleAction('delete')">Delete</li>
        <li @click="handleAction('create-map')">Create Map</li>
        <!-- Add more actions as needed -->
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        visible: false,
        x: 0,
        y: 0,
      };
    },
    methods: {
      show(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
      },
      hide() {
        this.visible = false;
      },
      handleAction(action) {
        this.$emit('action', action);
        this.hide();
      },
    },
  };
  </script>
  
  <style scoped>
  .context-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #d4d4d4;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    padding: 8px 0;
    border-radius: 4px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    min-width: 160px;
    user-select: none;
  }
  
  .context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .context-menu li {
    padding: 8px 16px;
    cursor: pointer;
    color: #333;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .context-menu li:hover {
    background-color: #f2f2f2;
  }
  </style>
  