// Variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");

// Cart
let cart = [];
let buttonDom = [];

// Getting Products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { id, image, price, title };
            });
            return products; // Return the processed products array
        } catch (error) {
            console.log(error);
            return []; // Return an empty array or handle the error differently
        }
    }
}


// Display Products
class Ui {
    displayProducts(products) {
        let result = "";
        products.forEach(element => {
            result += `
     <article class="product">
     <div class="img-container">
         <img src=${element.image} alt="product" class="product-img">
         <button class="bag-btn" data-id=${element.id}>
             <i class="fa-shopping-cart fas"></i>
             add to bag
         </button>
     </div>
     <h3>${element.title}</h3>
     <h4>${element.price}</h4>
 </article>
     `
        });
        productsDom.innerHTML = result;
    }
    getBagButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        buttonDom = btns;
        btns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true
            }
            else {
                button.addEventListener("click", (event) => {
                    event.target.innerHTML = "In Cart";
                    event.target.disabled = true;
                    //    get product from the products
                    let cartItems = { ...Storage.getProduct(id), amount: 1 }
                    //    add  product to the cart
                    cart = [...cart, cartItems];
                    Storage.saveCart(cart);
                    //    set cart values
                    this.setCartValues(cart);
                    //   display cart items
                    this.addCartItems(cartItems);
                    // show the cart
                    this.showCart()
                })
            }
        });

    }
    setCartValues(cart) {
        let temTotal = 0;
        let ItemsTotal = 0;
        cart.map((item) => {
            temTotal += item.price * item.amount;
            ItemsTotal += item.amount;
        })
        cartTotal.innerHTML = parseFloat(temTotal.toFixed(2));
        cartItems.innerHTML = ItemsTotal
    }
    addCartItems(cart) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
<img src=${cart.image} alt="product">
<div>
    <h4>${cart.title}</h4>
    <h5>${cart.price}</h5>
    <span class="remove-item" data-id=${cart.id}>remove</span>
</div>
<div>
    <i class="fas fa-chevron-up" data-id=${cart.id}></i>
    <p class="item-amount">${cart.amount}</p>
    <i class="fas fa-chevron-down" data-id=${cart.id}></i>
</div>
`;
cartContent.appendChild(div)
    }
    showCart(){
  cartOverlay.classList.add("transparentBcg");
  cartDom.classList.add("showCart");
    }
    setUpApp(){
cart=Storage.getCart();
this.setCartValues(cart);
this.populateCart(cart);
cartBtn.addEventListener("click",this.showCart);
closeCartBtn.addEventListener("click",this.hideCart);
    }
    
 populateCart(cart){
    cart.forEach(item=>this.addCartItems(item));
 }
 hideCart(){
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart")
 }
 cartLogic(){
    clearCartBtn.addEventListener("click",()=>{
        this.clearCart();
    });
    //  cart functionlity
    cartContent.addEventListener("click",(event)=>{
if(event.target.classList.contains("remove-item")){
    let removeItem=event.target;
    let id=removeItem.dataset.id;
    this.removeItem(id);
    cartContent.removeChild(removeItem.parentElement.parentElement);
}
else if (event.target.classList.contains("fa-chevron-up")) {
    let addAmount = event.target;
    let id = addAmount.dataset.id;
    let tempItem = cart.find((item) => item.id === id);
    tempItem.amount = tempItem.amount + 1;
    Storage.saveCart(cart);
    this.setCartValues(cart);
    addAmount.nextElementSibling.innerText = tempItem.amount; // Corrected typo and updated quantity display
    
}
else if (event.target.classList.contains("fa-chevron-down")){
    let lowerAmount = event.target;
    let id = lowerAmount.dataset.id;
    let tempItem = cart.find((item) => item.id === id);
    tempItem.amount = tempItem.amount - 1;
    if( tempItem.amount>0){
        Storage.saveCart(cart);
        this.setCartValues(cart);
        lowerAmount.previousElementSibling.innerText = tempItem.amount; // Corrected typo
    }
    else{
        cartContent.removeChild(lowerAmount.parentElement.parentElement);
        this.removeItem(id)
    }
}


    })
 }


 clearCart(){
   let cartItems=cart.map((item)=>{
  return  item.id;

   })
  cartItems.forEach(id=>this.removeItem(id));
  console.log(cartContent.children)
  while(cartContent.children.length>0){
    cartContent.removeChild(cartContent.children[0])
  }
  this.hideCart()
 }
 removeItem(id){
 cart=cart.filter((item)=>item.id!==id);
 this.setCartValues(cart);
 Storage.saveCart(cart);
 let button=this.getSingleButton(id);
 button.disabled=false;
 button.innerHTML=`
 <i class="fas fa-shopping-cart"></i>
 add to cart
 `
 }
 getSingleButton(id){
   return buttonDom.find(button=>button.dataset.id===id)
 }

}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new Ui();
    const products = new Products();
    // set up the app
    ui.setUpApp();
    // Get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic()
    });
});
