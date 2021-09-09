{
    // global variables
    let userRowTemplate = $('#adminRow').html();
    let startRow = 0;
    let totalUsers = 0;
    $(function () {
        // get all the users
        getTotalUsers();
    })

    /**
     * function to get all the users out the database
     */
    function getUsers() {
        const usersPerCall = 10;
        FYSCloud.API.queryDatabase(
            "SELECT * FROM user LIMIT ? OFFSET ?",
            [usersPerCall, startRow]
        ).done(function (users) {
            startRow += usersPerCall;
            if (totalUsers <= startRow) {
                $('#moreUsersButton').remove();
            }
            // loop through users and make row in table
            users.forEach((user) => {
                let template = $(userRowTemplate);
                $('#userTableBody').append(template);
                // user id
                template.find('#user_id').text(user.user_id);
                // email
                template.find('#email').text(user.email);
                // profile button
                template.find('#showProfileButton').click(
                    function () {
                        showProfileData(user);
                    });
                //this is the disable button
                template.find('#deactivateButton').click(
                    function () {
                        disableUser(user);
                    });
            })
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * Function that loads the profiledata of users on the admin page
     */
    function showProfileData(user) {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM profile WHERE user_id = ?",
            [user.user_id]
        ).done(function (users) {
            $(".adminNaam").append("<h5 id='voorNaamAdmin'>Volledige naam: " + users[0].first_name + " " + users[0].last_name + "</h5>");
            $(".adminGeslacht").append("<h5 id='geslachtAdmin'>Geslacht: " + geslachtAdmin(users[0].gender) + "</h5>");
            $(".adminDateOfBirth").append("<h5 id='dateOfBirthAdmin'>Geboortedatum: " + date_of_birth_admin(users[0].date_of_birth) + "</h5>");
            $(".adminBiography").append("<h5 id='biographyAdmin'>Biografie: " + biographyAdmin(users[0].biography) + "</h5>");
            $(".adminPhoneNumber").append("<h5 id='phoneNumberAdmin'>Telefoonnummer: " + phoneNumberAdmin(users[0].phonenumber) + "</h5>");
            avatarAdmin();

            /**
             * Function that loads the phonenumber of the user
             */
            function phoneNumberAdmin(phoneNumber) {
                if (users[0].phonenumber === null || users[0].phonenumber === "") {
                    return "Dit account heeft geen telefoonnummer opgegeven.";
                } else {
                    return phoneNumber;
                }
            }

            /**
             * Function that loads the biography of the user
             */
            function biographyAdmin(biography) {
                if (users[0].biography === null) {
                    return "Dit account heeft geen biografie opgegeven.";
                } else {
                    return biography;
                }
            }

            /**
             * Function that loads the avatar os the user
             */
            function avatarAdmin() {
                if (users[0].avatar !== null) {
                    $("#standardAvatar").remove();
                    $("#adminAvatar").append("<img height='300px' width='300px' id='customAvatar' src='" + users[0].avatar + "' alt=''> ");
                } else {
                    $("#standardAvatar").remove();
                    $("#adminAvatar").append("<img id='standardAvatar' src='https://eitrawmaterials.eu/wp-content/uploads/2016/09/person-icon.png' alt=''> ");
                }
            }

            /**
             * Function that calculates the date of birth (on the admin page)
             */
            function date_of_birth_admin(date) {
                date = new Date(date);
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();

                let date_of_birth = (day + '-' + month + '-' + year);
                if (date_of_birth === "1-1-1970") {
                    return "Dit account heeft geen geboortedatum opgegeven.";
                } else {
                    return date_of_birth;
                }
            }

            /**
             * Function that loads the gender of the user
             */
            function geslachtAdmin(geslacht) {
                if (users[0].gender === 1) {
                    geslacht = "man";
                }
                if (users[0].gender === 2) {
                    geslacht = "vrouw";
                }
                if (users[0].gender === 3) {
                    geslacht = "overig";
                }
                return geslacht;
            }
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * Function that resets the pop-up of the selected user
     */
    function resetAdminPopUp() {
        $("#voorNaamAdmin").remove();
        $("#geslachtAdmin").remove();
        $("#dateOfBirthAdmin").remove();
        $("#customAvatar").remove();
        $("#biographyAdmin").remove();
        $("#phoneNumberAdmin").remove();
    }

    $('#profileDialog').on('hidden.bs.modal', function (removeData) {
        resetAdminPopUp();
    })

    /**
     * Function that disables (a reported) user
     */
    function disableUser(user) {
        const status = 1;
        FYSCloud.API.queryDatabase(
            "UPDATE `user` SET status = ? WHERE user_id = ?",
            [status, user.user_id]
        ).done(function (data) {
            sendDisableMail(user);
            alert(user.email +" is nu uitgeschakeld.");
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * Function that sends an email to the disabled user
     */
    function sendDisableMail(user) {
        FYSCloud.API.sendEmail({
            from: {
                name: "Corendon Match-Maker",
                address: "Admin@4it.nl",
            },
            to: [
                {
                    name: "Corendon Matcher",
                    address: user.email,
                }
            ],
            subject: "Account tijdelijk uitgeschakeld",
            html: "<p>Dag Vakantieliefhebber,<br><br><p><p>Wij sturen jou deze mail, omdat wij jouw account tijdelijk" +
                "hebben uitgeschakeld. Dit kan door om verschillende redenen gebeuren en wij begrijpen dat je graag wilt weten waarom. " +
                "U krijgt binnen 10 werkdagen meer informatie over hoe je jouw account" +
                "weer terug kan krijgen. Of misschien ben je hem permanent kwijt. <br> Je hoort snel van ons! <br>" +
                "<br> Met vriendelijke groeten, <br> De Corendon Match-Makers <br><br> " +
                "Tel.: 023 7510606 <br> Singaporestraat 82 <br>1175RA Lijnden Nederland<br> KvK nr.: 34220902 <br> </p>"
        }).done(function(data) {
            console.log(data);
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    /**
     * Function to get all users
     */
    function getTotalUsers() {
        FYSCloud.API.queryDatabase(
            "SELECT COUNT(user_id) AS total_users FROM user"
        ).done(function (users) {
            totalUsers = users[0].total_users;
            getUsers();
        }).fail(function (reason) {
            console.log(reason);
        });
    }
}