let books = [];
let cart = [];

// LOAD BOOKS
function loadBooks() {
    let category = document.getElementById("category").value;

    fetch("http://localhost:5000/api/books?category=" + category)
    .then(response => response.json())
    .then(data => {
        books = data;

        let output = "";

        books.forEach(book => {
            output += `
                <div class="book">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Category: ${book.category}</p>
                    <p>Price: ₹${book.price}</p>

                    <button onclick="addToCart('${book._id}')">
                        Add to Cart
                    </button>
                </div>
            `;
        });

        document.getElementById("books").innerHTML = output;
    });
}

// ADD TO CART
function addToCart(id) {
    let book = books.find(b => b._id === id);
    let item = cart.find(b => b.bookId === id);

    if (item) {
        item.quantity++;
    } else {
        cart.push({
            bookId: book._id,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }

    showCart();
}

// DISPLAY CART
function showCart() {
    let output = "";
    let total = 0;

    cart.forEach(book => {
        output += `
            <p>
                ${book.title} - ₹${book.price}
                x ${book.quantity}

                <button onclick="removeBook('${book.bookId}')">
                    Remove
                </button>
            </p>
        `;

        total += book.price * book.quantity;
    });

    document.getElementById("cart").innerHTML = output;
    document.getElementById("total").innerText = "Total: ₹" + total;
}

// REMOVE BOOK
function removeBook(id) {
    cart = cart.filter(book => book.bookId !== id);
    showCart();
}

// PLACE ORDER
function placeOrder() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    fetch("http://localhost:5000/api/orders", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            items: cart
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);

        cart = [];
        showCart();
    });
}

// LOAD BOOKS WHEN PAGE OPENS
loadBooks();