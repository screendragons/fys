/**
 * Log in function. (creates session).
 */
function logIn() {
    let email = $('#email').val();
    let password = $('#password').val();
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user WHERE email = ? AND password = MD5(?)",
        [email, password]

        //After data append, checks if fields are empty, checks e-mail from database and checks if password matches
    ).done(function (userDetails) {
        // if there is no data retrieved, login wont happen.
        if (userDetails.length === 0) {
            $(".errorMessage").append("<p class='alert alert-danger registerErrorMessage emailMessage mb-0 mt-2'>" +
                "De combinatie van deze email en wachtwoord zijn niet bij ons bekend probeer het opnieuw!</p>");
        } else if (userDetails[0].status === 1) {
            $(".errorMessage").append("<p class='alert alert-danger registerErrorMessage blockedMessage mb-0 mt-2'>" +
                "Dit account is tijdelijk geblokkeerd. Check uw e-mail inbox voor meer informatie!</p>");
        } else {
            FYSCloud.Session.set("user", userDetails);
            location.reload();
        }
        //THIS WAS OUR PREVIOUS LOGIN FUNCTION
        // if (email === null || password === null){
        // } else if (userDetails.length === 0){
        //     if (document.querySelector('.accountMessage') === null)  {
        //         $( ".errorMessage" ).append( "<p class='alert alert-danger registerErrorMessage emailMessage mb-0 mt-2'>" +
        //             "De combinatie van deze email en wachtwoord zijn niet bij ons bekend probeer het opnieuw!</p>" );
        //     }
        //     if (document.querySelector('.accountMessage') !== null) {
        //         $(".accountMessage").remove();
        //     }
        // } else if (userDetails[0].password === password) {
        //     FYSCloud.Session.set("user", userDetails);
        //     location.reload();
        // } else {
        //     if (document.querySelector('.accountMessage') === null)  {
        //         $( ".errorMessage" ).append( "<p class='alert alert-danger registerErrorMessage emailMessage mb-0 mt-2'>" +
        //             "De combinatie van deze email en wachtwoord zijn niet bij ons bekend probeer het opnieuw!</p>" );
        //     }
        //     if (document.querySelector('.accountMessage') !== null) {
        //         $(".accountMessage").remove();
        //     }
        // }
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * Logout function. Removes userId from the session
 */
function logOut() {
    let userId = FYSCloud.Session.get("user");
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user WHERE user_id = ?",
        [userId]
    ).done(function (data) {
        FYSCloud.Session.remove(userId)
        alert("Je bent uitgelogd!");
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function Returns everything in the session as an object
 * For developing purposes
 */
function getSession() {
    let session = FYSCloud.Session.get();
    console.log(session);
}

/**
 * function Sets userId to 15
 * For developing purposes
 */
function setSession() {
    FYSCloud.Session.set("user", 15);
}

/**
 * function to check the email and password for validity
 *
 */
function checkLoginForm() {
    //checks email
    let checkEmail = document.getElementById("email").checkValidity();

    if (checkEmail === false && document.querySelector('.emailMessage') === null) {
        $(".email").append("<p class='alert alert-danger registerErrorMessage emailMessage mb-0 mt-2'>Voer a.u.b. uw email in met een @ en een einddomein.</p>");
    }
    if (checkEmail === true && document.querySelector('.emailMessage') !== null) {
        $(".emailMessage").remove();
    }
    //checks password
    let checkPassword = document.getElementById("password").checkValidity();

    if (checkPassword === false && document.querySelector('.passwordMessage') === null) {
        $(".password").append("<p class='alert alert-danger registerErrorMessage passwordMessage mb-0 mt-2'>Voer a.u.b. uw wachtwoord in.</p>");
    }
    if (checkPassword === true && document.querySelector('.passwordMessage') !== null) {
        $(".passwordMessage").remove();
    }

    let testingform = document.getElementById("loginForm").checkValidity()
    if (testingform === true) {
        logIn();
    } else {
    }
}

/**
 * function for the cancel button on the login dialog, removes all data.
 *
 */
function loginCancel() {
    $('#loginForm')[0].reset();
    $(".passwordMessage").remove();
    $(".emailMessage").remove();
    $(".blockedMessage").remove();
}

let emailInput = document.getElementById("email");
let passwordInput = document.getElementById("password");
emailInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("submitButton").click();
    }
});

passwordInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("submitButton").click();
    }
});



