{
    // global variables
    let user = FYSCloud.Session.get('user');
    let matchTemplate = $('#matchResultTempalte').html();

    $(function () {
        // the call to get all your matches
        getAllMatches();
    })

    /**
     * to get the matches of the user
     */
    function getAllMatches() {
        // to empty the html list of matches
        $('.matches').empty();

        const statusToBeAMatch = 2;
        FYSCloud.API.queryDatabase(
            "SELECT * FROM `match` WHERE (user_id = ? AND status = ?) OR (user_id2 = ? AND status = ?) ",
            [user[0].user_id, statusToBeAMatch, user[0].user_id, statusToBeAMatch]
        ).done(function (matches) {
            matches.forEach((match) => {
                getProfileData(match);
            })
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * to get the profile data of the match and set it in the page
     * @param match
     */
    function getProfileData(match) {
        const matchUserId = match.user_id === user[0].user_id ? match.user_id2 : match.user_id;
        FYSCloud.API.queryDatabase(
            "SELECT profile.*, `user`.email" +
            " FROM profile JOIN `user` " +
            " ON profile.user_id = `user`.user_id " +
            "WHERE profile.user_id = ?",
            [matchUserId]
        ).done(function (profileData) {

            let template = $(matchTemplate);
            $('.matches').append(template);
            //firstname
            template.find('.match-name').text(profileData[0].first_name);
            // avatar
            // if avatar is null, use default image
            if (profileData[0].avatar !== null) {
                template.find('.match-image')
                    .attr('src', profileData[0].avatar)
                    .on('error', function changeImageOnError() {
                        template.find('.match-image').attr('src', '../img/zakelijke-man.jpg');
                    });
            }
            // remove match button
            template.find('.removeMatchButton').click(function () {
                removeMatch(match);
            });
            // send message to match
            template.find('.messageButton').click(function () {
                sendEmail(profileData[0]);
            });
            // age and gender
            template.find('.match-age-gender').text(
                calculateAge(profileData[0].date_of_birth) + ' / ' + getGender(profileData[0].gender)
            );
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * to remove specific person from your matches
     * @param match
     */
    function removeMatch(match) {
        FYSCloud.API.queryDatabase(
            "DELETE FROM `match` WHERE match_id = ?",
            [match.match_id]
        ).done(function (data) {
            // to update the list with matches
            getAllMatches();
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * functon to send a mail to the match
     * @param profileData
     */
    function sendEmail(profileData) {
        window.location = "mailto:" + profileData.email;
    }

    /**
     * to calculate the age of the user based on his date of birth
     * @param date_of_birth
     * @returns {number}
     */
    function calculateAge(date_of_birth) {
        // time will be removed
        let dob = new Date(date_of_birth).toISOString().split("T")[0];

        // calculate the milliseconds in a year
        let MILLISECONDS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;
        // split the date to get a number
        let date_array = dob.split('-')
        // get age
        let years_elapsed = (new Date() - new Date(
            date_array[0],
            date_array[1],
            date_array[2])) / (MILLISECONDS_IN_A_YEAR
        );
        // parseInt is cutting all the numbers after the comma
        // to get the whole number of years and to return
        return parseInt(years_elapsed);
    }

    /**
     * to get the gender in a word
     * @param gender
     * @returns {string}
     */
    function getGender(gender) {
        // switch statement to check which gender is chosen
        switch (gender) {
            case 1:
                return "Man";
            case 2:
                return "Vrouw";
            case 3:
                return "Andere";
        }
    }
}