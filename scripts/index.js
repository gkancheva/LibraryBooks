const appKey = 'kid_SJ8efPnr';
const kinveyServiceUrl = 'https://baas.kinvey.com/';
const appSecret = '1d7377d00ba14aec926cbbccb2ea8b8c';

function showView(viewID) {
    $('main > section').hide();
    $('#' + viewID).show();
}

$(function () {
    showHideNav();
    showHomeView();
    $("#home").click(showHomeView);
    $("#login").click(showLoginView);
    $("#register").click(showRegisterView);
    $("#showBooks").click(showBooksView);
    $("#createBook").click(showCreateBookView);
    $("#logout").click(logout);

    $("#formLogin").submit(function (e) {
        e.preventDefault();
        login();
    });
    $("#formRegister").submit(function (e) {
        e.preventDefault();
        register();
    });
    $("#formCreateBook").submit(function (e) {
        e.preventDefault();
        createBook();
    });

    $(document)
        .ajaxStart(function () {
            $("#loadingBox").show();
        })
        .ajaxStop(function () {
            $("#loadingBox").hide();
        })
});

function showHideNav() {
    $("#home").show();
    let loggedIn = sessionStorage.authToken != null;
    if(loggedIn) {
        $("#login").hide();
        $("#register").hide();
        $("#showBooks").show();
        $("#createBook").show();
        $("#logout").show();
    } else {
        $("#login").show();
        $("#register").show();
        $("#showBooks").hide();
        $("#createBook").hide();
        $("#logout").hide();
    }
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
}

function login() {
    let authorization = btoa(appKey + ":" + appSecret);
    let method = "POST";
    let requestUrl = kinveyServiceUrl + "user/" + appKey + "/login";
    let userData = {
        username:$('#loginUser').val(),
        password: $('#loginPassword').val()
    };
    let headers = {"Authorization": "Basic " + authorization};
    $.ajax({
        method:method,
        url:requestUrl,
        headers:headers,
        data:userData,
        success: loginSuccess,
        error:showAjaxError
    });

    function loginSuccess(response) {
        sessionStorage.authToken = response._kmd.authtoken;
        showHideNav();
        showBooksView();
        showInfo("Login successful!");
    }
}

function showInfo(messageText) {
    $("#infoBox").text(messageText).show().delay(3000).fadeOut();
}

function showAjaxError(response) {
    let errorMessage = "";
    if(typeof(response.readyState) != "undefined" && response.readyState == 0) {
        errorMessage = "Network error."
    } else if(response.responseJSON && response.responseJSON.description) {
        errorMessage = response.responseJSON.description;
    } else {
        errorMessage = "Error: " + JSON.stringify(response);
    }
    $("#errorBox").text(errorMessage).show().delay(3000).fadeOut();
}

function showRegisterView() {
    showView('viewRegister');
}

function register() {
    let authorization = btoa(appKey + ":" + appSecret);
    let method = "POST";
    let requestUrl = kinveyServiceUrl + "user/" + appKey + "/";
    let userData = {
        username:$('#registerUser').val(),
        password: $('#registerPassword').val()
    };
    let headers = {"Authorization": "Basic " + authorization};
    $.ajax({
        method:method,
        url:requestUrl,
        headers:headers,
        data:userData,
        success: registerSuccessfully,
        error:showAjaxError
    });

    function registerSuccessfully(response) {
        sessionStorage.authToken = response._kmd.authtoken;
        showHideNav();
        showBooksView();
        showInfo("Successfully register user!");
    }
}

function showBooksView() {
    showView('viewListBook');
    $("#books").empty();
    $.ajax({
        method: "GET",
        url: kinveyServiceUrl + "appdata/" + appKey + "/books",
        headers: { "Authorization": "Kinvey " + sessionStorage.authToken },
        success: loadBooks,
        error: showAjaxError
    });
    function loadBooks(books, status) {
        if(books.length == 0) {
            showInfo("No books available.");
            $("#books").text("No books available.")
        } else {
            showInfo("All books loaded.");
            let booksTable = $("<table>")
                .append($("<tr>")
                    .append($("<th>Title</th>"))
                    .append($("<th>Author</th>"))
                    .append($("<th>Description</th>"))
                );
            for (let book of books) {
                booksTable.append($("<tr>")
                    .append($("<td></td>").text(book.title))
                    .append($("<td></td>").text(book.author))
                    .append($("<td></td>").text(book.description))
                );
            }
            $("#books").append(booksTable);
        }
    }
}

function showCreateBookView() {
    showView('viewCreateNewBook');
}

function createBook() {
    let newBook = {
        title: $("#bookTitle").val(),
        author: $("#bookAuthor").val(),
        description: $("#bookDescription").val(),
        comments:[{}]
    };

    let headers = {};
    headers["Authorization"] = "Kinvey " + sessionStorage.authToken;
    headers["Content-Type"] = "application/json";

    $.ajax({
        method: "POST",
        url: kinveyServiceUrl + "appdata/" + appKey + "/books",
        headers: headers,
        data:JSON.stringify(newBook),
        success: bookCreated,
        error: showAjaxError
    });

    function bookCreated(response) {
        showBooksView();
        showInfo("Book was successfully created!");
        $("#bookTitle").val("");
        $("#bookAuthor").val("");
        $("#bookDescription").val("");
    }
}

function logout() {
    sessionStorage.clear();
    showHomeView();
    showHideNav();
}