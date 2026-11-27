
// API URL
let url = "http://localhost:5000/api";

// SHOW MESSAGE
function showMessage(message, type) {
    let msg = document.getElementById("message");

    msg.innerText = message;
    msg.className = type;
}

// ADD BOOK
document.getElementById("bookForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let title = document.getElementById("title").value.trim();
    let author = document.getElementById("author").value.trim();

    fetch(url + "/books", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, author })
    })
    .then(res => res.json())
    .then(data => {
        showMessage("Book added successfully!", "success");

        document.getElementById("bookForm").reset();

        loadBooks();
    })
    .catch(() => showMessage("Unable to add book!", "error"));
});

// DISPLAY BOOKS
function loadBooks() {
    fetch(url + "/books")
    .then(res => res.json())
    .then(books => {
        let output = "";

        let search = document.getElementById("search").value.toLowerCase();

        books.forEach(book => {

            if (book.title.toLowerCase().includes(search) ||
                book.author.toLowerCase().includes(search)) {

                let status = book.available ? "Available" : "Issued";

                output += `
                    <div class="book">

                        <h3>📘 ${book.title}</h3>

                        <p>Author: ${book.author}</p>

                        <p class="${book.available ? 'available' : 'issued'}">
                            Status: ${status}
                        </p>

                        ${book.available ? `
                            <input id="member${book._id}"
                                placeholder="Member Name">

                            <button onclick="issueBook('${book._id}')">
                                Issue Book
                            </button>
                        ` : `
                            <button disabled>Already Issued</button>
                        `}

                    </div>
                `;
            }
        });

        document.getElementById("books").innerHTML =
            output || "<p>No books found.</p>";

        // UPDATE DASHBOARD
        document.getElementById("totalBooks").innerText = books.length;

        document.getElementById("availableBooks").innerText =
            books.filter(b => b.available).length;

        document.getElementById("issuedBooks").innerText =
            books.filter(b => !b.available).length;
    })
    .catch(() => showMessage("Unable to load books!", "error"));
}

// ISSUE BOOK
function issueBook(id) {
    let member = document.getElementById("member" + id).value.trim();

    if (member === "") {
        showMessage("Please enter member name!", "error");
        return;
    }

    fetch(url + "/issue", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bookId: id,
            member: member
        })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message,
            data.message.includes("successfully") ? "success" : "error");

        loadBooks();
        loadIssuedBooks();
    })
    .catch(() => showMessage("Unable to issue book!", "error"));
}

// RETURN BOOK
function returnBook(id) {
    fetch(url + "/return", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookId: id })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message,
            data.message.includes("successfully") ? "success" : "error");

        loadBooks();
        loadIssuedBooks();
    })
    .catch(() => showMessage("Unable to return book!", "error"));
}

// DISPLAY ISSUED BOOKS
function loadIssuedBooks() {
    fetch(url + "/issued")
    .then(res => res.json())
    .then(issues => {
        let output = "";

        issues.forEach(issue => {
            if (issue.bookId) {
                output += `
                    <div class="book">

                        <h3>📕 ${issue.bookId.title}</h3>

                        <p>Member: ${issue.member}</p>

                        <button onclick="returnBook('${issue.bookId._id}')">
                            Return Book
                        </button>

                    </div>
                `;
            }
        });

        document.getElementById("issued").innerHTML =
            output || "<p>No books are currently issued.</p>";
    });
}

// LOAD DATA WHEN PAGE OPENS
loadBooks();
loadIssuedBooks();
