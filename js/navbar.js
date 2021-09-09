/**
 * function to check the active class
 */
$("#header .btn-group[role='group'] button").ready(function () {
    // to get the page parameter
    let url_string = window.location.href;
    let url = new URL(url_string);
    let page = url.searchParams.get("page");

    $('.navbarButtons').siblings().removeClass('activeButton');
    $('.' + page).addClass('activeButton');
})

/**
 * function to check if there is a current user or admin
 */
function checkSession() {
    let userId = FYSCloud.Session.get("user");
    // if the user is undefined, there is no logged in person
    if (userId === undefined) {
        $("#profileButton").hide();
        $("#uitlogButton").hide();
        $(".profilePage").hide();
        $("#loginButton").show();
        $("#registerButton").show();
        $(".matchPage").hide();
        $(".matchesResultPage").hide();
        $(".adminPage").hide();
        $(".drowpdownProfiel").hide();
        $(".drowpdownAdmin").hide();
        $(".drowpdownMatch").hide();
        $(".drowpdownMatches").hide();
        $(".dividerOne").hide();
        $(".dividerTwo").hide();
        $(".dividerThree").hide();
        $(".dividerFour").hide();
        return;
    }
    // checks if the user is admin or regular user
    // hides the data that is destined for admin and vice versa
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user WHERE user_id = ?",
        [userId[0].user_id]
    ).done(function (data) {
        if (data[0].level === 2) {
            $(".adminPage").show();
            $("#profileButton").show();
            $("#uitlogButton").show();
            $("#loginButton").hide();
            $("#registerButton").hide();
            $(".matchPage").hide();
            $(".matchesResultPage").hide();

            $(".drowpdownProfiel").show();
            $(".drowpdownAdmin").show();
            $(".drowpdownMatch").hide();
            $(".drowpdownMatches").hide();
            $(".dividerThree").hide();
            $(".dividerFour").hide();
        } else {
            $(".adminPage").hide();
            $("#loginButton").hide();
            $("#registerButton").hide();
            $("#uitlogButton").show();
            $("#profileButton").show();

            $(".drowpdownProfiel").show();
            $(".drowpdownAdmin").hide();
            $(".drowpdownMatch").show();
            $(".drowpdownMatches").show();

            $(".dividerFour").hide();
        }
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to Remove everything from the session and logout
 */
function removeSession() {
    let session = FYSCloud.Session.get()
    if (session !== null) {
        FYSCloud.Session.remove(session);
        FYSCloud.Session.clear(session);
    }
}

/**
 * function to check the param from the url
 */
$(function () {
    // checks the current session and updates options in navbar.
    checkSession();
    // to get the page parameter
    let url_string = window.location.href;
    let url = new URL(url_string);
    let page = url.searchParams.get("page");

    if (page === null) {
        page = 'home';
        window.location.href = "index.html?page=" + page;
    }

    // when admin page is selected change navbar items and remove side ads
    if (page === 'adminPage') {
        $('#mainBody').removeClass('mainPage');
        // to get a admin sidebar
        $('#adminSideBar').show();
        $('#adminSideBar').removeClass('sideAd');
        $('#adminSideBar').removeClass('d-flex');
        $('#adminSideBar').addClass('p-0');
        $('#adminSideBar').load('../html/adminPage/adminSideBar.html');
    }
    $.get(page + ".html")
        .done(function (data) {
            $('#includedContent').load(page + ".html")
        }).fail(function () {
        // later to add our 404 page
    })
})


/** expect a html id and a html file **/
function showCurrentFile(chosenId, currentFile) {
    window.location.href = "index.html?page=" + currentFile;
}
