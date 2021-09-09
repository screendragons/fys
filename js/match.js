{
    // global variables
    let user = FYSCloud.Session.get('user');
    let allInterest = [];
    let matchableDataArray;
    let matchesSorted = [];
    let alreadyMatched = [];
    let matchTemplate = $('#matchTemplate').html();

    $(function () {
        // the function call to get all the matchable data of a user
        getMatchableDataOfUser();
        // the function call to get all the interests
        getAllInterests();
        // call fucntion to get Personal Matches
        getPersonalMatches();
    })

    /**
     * Function to get the interest of the user
     */
    function getMatchableDataOfUser() {
        // select all the data of the user in 1 statement already nice sorted
        // you receive a user_id, interest_id, country_id, top_country_id
        FYSCloud.API.queryDatabase(
            "SELECT user_id, interest_id, NULL AS country_id, NULL AS top_country_id" +
            " FROM userinterest WHERE user_id = ? " +
            " UNION ALL " +
            "SELECT user_id, NULL AS interest_id, country_id, NULL AS top_country_id" +
            " FROM uservisitedcountry WHERE user_id = ? " +
            " UNION ALL " +
            "SELECT user_id, NULL AS interest_id, NULL AS country_id, country_id as top_country_id" +
            " FROM topcountry WHERE user_id = ? ",
            [user[0].user_id, user[0].user_id, user[0].user_id]
        ).done(function (matchableData) {
            // set the interests in the variable
            matchableDataArray = matchableData;
            // function to get the matches
            getMatchesOnData();
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * to get the matches based on interest
     */
    function getMatchesOnData() {
        let countries = [];
        let interests = [];
        let topCountries = [];
        matchableDataArray.forEach((matchData) => {
            // push data in different arrays to call 1 sql statement
            switch (true) {
                case (matchData.country_id !== null):
                    countries.push(matchData.country_id);
                    break;
                case (matchData.top_country_id !== null):
                    topCountries.push(matchData.top_country_id);
                    break;
                case (matchData.interest_id !== null):
                    interests.push(matchData.interest_id);
                    break;
            }
        })

        if (topCountries.length === 0) topCountries = null;
        if (countries.length === 0) countries = null;
        if (interests.length === 0) interests = null;

        // sql call to get all the matches on the user data
        FYSCloud.API.queryDatabase(
            "SELECT user_id, country_id, NULL AS interest_id" +
            " FROM topcountry WHERE user_id != ? AND country_id IN (?) " +
            " UNION ALL " +
            "SELECT user_id, country_id, NULL AS interest_id" +
            " FROM uservisitedcountry WHERE user_id != ? AND country_id IN (?) " +
            " UNION ALL " +
            "SELECT user_id, NULL AS country_id, interest_id" +
            " FROM userinterest WHERE user_id != ? AND interest_id IN (?)",
            [user[0].user_id, topCountries, user[0].user_id, countries, user[0].user_id, interests]
        ).done(function (matches) {
            // loop through all data to remove duplicated user_id's
            matches.forEach((match) => {
                // set times of being a match to 1
                match.quantity = 1;
                // if new array = empty or index is not found push person in array
                if (matchesSorted.length === 0 ||
                    !matchesSorted.some(matchesInArray => matchesInArray.user_id === match.user_id)) {
                    matchesSorted.push(match);
                }
                // change quantity because of double match
                else {
                    // if aleardy in array add 1 to quantity for sorting on best match
                    matchesSorted.find(defaultMatch => defaultMatch.user_id === match.user_id).quantity++;
                }
            });
            // sort the matches
            const sorted = matchesSorted.sort(function (a, b) {
                return b.quantity - a.quantity;
            });
            // loop through the sorted list and call the function to set the matches in the page
            sorted.forEach((match) => {
                setMatchesInPage(match);
            });
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    // display matches in page
    function setMatchesInPage(match) {
        // to don't show users where you already are a match with
        // if alreadyMatch.user_id2 and match.user_id means if the user already selected that person
        // if alreadyMatch.user_id and match.user_id means you are already a match with that person (status = 2)
        if (
            alreadyMatched.some(alreadyMatch => alreadyMatch.user_id2 === match.user_id) ||
            alreadyMatched.some(alreadyMatch => alreadyMatch.user_id === match.user_id)

        ) {
            return;
        }
        FYSCloud.API.queryDatabase(
            "SELECT * FROM userinterest WHERE user_id = ? LIMIT 3",
            [match.user_id]
        ).done(function (interestData) {
            getProfileData(interestData, match);
        }).fail(function (reason) {
            console.log(reason);
        });
    };

    /**
     * to calculate age from user
     *
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

    // get all existing interests
    function getAllInterests() {
        FYSCloud.API.queryDatabase(
            "SELECT * FROM interest",
        ).done(function (interest) {
            allInterest = interest;
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    // show interest of user at match page
    function setInterestsToMatch(userinterest) {
        // interest array
        let interestsByName = [];
        userinterest.forEach((interest) => {
            if (allInterest.find(interestDefault => interestDefault.interest_id === interest.interest_id) === undefined) return;

            interestsByName.push(
                allInterest.find(interestDefault => interestDefault.interest_id === interest.interest_id).interest_name,
            );
        });
        return interestsByName.slice(0, 3);
    }

    /**
     * funtion to match with a person
     * @person
     */
    function matchWithPerson(person, button) {
        // check if the match already exist in the database
        FYSCloud.API.queryDatabase(
            "SELECT * FROM `match` WHERE user_id = ? AND user_id2 = ? OR user_id = ? AND user_id2 = ?",
            [user[0].user_id, person, person, user[0].user_id]
        ).done(function (match) {
            // if there is not already a match row in the datbase with user_id's
            if (match.length === 0) {
                createMatchInDatabase(person, button);
            } else {
                updateStatusOfMatch(match, button);
            }
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * to create a row in match table
     * @param person
     * @param button
     */
    function createMatchInDatabase(person, button) {
        FYSCloud.API.queryDatabase(
            "INSERT INTO `match` (user_id, user_id2) VALUES (?, ?)",
            [user[0].user_id, person]
        ).done(function (match) {
            $(button).attr("disabled", true);
            $(button).html('Waiting');
            $(button).removeClass('button-option');
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    function getPersonalMatches() {
        // if the status is 2 you are already a match
        const statusWhenNotAMatch = 1;

        FYSCloud.API.queryDatabase(
            "SELECT * FROM `match` WHERE user_id = ? OR (user_id2 = ? AND status = ?)",
            [user[0].user_id, user[0].user_id, statusWhenNotAMatch]
        ).done(function (matches) {
            alreadyMatched = matches;
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    /**
     * update status of match to 2 because the other already asked you to be a match
     * @param selectedMatch
     * @param button
     */
    function updateStatusOfMatch(selectedMatch, button) {
        FYSCloud.API.queryDatabase(
            "UPDATE `match` SET status = ? WHERE match_id = ?",
            [2, selectedMatch[0].match_id]
        ).done(function (match) {
            $(button).attr("disabled", true);
            $(button).html('Match!!!');
            $(button).removeClass('button-option');
        }).fail(function (reason) {
            console.log(reason);
        });
    }

    // get data from profile and set is as match
    function getProfileData(interestData, match) {
        FYSCloud.API.queryDatabase(
            "SELECT `profile`.*, `user`.`level`, `user`.`status`" +
            "FROM `profile`" +
            "JOIN `user`" +
            "ON `profile`.`user_id` = `user`.`user_id`" +
            "WHERE `profile`.`user_id` = ?",
            [match.user_id]
        ).done(function (profileData) {
            // check if profile has data or user is not admin or account is not on non-active
            const adminStatus = 2;
            const nonActiveLevel = 1;
            if (
                profileData[0] === undefined ||
                profileData[0].level === adminStatus ||
                profileData[0].status === nonActiveLevel
            ) {
                return;
            }
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

            // hobby
            // let x = setInterestsToMatch(interestData);

            let interestsByName = [];
            interestData.forEach((interest) => {
                if (allInterest.find(interestDefault => interestDefault.interest_id === interest.interest_id) === undefined) return;

                interestsByName.push(
                    allInterest.find(interestDefault => interestDefault.interest_id === interest.interest_id).interest_name,
                );
            });
            interestsByName = interestsByName.slice(0, 3);

            // get the first three interests
            template.find('.hobby1').text(interestsByName[0] === undefined ? '' : interestsByName[0]);
            template.find('.hobby2').text(interestsByName[1] === undefined ? '' : interestsByName[1]);
            template.find('.hobby3').text(interestsByName[2] === undefined ? '' : interestsByName[2]);

            // age and gender
            template.find('.match-age-gender').text(
                calculateAge(profileData[0].date_of_birth) + ' / ' + getGender(profileData[0].gender)
            );
            // add button and make it possible to add to match
            template.append(
                '<div class="col pl-0 text-center">' +
                '<button class="button-option text-white font-weight-bold font-italic rounded">Match</button>' +
                '</div>'
            ).on("click", "button", function () {
                matchWithPerson(profileData[0].user_id, this);
            });
        }).fail(function (reason) {
            console.log(reason);
        });
    }
}