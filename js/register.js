/**
 * function to check all the data that is filled in the form
 */
function checkFormValidity() {
    //removes all error messages if there are any before checking form
    $(".repeatPasswordMessage").remove();
    $(".passwordMessage").remove();
    $(".emailMessage").remove();
    $(".lastNameMessage").remove();
    $(".firstNameMessage").remove();
    $(".emailExist").remove();
    $(".passwordCheck").remove();
    $(".repeatPasswordCheck").remove();

    //checks if firstname is entered
    let checkFirstName = document.getElementById("firstname").checkValidity();

    // if validation is false: show message
    if (!checkFirstName) {
        $(".firstname").append("<p class='alert alert-danger registerErrorMessage firstNameMessage mb-0 mt-2'>Voer a.u.b. uw voornaam in.</p>");
    }
    // else validation is true: hide message
    else {
        $(".firstNameMessage").remove();
    }

    //checks if lastname is entered
    let checkLastName = document.getElementById("lastname").checkValidity();

    // if validation is false: show message
    if (!checkLastName) {
        $(".lastname").append("<p class='alert alert-danger registerErrorMessage lastNameMessage mb-0 mt-2'>Voer a.u.b. uw achternaam in.</p>");
    }
    // else validation is true: hide message
    else {
        $(".lastNameMessage").remove();
    }

    //checks if email is entered and correct
    let checkEmail = validateEmail($("#email").val());

    // if validation is false : show message
    if (!checkEmail) {
        $(".email").append("<p class='alert alert-danger registerErrorMessage emailMessage mb-0 mt-2'>Voer a.u.b. uw email in met een @ en een einddomein.</p>");
    }
    // else validation is true : hide message
    else {
        $(".emailMessage").remove();
    }

    //checks if password is entered
    let checkPassword = validatePassword($("#password").val());

    // if validation is false : show message
    if (!checkPassword) {
        $(".password").append("<p class='alert alert-danger registerErrorMessage passwordMessage mb-0 mt-2'>Voer a.u.b. uw wachtwoord in.</p>");
    }
    // else validation is true : hide message
    else {
        $(".passwordMessage").remove();
    }

    //checks if repeated password is entered but not if its correct yet
    let checkRepeatPassword = validatePassword($("#repeatPassword").val());

    // if validation is false : show message
    if (!checkRepeatPassword) {
        $(".repeatPassword").append("<p class='alert alert-danger registerErrorMessage repeatPasswordMessage mb-0 mt-2'>Voer a.u.b. uw wachtwoord opnieuw in.</p>");
    }
    // else validation is true : hide message
    else {
        $(".repeatPasswordMessage").remove();
    }

    //checks if form is correct
    let registerForm = document.getElementById("registerSubmit").checkValidity()
    if (registerForm) {
        checkDoubleEmail();
    }
}

/**
 * function to check if the email is already in the database
 */
function checkDoubleEmail() {
    let email = $('#email').val();
    FYSCloud.API.queryDatabase(
        "SELECT * FROM `user` WHERE email = ?",
        [email]
    ).done(function (data) {
        //if the email doesnt exist it continues checking if the repeated password is correct
        if (data.length === 0) {
            $(".emailExist").remove();
            repeatPasswordCheck();

        }
        //else it displays an error message
        else {
            $(".email").append("<p class='alert alert-danger registerErrorMessage emailExist mb-0 mt-2'>Sorry! De email die u heeft ingevuld is niet beschikbaar.</p>");
        }
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to check if password is the same as repeated password if its not it will continue
 */
function repeatPasswordCheck() {
    // check if passwords are not matching
    if ($('#repeatPassword').val() !== $('#password').val()) {
        // set error messages
        $(".password").append("<p class='alert alert-danger registerErrorMessage passwordCheck mb-0 mt-2'>Uw wachtwoorden komen niet overeen.</p>");
        $(".repeatPassword").append("<p class='alert alert-danger registerErrorMessage repeatPasswordCheck mb-0 mt-2'>Uw wachtwoorden komen niet overeen.</p>");
    } else {
        //if both passwords match error is removed and continues to register the account with email and password
        $(".passwordCheck").remove();
        $(".repeatPasswordCheck").remove();
        register();

    }
}

/**
 * function to insert the user credentials into the database user
 */
function register() {
    let email = $('#email').val();
    let password = $('#password').val();
    FYSCloud.API.queryDatabase(
        "INSERT INTO user (email, password) VALUES (?, MD5(?))",
        [email, password]
    ).done(function (data) {
        getUserId();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function gets user id to insert the data into profile
 */
function getUserId() {
    let email = $('#email').val();
    FYSCloud.API.queryDatabase(
        "SELECT user_id FROM user WHERE email = ? ",
        [email]
    ).done(function (data) {
        createProfileRow(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to add the other data to database profile
 */
function createProfileRow(user) {
    let firstname = $('#firstname').val();
    let lastname = $('#lastname').val();
    let gender = $('#gender').val();
    let prefix = $('#prefix').val();

    FYSCloud.API.queryDatabase(
        "INSERT INTO profile (first_name, last_name, gender, user_id, prefix) " +
        "VALUES (?, ?, ?, ?, ?);",
        [firstname, lastname, gender, user[0].user_id, prefix]
    ).done(function (data) {
        document.registerForm.submit();
        // set user settings and reload page
        FYSCloud.Session.set("user", user);
        location.reload();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to remove all data when form is cancelled
 */
function cancelForm() {
    //if form is cancelled it will remove all data and remove error messages
    $('#registerSubmit')[0].reset();
    $(".repeatPasswordMessage").remove();
    $(".passwordMessage").remove();
    $(".emailMessage").remove();
    $(".lastNameMessage").remove();
    $(".firstNameMessage").remove();
    $(".emailExist").remove();
    $(".passwordCheck").remove();
    $(".repeatPasswordCheck").remove();
}

/**
 * email checker
 * @param email
 * @returns {boolean}
 */
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * to check password
 * @param password
 * @returns {boolean|boolean}
 */
function validatePassword(password) {
    const noCharacter = 0;
    const re = /[a-zA-Z]/;
    return re.test(password) && password.length > noCharacter;
}
