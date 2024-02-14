import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  query,
  orderByValue,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2kxlr7wEuX8SL4Jap9GNpNtQlFfay2AE",
  authDomain: "kura-coffee.firebaseapp.com",
  databaseURL:
    "https://kura-coffee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kura-coffee",
  storageBucket: "kura-coffee.appspot.com",
  messagingSenderId: "520260474822",
  appId: "1:520260474822:web:80beb53f109080627444c7",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
var menu;
var orders = [];
var orderModel = [];
var sugarLevel = ["No Sugar", "Little S.", "Half S.", "Less S.", "Normal S."];
var billTotal = 0;
var onDays = [];
var modalInstance = null;
var modelElem = document.querySelector("#menuModal");
var receipt = "";
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

$("#preOrder").on("click", function () {
  console.log(getDteId());
  let error = false;
  $("#modalText").html("");

  if ($("#name").val().trim() == "") {
    $("#modalText").html("Sorry, but you need to fix these :( <ul>");
    $("#modalText").append(
      '<li name="error" class="invalid">You have to input your name</li>'
    );
  }
  if ($("#waNum").val().trim() == "") {
    error = true;
    $("#modalText").append(
      '<li name="error" class="invalid">You have to input your Whatsapp number</li>'
    );
  }
  if ($("#location").val() == "-") {
    error = true;
    $("#modalText").append(
      '<li name="error" class="invalid">You have to select your location</li>'
    );
  }
  if ($('tr[name*="orderTbl"]').length == 0) {
    error = true;
    $("#modalText").append(
      '<li name="error" class="invalid">You have to add more item(s).</li>'
    );
  }

  $("#modalText").append("</ul>");
  if (error) {
    $("#confirmOrder").text("Okay");
  } else {
    $("#confirmOrder").text("Order");

    $("#modalText").append("<h1> Are you sure your order(s) are correct?</h1>");

    var name = $("#name").val();
    var wanum = $("#waNum").val();
    var location = $("#location").val();

    receipt = "";
    receipt += "Name : " + name.trim() + "<br>";
    receipt += "Phone Number : " + wanum.trim() + "<br>";
    receipt += "Location : " + location.trim() + "<br>";
    receipt += rpad("", "=", 35) + "<br>";
    for (var i in onDays) {
      var order = $(`td[name*="order${i}"]`);
      var price = $(`td[name*="price${i}"]`);
      for (var j = 0; j < order.length; j++) {
        var day = onDays[i].day.substring(0, 3) + ", " + onDays[i].date;
        var priceStr = price[j].innerText
          .replace("X", "")
          .replace("IDR", "")
          .replace(String.fromCharCode(160), " ")
          .replace(" ", "");
        receipt +=
          rpad(day, " ", 12) +
          "| " +
          rpad(order[j].innerText, "\xa0", 20) +
          " | " +
          rpad(priceStr, " ", 6) +
          "<br>";
      }
    }
    receipt += rpad("", "=", 35) + "<br>";
    receipt += "Total " + $("#total")[0].innerText;
    $("#modalText").append(`<p>${receipt} </p>`);
  }
});
function rpad(toPad, padChar, length) {
  if (toPad.length > length) return toPad.substring(0, length - 1);
  var ret = toPad;
  for (var i = toPad.length; i < length; i++) {
    ret += padChar;
  }
  return ret;
}

$("#confirmOrder").on("click", function () {
  if ($('li[name*="error"]').length == 0) {
    updateDatabase();
    $('tr[name*="orderTbl"]').remove();
    $("#billingsDetail").html(`
          <tr>
						<td colspan="10">No Item</td>
					</tr>`);
    billTotal = 0;
    $("#total").html(`<strong>${formatter.format(billTotal)}</strong>`);
    $("#name").val("");
    $("#waNum").val("");
    $("#location").val("-");
  }
});

$("#").on("shown.bs.modal", function () {
  $("#modal").trigger("focus");
});

