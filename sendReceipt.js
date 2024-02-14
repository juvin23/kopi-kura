import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, onValue,set, query, orderByValue} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyC2kxlr7wEuX8SL4Jap9GNpNtQlFfay2AE",
    authDomain: "kura-coffee.firebaseapp.com",
    databaseURL: "https://kura-coffee-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kura-coffee",
    storageBucket: "kura-coffee.appspot.com",
    messagingSenderId: "520260474822",
    appId: "1:520260474822:web:80beb53f109080627444c7"
  };  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  function generateReceipt(){
    onValue(ref(database, "receipts"), (snapshot) => {
      const data = snapshot.val();
      for(var key in data){
        var phoneNum=data[key]['num'];
        if(phoneNum.toString().startsWith('62')){
          phoneNum= phoneNum.substring(2)
        }
        if(phoneNum.toString().startsWith('+62')){
          phoneNum=phoneNum.substring(3)
        }
        if(phoneNum.toString().startsWith('0')){
          phoneNum=phoneNum.substring(1)
        }
        const msg = data[key]['msg'];
        // console.log(phoneNum,msg);
        console.log(`https://api.whatsapp.com/send?phone=+62${phoneNum}&text=${msg}%0A%0ATransfer+ke%0ABCA+Digital%0AJuvianto+Chi%0A004821244760'`);

        }
      });
  }


  addEventListener("load", (event) => {
    generateReceipt();
  });
