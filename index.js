import backupData from "./backupData.js";
const instance = axios.create({
  baseURL:
    "https://cors-anywhere.herokuapp.com/https://dwp-techtest.herokuapp.com/",
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" },
});
let users = [];
let london = ["51.5074", "0.1278"];
let distance;
let table = document.getElementById("table");
let input = document.getElementById("distanceInput");
let livesInLondon = new Set();
input.value = 50;

input.onchange = function () {
  listUsers();
};
instance
  .get("city/London/users")
  .then(function (londonUsers) {
    londonUsers.data.forEach((user) => {
      livesInLondon.add(user.id);
    });
    instance
      .get("users")
      .then(function (allUsers) {
        users = allUsers.data;
        listUsers();
      })
      .catch(function (error) {
        console.log(error);
        users = backupData("");
        listUsers();
      });
  })
  .catch(function (error) {
    console.log(error);
    backupData("London").forEach((user) => {
      livesInLondon.add(user.id);
    });
    users = backupData("");
    listUsers();
  });

function calculateDistance(lat2, lon2) {
  let lat1 = london[0];
  let lon1 = london[1];
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
}

function listUsers() {
  let innerHtml = "";
  let count = 0;
  users.forEach((user) => {
    distance = calculateDistance(user.latitude, user.longitude);
    if (
      input.value == "" ||
      distance <= input.value ||
      livesInLondon.has(user.id)
    ) {
      count++;
      innerHtml +=
        "<tr><td>" +
        user.first_name +
        "</td><td>" +
        user.last_name +
        "</td><td>" +
        user.email +
        "</td></tr>";
    }
  });

  table.innerHTML = innerHtml;
  document.getElementById("resultCount").innerText = count;
}