function updateDatabase() {
  var name = $("#name").val();
  var wanum = $("#waNum").val();
  var location = $("#location").val();
  for (var i in onDays) {
    var order = $(`td[name*="order${i}"]`);
    var price = $(`td[name*="price${i}"]`);
    console.log("ORDER", order);
    console.log("PRICE");
    for (var j = 0; j < order.length; j++) {
      // try {
      pushOrder(
        noSpace(order[j].innerText),
        onDays[i],
        name,
        location,
        wanum,
        price[j].innerText
      );
      // } catch (err) {}
    }
  }
  pushReceipt();
}

function pushReceipt() {
  const id = getDteId();
  var value = receipt;
  value = value.replaceAll(new RegExp("<br>", "g"), "%0A");
  value = value.replaceAll(new RegExp(" ", "g"), "+");
  value = value.replaceAll(new RegExp(String.fromCharCode(160), "g"), "+");
  const name = $("#name").val().trim();
  var wanum = $("#waNum").val().trim();
  set(ref(database, "receipts/" + noSpace(name) + "_" + getDteId()), {
    num: wanum,
    msg: value,
  });
}

function pushOrder(order, day, name, location, wanum, price) {
  set(
    ref(
      database,
      "orders/" + day.day + "/" + order + "_" + noSpace(name) + "_" + getDteId()
    ),
    {
      wanum: wanum,
      name: name,
      loc: location,
      price: price,
    }
  );
}

function getDteId() {
  var date = new Date();
  return date.getDay() + date.getTime().toString();
}

const sorter = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
};
function loadMenu() {
  // Add ref of child if any
  onValue(ref(database, "onDays"), (snapshot) => {
    const data = snapshot.val();
    for (var key in data) {
      onDays.push({ day: key, date: data[key] });
    }
    onDays.sort(function sortByDay(a, b) {
      let day1 = a.day.toLowerCase();
      let day2 = b.day.toLowerCase();
      return sorter[day1] - sorter[day2];
    });
  });
  menu = ref(database, "Menu");
  // Add ref of child if any
  onValue(menu, (snapshot) => {
    const data = snapshot.val();
    const menuCoffee = data["Coffee"];
    const menuNonCoffee = data["Non Coffee"];

    for (var key in menuCoffee) {
      let id = noSpace(key);
      $("#menuCoffeeItems").append(
        `<div id="${id}" class="shadow border p-3 mb-5 row bg-white rounded">
                  <div class="col flex flex-column">
                    <Strong class="col">${key}</strong>
                    <p> ${formatter.format(menuCoffee[key].price)}</p>
                  </div>
                  <div class="col d-flex flex-row-reverse">
                    <button type="button" class="btn btn-light" 
                      data-bs-toggle="collapse" data-bs-target="#submenu${id}">+</button>
                  </div>
                  <div class="collapse" id="submenu${id}">
                    <div id="detail${id}">
                    </div>
                    <div class="col d-flex flex-row-reverse">
                      <button type="button" id="${id}Btn" class="btn btn-light m-3" 
                            data-bs-toggle="collapse" data-bs-target="#submenu${id}">Put Order</button>
                    </div>
                  </div>
              </div>
              `
      );
      //add days and sugar details
      for (var i in onDays) {
        var day = onDays[i];

        $("#detail" + id).append(`
              <div class="card card-body mb-2 d-flex flex-column">
              <div class="text-start p-1">${day.day}, ${day.date}</div>
              <div class="p-1 text-end">
                  <select id="${day.day + id}" class="form-select mb-3">
                    <option selected value="-">Want to order?</option>
                    <option value="0">No Sugar (0%)</option>
                    <option value="1">Little Sugar (25%)</option>
                    <option value="2">Half Sugar (50%)</option>
                    <option value="3">Less Sugar (75%)</option>
                    <option value="4">Normal Sugar (100%)</option>
                  </select>
                </div>
              </div>`);
      }

      const name = key;
      const price = menuCoffee[key].price;

      document
        .getElementById(id + "Btn")
        .addEventListener("click", function () {
          addCart(name, price, id);
          for (var i in onDays) {
            var day = onDays[i];
            $(`#${day.day + id}`).val("-");
          }
        });
    }

    for (var key in menuNonCoffee) {
      let id = noSpace(key);
      $("#menuNonCoffeeItems").append(
        `<div id="${id}" class="shadow border p-3 mb-5 row bg-white rounded">
                  <div class="col flex flex-column">
                    <Strong class="col">${key}</strong>
                    <p> ${formatter.format(menuNonCoffee[key].price)}</p>
                  </div>
                  <div class="col d-flex flex-row-reverse">
                    <button type="button" class="btn btn-light" 
                      data-bs-toggle="collapse" data-bs-target="#submenu${id}">+</button>
                  </div>
                  <div class="collapse" id="submenu${id}">
                    <div id="detail${id}">
                    </div>
                    <div class="col d-flex flex-row-reverse">
                      <button type="button" id="${id}Btn" class="btn btn-light m-3" 
                            data-bs-toggle="collapse" data-bs-target="#submenu${id}">Put Order</button>
                    </div>
                  </div>
              </div>
              `
      );
      //add days and sugar details
      for (var i in onDays) {
        var day = onDays[i];

        $("#detail" + id).append(`
              <div class="card card-body mb-2 d-flex flex-column">
              <div class="text-start p-1">${day.day}, ${day.date}</div>
              <div class="p-1 text-end">
                  <select id="${day.day + id}" class="form-select mb-3">
                    <option selected value="-">Want to order?</option>
                    <option value="0">No Sugar (0%)</option>
                    <option value="1">Little Sugar (25%)</option>
                    <option value="2">Half Sugar (50%)</option>
                    <option value="3">Less Sugar (75%)</option>
                    <option value="4">Normal Sugar (100%)</option>
                  </select>
                </div>
              </div>`);
      }
      const name = key;
      const price = menuNonCoffee[key].price;

      document
        .getElementById(id + "Btn")
        .addEventListener("click", function () {
          addCart(name, price, id);
          for (var i in onDays) {
            var day = onDays[i];
            $(`#${day.day + id}`).val("-");
          }
        });
    }
  });
}

