class Game extends React.Component {

    constructor(props) {
        super(props);

        // adds a new event which updates a user count whenever a new
        // user joins the room
        var feed = new EventSource("/userfeed/" + room);
        feed.addEventListener("message", function(msg){
            var m = JSON.parse(msg.data);
            this.newGuy(m.users.length)
        }.bind(this));

        this.state = {
            score: 0
        };
    }

    // update state variable "score"
    newGuy(numUsers) {
        this.setState({
            score: numUsers
        });
    }

    lockRoom() {
        $.ajax({
            url: "/lockroom",
            data: JSON.stringify( { "room": room } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
        })
    }

    render() {
        return (
            <div>
                <p>Wait for all players to join, then click button to begin...</p>
                <button onClick={this.lockRoom}>Start Game</button>
            </div>
        );
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);