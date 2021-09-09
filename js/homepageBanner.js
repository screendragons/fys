/**
 * Function that loads the right buttons on the homepageBanner
 */
$(function(){
    let userId = FYSCloud.Session.get("user");
    if (userId === undefined){
        $("#registerButtonCard").show();
        $("#matchButtonCard").hide();
        $("#myMatchesCard").hide();
    } else {
        $("#registerButtonCard").hide();
        $("#matchButtonCard").show();
        $("#myMatchesCard").show();

    }
});

/**
 * Function that scrolls to the frequently asked questions
 */
function moreInfo() {
    window.scrollTo({
        top: 1920,
        behavior: 'smooth'
    });
}