var counter = 0;
function addCart(item, price, id) {
  // modalInstance.hide();

  for (var i in onDays) {
    var day = onDays[i];
    const sugarLv = $(`#${day.day + id}`).val();

    if (sugarLv != "-") {
      if (counter == 0) $("#billingsDetail").html("");
      counter = counter + 1;

      $("#billingsDetail").append(
        `					
          <tr id='item${counter}' name='orderTbl'>  
            <td scope="col" name="day${i}" colspan="3">${day.day}, ${
          day.date
        }</td>
            <td scope="col" name="order${i}" colspan="1">${item} - ${
          sugarLevel[sugarLv]
        }</td>
            <td scope="col" name="price${i}" colspan="4"><span>${formatter.format(
          price
        )}</span><button id='btn${counter}' type="button" class="btn btn-outline-rmv">X</button></td>
          </tr>
          `
      );

      const cur = `item${counter}`;
      document
        .getElementById(`btn${counter}`)
        .addEventListener("click", function () {
          removeItem(cur);
          billTotal -= price;
          $("#total").html(`<strong>${formatter.format(billTotal)}</strong>`);
        });
      billTotal += price;
      $("#total").html(`<strong>${formatter.format(billTotal)}</strong>`);
    }
  }
}

function removeItem(id) {
  $(`#${id}`).remove();
  if ($('tr[name*="orderTbl"').length <= 0) {
    $("#billingsDetail").append(
      `					
        <tr>
          <td scope="col"  colspan="8"> No Order</td>
        </tr>
        `
    );
    counter = 0;
  }
}

function noSpace(str) {
  str = str.replace(/[\W_]+/g, "");
  return str;
}

modelElem.addEventListener("shown.bs.modal", function () {
  modalInstance = bootstrap.Modal.getInstance(modelElem);
});

addEventListener("load", (event) => {
  loadMenu();
});
