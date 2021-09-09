// import FYS cloud
// mockup
// FYSCloud.API.configure({
//     url: "https://api.fys.cloud",
//     apiKey: "fys_is104_3.epsN6RgJPbMDef6N",
//     database: "fys_is104_3",
//     environment: "mockup"
// });

//dev
// FYSCloud.API.configure({
//     url: "https://api.fys.cloud",
//     apiKey: "fys_is104_3.epsN6RgJPbMDef6N",
//     database: "fys_is104_3_4it",
//     environment: "dev"
// });

// live version
FYSCloud.API.configure({
    url: "https://api.fys.cloud",
    apiKey: "fys_is104_3.epsN6RgJPbMDef6N",
    database: "fys_is104_3_live",
    environment: "live"
});

/**
 * Function that loads the navBar
 */
$(function(){
    $("#navbar").load('navbar.html');
});

/**
 * Function that loads the footer
 */
$(function(){
    $("#footer").load('footer.html');
});

/**
 * Function that leads to official corendon website
 */
function goToCorendonSite() {
    window.open("https://www.corendon.nl/Nederland");
}
