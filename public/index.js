import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, onValue  } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyB-ae_N9jXHjxHyc6xDeWM5j3u4nLqyWJA",
    authDomain: "kura-e0a45.firebaseapp.com",
    databaseURL: "https://kura-e0a45-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kura-e0a45",
    storageBucket: "kura-e0a45.appspot.com",
    messagingSenderId: "783757652205",
    appId: "1:783757652205:web:c6c8ec3da1cd3f72d49ce4"
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  var menu;
  var cart =[];
  var billTotal = 0;

  $(".nav .nav-link").on("click", function(){
    $(".nav").find(".active").removeClass("active");
    $(this).addClass("active");
 });

  $("#doneButton").on("click", function(){
    location.href = 'index.html';
  });
  $('#').on('shown.bs.modal', function () {
    $('#modal').trigger('focus')
  })

  function loadMenu(){
    menu = ref(database, "Menu");
        // Add ref of child if any
      onValue(menu, (snapshot) => {
          const data = snapshot.val();
          console.log(data)
          const menuCoffee = data['Coffee'];
          const menuNonCoffee = data['Non Coffee'];

          for (var key in menuCoffee) {
            let id = noSpace(key);
            $('#menuCoffeeItems').append(
              `<div id="${id}" class="shadow border p-3 mb-5 row bg-white rounded">
                    <div class="col flex flex-column">
                      <Strong class="col">${key}</strong>
                      <p> IDR ${menuCoffee[key].price}</p>
                    </div>
                    <div class="col d-flex flex-row-reverse">
                      <button type="button" id="${id}Btn" class="btn btn-light">+</button>
                    </div>
                </div>`
              );
              
              const name = key;
              const price = menuCoffee[key].price;

              document.getElementById(id+"Btn").addEventListener("click", 
                function(){
                  addCart(name,price);
                }
              );
          }

          for (var key in menuNonCoffee) {
            let id = noSpace(key);
            $('#menuNonCoffeeItems').append(
              `<div id="${id}" class="shadow border p-3 mb-5 row bg-white rounded">
                    <div class="col flex flex-column">
                      <Strong class="col">${key}</strong>
                      <p> IDR ${menuNonCoffee[key].price}</p>
                    </div>
                    <div class="col d-flex flex-row-reverse">
                      <button type="button" id="${id}Btn" class="btn btn-light">+</button>
                    </div>
                </div>`
              );
              document.getElementById(id+"Btn").addEventListener("click", 
                function(){
                  addCart(key,menuNonCoffee[key].price);
                }
              );
          }
      });
  }

  function addCart(item,price){
    if(cart.length == 0){
      $('#billingsDetail').html('');
    }
    cart.push({'item':item, 'price' : price});
    $('#billingsDetail').append(
      `					
      <tr id='item${cart.length}'>
        <td scope="col">${item}</td>
        <td scope="col">1</td>
        <td scope="col">${price}</td>
      </tr>
      `
    )
    billTotal += price;
    $('#total').html(`<strong>${billTotal}</strong>`);
  }

  function noSpace(str){
    return  str.replace(/\s/g, '');
  }
  addEventListener("load", (event) => {
      loadMenu();
  });
  
