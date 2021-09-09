// userSession variable
let user = FYSCloud.Session.get('user');

$(function () {
    // call a function to get all the countries
    getAllCountries();
    // call a function to get all the userVisitedCountries
    getVisitedCountriesOfUser();
    // call a function to get all the account en profile settings
    getUserProfile();
    // get categories from database
    getCategories();

    var inputs = '';
    for (var i = 1; i <= 10; i++) {
        inputs += '<input name="scores" type="radio" value="' + i + '" id="' + i + '">' + i + '';
    }

    var div = document.createElement('div');
    div.innerHTML = inputs;

    var submit = document.querySelector('#NPSform input');
    submit.parentNode.insertBefore(div, submit);

})

$('.collapse').hide()
$('.collapse').show();

/**
 * get all the profile and account settings of the user
 */
function getUserProfile() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user LEFT JOIN profile ON user.user_id = profile.user_id WHERE user.user_id = ?",
        [user[0].user_id]
    ).done(function (profileSettings) {
        // welcome message
        $('#welcomeMessage').text('Hallo ' + profileSettings[0].first_name);
        // set all the settings in the profile
        // gender
        $('#inputGender').val(profileSettings[0].gender);
        // firstname
        $('#inputFirstname').val(profileSettings[0].first_name);
        // prefix
        $('#inputPrefix').val(profileSettings[0].prefix);
        // lastname
        $('#inputLastname').val(profileSettings[0].last_name);
        // date of birth
        let dob = new Date(profileSettings[0].date_of_birth).toISOString().split("T")[0];
        $('#inputDOB').val(dob);
        // phonenumber
        $('#inputPhoneNumber').val(profileSettings[0].phonenumber);
        // avatar
        if (profileSettings[0].avatar !== null) {
            $("#profilePagePreview").attr('src', profileSettings[0].avatar);
            $("#userProfilePicture").html(profileSettings[0].avatar);
        }
        // email
        $('#inputEmail').val(profileSettings[0].email);
        // biography
        $('#inputBio').val(profileSettings[0].biography);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * updates the user profile
 */
function updateUserInfo(
    photoPath = null
) {

    // get the value of the class
    let first_name = $('#inputFirstname').val();
    let prefix = $('#inputPrefix').val();
    let last_name = $('#inputLastname').val();
    let avatar = photoPath;
    let date_of_birth = $('#inputDOB').val();
    let phonenumber = $('#inputPhoneNumber').val();
    let gender = $('#inputGender').val();


    // check if avatar is not our defailt picture
    if (avatar === "../img/zakelijke-man.jpg") avatar = null;

    // query for updating
    FYSCloud.API.queryDatabase(
        "UPDATE profile SET first_name = ?, prefix = ?, last_name = ?, avatar = ?, date_of_birth = ?, phonenumber = ?, gender = ? WHERE user_id = ?",
        [first_name, prefix, last_name, avatar, date_of_birth, phonenumber, gender, user[0].user_id]
    ).done(function (data) {
        // call this function to update the profile photo

        // call function for generic alert
        showAlertForSucces();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * put the picture in the preview
 */
function getPhotoUrl() {
    FYSCloud.Utils
        .getDataUrl($("#inputPhoto"))
        .done(function (data) {
            $("#profilePagePreview").attr('src', data.url);
            $('#labelForPhoto').html(data.fileName)
        }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to delete the old picture
 */
function deleteOldPicture() {
    let oldPicture = $('#userProfilePicture').text();

    // if there is no picture in the database go directly to save the new picture
    if (oldPicture === '') setPhotoInDatabase();

    // remove the full path to delete only the file
    // TODO always when deploying change the environment
    let deletedFile = oldPicture.replace("https://is104-3.fys.cloud/uploads", "");

    FYSCloud.API.deleteFile(
        deletedFile
    ).done(function (data) {
        setPhotoInDatabase();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * to set the new picture into the database
 */
function setPhotoInDatabase() {
    let pictureUrl = $("#profilePagePreview").attr('src');
    let pictureName = $('#labelForPhoto').html();
    let pictureFile = $('#inputPhoto').val();

    // check if the picture is empty
    if (pictureFile === '') {
        updateUserInfo();
        return;
    }

    let path = "user" + user[0].user_id + '/' + pictureName;

    FYSCloud.API.uploadFile(
        path,
        pictureUrl
    ).done(function (data) {
        updateUserInfo(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to change the email and password of the user
 */
function changeAccountSettings() {
    let userId = user[0].user_id;
    // get values from inputfields
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let passwordRepeat = $('#inputPasswordRepeat').val();

    // check if email, password and password repeat are filled in
    if (
        email === '' ||
        password === '' ||
        passwordRepeat === ''
    ) {
        window.alert("Een van de velden is niet ingevuld");
        return;
    }

    // if password does not match password repeat
    if (password !== passwordRepeat) {
        window.alert("De wachtwoorden matchen niet");
        return;
    }

    // if evertything is correct update email and password
    FYSCloud.API.queryDatabase(
        'UPDATE user SET email = ?, password = MD5(?) WHERE user_id = ?',
        [email, password, userId]
    ).done(function (data) {
        showAlertForSucces();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * function to update the biography
 */
function updateBiography() {
    // get values from inputfields
    let biography = $('#inputBio').val();

    // update the biography
    FYSCloud.API.queryDatabase(
        "UPDATE profile SET biography = ? WHERE user_id = ?",
        [biography, user[0].user_id]
    ).done(function (data) {
        showAlertForSucces();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * standard alert to `say user settings saved`
 */
function showAlertForSucces() {
    window.alert("De gegevens zijn aangepast");
}

/**
 * a function to get all the countries from the database
 */
function getAllCountries() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM country"
    ).done(function (data) {
        // to set the top 5 countries
        getTopCountries(data);

        // to set countries for checkboxes
        setAllCountriesInPage(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * to add all the countries from the database to the html page
 * @param countries
 */
function setAllCountriesInPage(countries) {
    // to create a col for 6 countries
    let columns = 0;

    // loop through all countries to make html tags for it
    Object.values(countries).forEach((country) => {

        // create after 6 countries every time a new column
        if (countries.indexOf(country) % 6 === 0) {
            columns += 1;
            $(".europa").append("<div id='" + columns + "' class='col-6 col-md-4 pb-3'></div>");
        }

        // create div, label & input for every country
        // input is special because input has a onclick function on it
        $("#" + columns).append(
            "<div class='" + country.name + "'></div>" +
            "");
        $("." + country.name).append(
            "<input id='country" + country.country_id + "' type='checkbox' name='" + country.name + "' value='" + country.name + "'>"
        ).change(function () {
            changeCountryValue(country);
        });
        $("." + country.name).append(
            "<label for='" + country.country_id + "' class='ml-1 my-0'>" + country.name + "</label>" +
            "");
    })
}

/**
 * This function checks the value of the checkbox and than add or delete the item to the database
 * @param country
 */
function changeCountryValue(country) {
    // get the input value of the selected item
    let inputValue = $("#country" + country.country_id).prop('checked');

    // if the user select the country
    if (inputValue) {
        // set the user_id and country_id in the database
        FYSCloud.API.queryDatabase(
            "INSERT INTO uservisitedcountry (user_id, country_id) VALUES(?, ?)",
            [user[0].user_id, country.country_id]
        ).done(function (data) {
        }).fail(function (reason) {
            console.log(reason);
        });
    }
    // if the user unselect the country
    else {
        // delete the user_id in combination with the country_id
        FYSCloud.API.queryDatabase(
            "DELETE FROM uservisitedcountry WHERE user_id = ? AND country_id = ?",
            [user[0].user_id, country.country_id]
        ).done(function (data) {
        }).fail(function (reason) {
            console.log(reason);
        });
    }
}

/**
 * to get all the countries the user has selected
 */
function getVisitedCountriesOfUser() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM uservisitedcountry WHERE user_id = ?",
        [user[0].user_id]
    ).done(function (data) {
        // call the function to change values of selected items
        setVisitedCountriesOfUser(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * This function set the userSelectedCountries to true if they in the list
 * @param userSelectedCountries
 */
function setVisitedCountriesOfUser(userSelectedCountries) {
    // loop through userSelectedCountries and find the input box and set it to true
    Object.values(userSelectedCountries).forEach((country) => {
        $("#country" + country.country_id).prop('checked', true);
    })
}

/**
 * This function set the options for the inputfields
 * @param countries
 */
function getTopCountries(countries) {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM topcountry WHERE user_id = ?",
        [user[0].user_id]
    ).done(function (topSelectedCountries) {
        // to set all the options in the select fields
        // loop through all the countries and than loop through amount of inputs
        const totalSelects = 5;
        Object.values(countries).forEach((country) => {
            for (let i = 0; i < totalSelects; i++) {
                $("#inputTop" + (i + 1)).append("<option value='" + country.country_id + " '>" + country.name + "</option>");
            }
        })
        // set the selected countries of the user
        Object.values(topSelectedCountries).forEach((selectedCountry) => {
            $('#inputTop' + selectedCountry.position + '>option:eq(' + selectedCountry.country_id + ')').attr(
                'selected', true
            );
        })
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * check if you have to add it into the database or update the database
 */
function setTopCountries() {
    const totalSelects = 5;
    FYSCloud.API.queryDatabase(
        "SELECT * FROM topcountry WHERE user_id = ?",
        [user[0].user_id]
    ).done(function (topSelectedCountries) {

        // loop through already selected to check wich to update and wich to insert
        for (let i = 0; i < totalSelects; i++) {
            // if it already exists update the row in database
            if (topSelectedCountries.find(country => country.position === (i + 1))) {
                updateCountryInDatabase((i + 1));
            }
            // else add row to database
            else {
                setCountryInDatabase((i + 1));
            }
        }

        // call success dialog
        showAlertForSucces();
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * to update the row in database
 * @param position
 */
function updateCountryInDatabase(position) {
    // get country id of select
    let countryId = $("#inputTop" + position).val();
    // update country in database
    FYSCloud.API.queryDatabase(
        "UPDATE topcountry SET country_id = ? WHERE user_id = ? AND position = ?",
        [countryId, user[0].user_id, position]
    ).done(function (data) {
        // call the function to change values of selected items
        setVisitedCountriesOfUser(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

/**
 * insert the top country into the database
 * @param position
 */
function setCountryInDatabase(position) {
    // get country id of select
    let countryId = $("#inputTop" + position).val();
    // set country in database
    FYSCloud.API.queryDatabase(
        "INSERT INTO topcountry (user_id, country_id, position) VALUES (?,?,?)",
        [user[0].user_id, countryId, position]
    ).done(function (data) {
        // call the function to change values of selected items
        setVisitedCountriesOfUser(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

// get categories for interests
function getCategories() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM category",
    ).done(function (categories) {
        // loop through the HTML code to get the values of the array to the database
        categories.forEach((category) => {
            $("#interests").append("<div id='" + category.name + "' class='col-12 col-md-4 pl-0 hobbys nav-item dropdown mr-2 mr-sm-0 my-2'></div>");
            $("#" + category.name).append(
                '<a class="border border-info rounded nav-link"' +
                '          href="#"' +
                '                   id="_' + category.type + '"' +
                '                   role="button"' +
                '                   data-toggle="dropdown"' +
                '                   aria-haspopup="true"' +
                '                   aria-expanded="false">' +
                '                    <i class="fa fa-futbol-o text-info"></i>' +
                '                    <span class="col col-md-4 text-info font-weight-bold font-italic">' +
                category.name +
                '                    </span>' +
                '                </a>'
            );

            $("#" + category.name).append('<div id="-' + category.type + '"' +
                'class="dropdown-menu dropdown-menu"' +
                'aria-labelledby="_' + category.type + '"></div>');
        });
        // get all interests for categories
        getInterests();
    }).fail(function (reason) {
        console.log(reason);
    });
}

// get interests
function getInterests() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM interest"
    ).done(function (interests) {
        // loop through the HTML code to get the values of the array to the database
        interests.forEach((interest) => {
            $("#-" + interest.type).append('<div class="' + interest.interest_name + ' mx-4"></div>');
            $("." + interest.interest_name).append('<input type="checkbox" id="input' + interest.interest_id + '" name="' + interest.interest_name + '" value="' + interest.interest_name + '">'
            ).on('click', function () {
                insertInterests(interest);
            });
            $("." + interest.interest_name).append('<label for="' + interest.interest_name + '">' + interest.interest_name + '</label>');
        });
        // get user interests
        getUserInterests();
    }).fail(function (reason) {
        console.log(reason);
    });
}

// insert interests into database when clicked on interest
function insertInterests(interest) {
    let inputValue = $("#input" + interest.interest_id).prop('checked');
    // if the user select the interest
    if (inputValue) {
        // set the user_id and interest_id in the database
        FYSCloud.API.queryDatabase(
            "INSERT INTO userinterest (user_id, interest_id)" +
            "VALUES(?, ?)",
            [user[0].user_id, interest.interest_id]
        ).done(function (data) {
        }).fail(function (reason) {
            console.log(reason);
        });
    }
    // if the user unselect the interest
    else {
        // delete the user_id in combination with the interest_id
        FYSCloud.API.queryDatabase(
            "DELETE FROM userinterest WHERE user_id = ? AND interest_id = ?",
            [user[0].user_id, interest.interest_id]
        ).done(function (data) {
        }).fail(function (reason) {
            console.log(reason);
        });
    }
}

// get the user interests from the dropdowns
function getUserInterests() {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM userinterest WHERE user_id = ?",
        [user[0].user_id]
    ).done(function (data) {
        setUserInterests(data);
    }).fail(function (reason) {
        console.log(reason);
    });
}

// set the user interests with a check icon
function setUserInterests(userInterests) {
    Object.values(userInterests).forEach((interest) => {
        $("#input" + interest.interest_id).prop('checked', true);
    });
}

// delete profile
function deleteProfile(data) {
    FYSCloud.API.queryDatabase(
        "DELETE FROM `uservisitedcountry` WHERE `user_id` IN (?)",
        "DELETE FROM `userinterest` WHERE `user_id` IN (?)",
        "DELETE FROM `topcountry` WHERE `user_id` IN (?)",
        "DELETE FROM `profile` WHERE `user_id` = ?",
        "DELETE FROM `match` WHERE `user_id` IN (?) OR `user_id2` IN (?)",
        "DELETE FROM `user` WHERE `user_id` = ?"
    ).done(function (data) {
        window.alert("Uw account is verwijderd");
    }).fail(function (reason) {
        console.log(reason);
    });
}