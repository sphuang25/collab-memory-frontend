<!--Inspired by https://github.com/codingmarket07-->
<template>
  <div class="wrapper">
    <div class="sidebar">
      <h2>fam.ly</h2>
      <ul>
        <li>
          <a href="#"><div class="oval">Home</div></a>
        </li>
        <li>
          <a href="#"><div class="oval">Profile</div></a>
        </li>
        <li>
          <a href="#"><div class="oval">Families</div></a>
        </li>
        <li>
          <a href="#"><div class="oval">Threads</div></a>
        </li>
        <li>
          <a href="#"><div class="oval">Timeline</div></a>
        </li>
        <li>
          <a href="#"><div class="oval">Memories</div></a>
        </li>
        <div class="bottom">
          <li>
            <a href="#"><div class="oval">Settings</div></a>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  list-style: none;
  text-decoration: none;
  font-family: "Josefin Sans", sans-serif;
}

body {
  background-color: #f3f5f9;
}

.wrapper {
  display: flex;
  position: relative;
}

.wrapper .sidebar {
  width: 200px;
  height: 100%;
  background: #ececec;
  padding: 30px 0;
  position: fixed;
}

.wrapper .sidebar h2 {
  color: #3f3f44;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 30px;
}

.wrapper .sidebar ul li {
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper .sidebar ul li a {
  color: #3f3f44;
  font-weight: bold;
  display: flex;
  font-size: 16px;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.wrapper .sidebar ul li a {
  width: 60px;
}

.oval {
  border: 5px solid transparent;
  display: inline-flex;
  border-radius: 20px;
  padding: 5px;
  text-align: center;
  width: auto;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
}

.oval:hover {
  background-color: #d52a26;
}

.wrapper .sidebar ul li a:hover {
  color: #fff;
}

.bottom {
  margin-top: 100%;
}
</style>
