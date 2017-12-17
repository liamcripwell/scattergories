// handle stream of users in room
var feed = new EventSource("/userfeed/" + room);

feed.addEventListener("message", function(msg){
    var m = JSON.parse(msg.data);
    console.log(m.users);

    $("#userlist").html(function(){
        updatedUsers = "";

        m.users.forEach(function(user, i){
            updatedUsers += "<div>" + user + "</div>";
        });

        return updatedUsers;
    });
});

var user = "";

setTimeout(function() {
    // send new user data to server
    user = prompt("Username:");
    while (user === null || user === ""){
        user = prompt("Username:");
    }

    $.ajax({
        url: "/newuser",
        data: JSON.stringify({ room: room, user: user }),
        method: "post",
        contentType: "application/json"
    });

    console.log("sent user information");
}, 100);


// notify server of user leaving room
window.onbeforeunload = function(){
    $.ajax({
        url: "/removeuser",
        data: JSON.stringify({ room: room, user: user }),
        method: "post",
        contentType: "application/json"
    });
};