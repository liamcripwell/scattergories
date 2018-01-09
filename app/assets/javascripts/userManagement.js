// handle stream of users in room
var userFeed = new EventSource("/userfeed/" + room);

var user = "";

userFeed.addEventListener("message", function(msg){
    var m = JSON.parse(msg.data);
    console.log(m.users);

    // update content of user list
    $("#userlist").html(function(){
        var updatedUsers = "";

        m.users.forEach(function(member, i){
            if (member === user) {
                updatedUsers += "<li><span class=\"label label-primary\">" + member + "</span></li>";
            } else {
                updatedUsers += "<li><span class=\"label label-default\">" + member + "</span></li>";
            }
        });

        return updatedUsers;
    });
});

setTimeout(function() {
    // send new user data to server
    user = prompt("Username:");
    while (user === null || user === "") {
        user = prompt("Username:");
    }

    $.ajax({
        url: "/newuser",
        data: JSON.stringify({room: room, user: user}),
        method: "post",
        contentType: "application/json",
        success: function (msg) {
            console.log(msg);
        }
    });

    console.log(user + " requests to join " + room);
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