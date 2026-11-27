require("dotenv").config();

const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");

const menu = [
    {
        name: "Veg Burger",
        category: "Burger",
        price: 80,
        description: "Delicious vegetable burger"
    },
    {
        name: "Cheese Pizza",
        category: "Pizza",
        price: 180,
        description: "Pizza topped with cheese and vegetables"
    },
    {
        name: "French Fries",
        category: "Snacks",
        price: 70,
        description: "Crispy and golden french fries"
    },
    {
        name: "Veg Sandwich",
        category: "Snacks",
        price: 90,
        description: "Fresh vegetable sandwich"
    },
    {
        name: "Paneer Roll",
        category: "Rolls",
        price: 120,
        description: "Spicy paneer roll"
    },
    {
        name: "Cold Coffee",
        category: "Drinks",
        price: 60,
        description: "Chilled coffee"
    }
];

async function insertMenu() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await MenuItem.deleteMany({});
        await MenuItem.insertMany(menu);

        console.log("Food menu added successfully!");

        await mongoose.disconnect();

    } catch (error) {
        console.log("Error:", error);
        await mongoose.disconnect();
    }
}

insertMenu();