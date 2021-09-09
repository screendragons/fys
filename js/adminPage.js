{
    let admin = FYSCloud.Session.get("user");

    $(function() {
        // load admin image in sidebar
        checkLevel();
        getAdminProfile();
    })

    /**
     * Function that checks the level of the user (user or admin)
     */
    function checkLevel() {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM user WHERE user_id = ?",
            [admin[0].user_id]

        ).done(function(adminLevel) {
            if (adminLevel[0].level === 2) {
                $('#adminContent').load("adminPage/adminPageUsers.html");
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }

    /**
     * Function that loads the profile of the admin
     */
    function getAdminProfile() {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM profile WHERE user_id = ?",
             [admin[0].user_id]

        ).done(function(adminDetails) {
            admin = adminDetails[0];
            // check if there is an avatar
            if(admin.avatar !== null) {
                $('#navbarAvatar').attr('src', admin.avatar);
            }
        }).fail(function(reason) {
            console.log(reason);
        });
    }

}