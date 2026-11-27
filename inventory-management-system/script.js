const API = "http://localhost:5000/api";

const LOW_STOCK_LIMIT = 5;


// Switch between sections
function showSection(sectionId) {
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("productSection").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");

    loadProducts();
}


// Load all products
async function loadProducts() {
    try {
        const response = await fetch(`${API}/products`);
        const products = await response.json();

        displayProducts(products);
        updateDashboard(products);

    } catch (error) {
        document.getElementById("productList").textContent =
            "Unable to load products. Check the backend server.";
    }
}


// Display products
function displayProducts(products) {
    const productList = document.getElementById("productList");
    const dashboardProducts = document.getElementById("dashboardProducts");

    productList.innerHTML = "";
    dashboardProducts.innerHTML = "";

    if (products.length === 0) {
        productList.textContent = "No products available.";
        dashboardProducts.textContent = "No products available.";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + product.quantity;

        const price = document.createElement("p");
        price.textContent = "Price: ₹" + product.price;

        const supplier = document.createElement("p");
        supplier.textContent = "Supplier: " + product.supplier;

        const value = document.createElement("p");
        value.textContent =
            "Stock Value: ₹" + (product.quantity * product.price).toFixed(2);

        const status = document.createElement("span");

        if (product.quantity < LOW_STOCK_LIMIT) {
            status.textContent = "Low Stock";
            status.className = "low-stock";
        } else {
            status.textContent = "In Stock";
            status.className = "in-stock";
        }

        card.append(name, quantity, price, supplier, value, status);

        // Edit and delete buttons only in Manage Products
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.onclick = () => editProduct(product);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.onclick = () => deleteProduct(product._id);

        card.append(editButton, deleteButton);

        productList.appendChild(card);

        // Dashboard cards do not need edit/delete buttons
        const dashboardCard = card.cloneNode(true);
        dashboardCard.removeChild(dashboardCard.lastChild);
        dashboardCard.removeChild(dashboardCard.lastChild);

        dashboardProducts.appendChild(dashboardCard);
    });
}


// Update dashboard values
async function updateDashboard(products) {
    const totalProducts = products.length;

    let totalQuantity = 0;
    let lowStockCount = 0;

    products.forEach(product => {
        totalQuantity += product.quantity;

        if (product.quantity < LOW_STOCK_LIMIT) {
            lowStockCount++;
        }
    });

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalQuantity").textContent = totalQuantity;
    document.getElementById("lowStockCount").textContent = lowStockCount;

    // Get total inventory value from API
    try {
        const response = await fetch(`${API}/inventory-value`);
        const data = await response.json();

        document.getElementById("inventoryValue").textContent =
            "₹" + Number(data.totalInventoryValue).toFixed(2);

    } catch (error) {
        document.getElementById("inventoryValue").textContent = "Unavailable";
    }
}


// Add or update product
document.getElementById("productForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const productId = document.getElementById("productId").value;

    const product = {
        name: document.getElementById("productName").value.trim(),
        quantity: Number(document.getElementById("quantity").value),
        price: Number(document.getElementById("price").value),
        supplier: document.getElementById("supplier").value.trim()
    };

    if (
        !product.name ||
        !product.supplier ||
        !Number.isInteger(product.quantity) ||
        product.quantity < 0 ||
        !Number.isFinite(product.price) ||
        product.price < 0
    ) {
        document.getElementById("message").textContent =
            "Please enter valid product details.";
        return;
    }

    const url = productId
        ? `${API}/products/${productId}`
        : `${API}/products`;

    const method = productId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        const data = await response.json();

        document.getElementById("message").textContent = data.message;

        if (response.ok) {
            resetForm();
            loadProducts();
        }

    } catch (error) {
        document.getElementById("message").textContent =
            "Unable to save product.";
    }
});


// Edit product
function editProduct(product) {
    document.getElementById("productId").value = product._id;
    document.getElementById("productName").value = product.name;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("price").value = product.price;
    document.getElementById("supplier").value = product.supplier;

    document.getElementById("formTitle").textContent = "Update Product";
    document.getElementById("submitButton").textContent = "Update Product";
    document.getElementById("cancelButton").classList.remove("hidden");

    document.getElementById("message").textContent = "";

    showSection("productSection");

    window.scrollTo(0, 0);
}


// Delete product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/products/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            loadProducts();
        }

    } catch (error) {
        alert("Unable to delete product.");
    }
}


// Reset form
function resetForm() {
    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";
    document.getElementById("formTitle").textContent = "Add New Product";
    document.getElementById("submitButton").textContent = "Add Product";
    document.getElementById("cancelButton").classList.add("hidden");
}


// Load products when website opens
loadProducts();