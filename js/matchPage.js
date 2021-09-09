// $(function() {
//     main();
// });
//
// function main(){
//     FYSCloud.API
//         .queryDatabase("SELECT * FROM test")
//         .done(function(data) {
//             console.log(data);
//
//             let template = $("#matchTemplate").html();
//
//             for (let i = 0; i < data.length; i++){
//                 let matchTemplate = $(template);
//
//                 matchTemplate.find("").text(match.);
//
//                 $(".matches").append(matchTemplate);
//             }
//         })
//         .fail(function(data) {
//             alert("Paniek!");
//         });
// }