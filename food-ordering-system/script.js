const API = "http://localhost:5000/api";

let cart = [];


// Switch between sections
function showSection(sectionId) {
    document.getElementById("menuSection").classList.add("hidden");
    document.getElementById("cartSection").classList.add("hidden");
    document.getElementById("historySection").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "menuSection") {
        loadMenu();
    }

    if (sectionId === "cartSection") {
        displayCart();
    }

    if (sectionId === "historySection") {
        loadHistory();
    }
}


// Load menu from database
async function loadMenu() {
    try {
        const response = await fetch(`${API}/menu`);
        const menu = await response.json();

        const menuList = document.getElementById("menuList");
        menuList.innerHTML = "";

        if (menu.length === 0) {
            menuList.textContent = "No food items available.";
            return;
        }

        menu.forEach(food => {
            const card = document.createElement("div");
            card.className = "food-card";

            const name = document.createElement("h3");
            name.textContent = food.name;

            const category = document.createElement("p");
            category.textContent = "Category: " + food.category;

            const description = document.createElement("p");
            description.textContent = food.description;

            const price = document.createElement("p");
            price.className = "price";
            price.textContent = "Price: ₹" + food.price;

            const button = document.createElement("button");
            button.textContent = "Add to Cart";
            button.onclick = () => addToCart(food);

            card.append(name, category, description, price, button);
            menuList.appendChild(card);
        });

    } catch (error) {
        document.getElementById("menuList").textContent =
            "Unable to load menu. Check the backend server.";
    }
}


// Add food to cart
function addToCart(food) {
    const existingItem = cart.find(item => item.menuItemId === food._id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            menuItemId: food._id,
            name: food.name,
            price: food.price,
            quantity: 1
        });
    }

    alert(food.name + " added to cart!");
}


// Change item quantity
function changeQuantity(menuItemId, change) {
    const item = cart.find(item => item.menuItemId === menuItemId);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(item => item.menuItemId !== menuItemId);
        }
    }

    displayCart();
}


// Display cart and calculate bill
function displayCart() {
    const cartList = document.getElementById("cartList");
    const totalBill = document.getElementById("totalBill");

    cartList.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartList.textContent = "Your cart is empty.";
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const card = document.createElement("div");
        card.className = "cart-item";

        const details = document.createElement("p");
        details.textContent =
            `${item.name} - ₹${item.price} × ${item.quantity} = ₹${itemTotal}`;

        const decrease = document.createElement("button");
        decrease.textContent = "-";
        decrease.onclick = () => changeQuantity(item.menuItemId, -1);

        const increase = document.createElement("button");
        increase.textContent = "+";
        increase.onclick = () => changeQuantity(item.menuItemId, 1);

        card.append(details, decrease, increase);
        cartList.appendChild(card);
    });

    totalBill.textContent = "Total: ₹" + total;
}


// Place order through API
document.getElementById("orderForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Please add food items to your cart.");
        return;
    }

    const order = {
        customerName: document.getElementById("customerName").value.trim(),
        phone: document.getElementById("phone").value.trim(),

        items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch(`${API}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const data = await response.json();

        document.getElementById("orderMessage").textContent = data.message;

        if (response.ok) {
            cart = [];
            this.reset();
            displayCart();
        }

    } catch (error) {
        document.getElementById("orderMessage").textContent =
            "Unable to place order.";
    }
});


// Load order history
async function loadHistory() {
    try {
        const response = await fetch(`${API}/orders`);
        const orders = await response.json();

        const historyList = document.getElementById("historyList");
        historyList.innerHTML = "";

        if (orders.length === 0) {
            historyList.textContent = "No previous orders found.";
            return;
        }

        orders.forEach(order => {
            const card = document.createElement("div");
            card.className = "history-card";

            const heading = document.createElement("h3");
            heading.textContent = "Order by: " + order.customerName;

            const phone = document.createElement("p");
            phone.textContent = "Phone: " + order.phone;

            const date = document.createElement("p");
            date.textContent = "Date: " + new Date(order.orderDate).toLocaleString();

            card.append(heading, phone, date);

            order.items.forEach(item => {
                const details = document.createElement("p");
                details.textContent =
                    `${item.name} × ${item.quantity} = ₹${item.price * item.quantity}`;

                card.appendChild(details);
            });

            const total = document.createElement("h3");
            total.textContent = "Total Bill: ₹" + order.totalAmount;

            card.appendChild(total);
            historyList.appendChild(card);
        });

    } catch (error) {
        document.getElementById("historyList").textContent =
            "Unable to load order history.";
    }
}


// Load menu when website opens
loadMenu();