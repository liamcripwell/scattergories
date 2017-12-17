class Game extends React.Component {

    constructor(props) {
        super(props);

        // handle stream game events
        var gameFeed = new EventSource("/gamefeed/" + room);

        gameFeed.addEventListener("message", function(msg){
            var m = JSON.parse(msg.data);

            if (m.type === "start") {
                this.setState({
                    inGame: true
                });
            }

        }.bind(this));

        this.state = {
            inGame: false
        };
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
        });
    }

    render() {
        if (this.state.inGame) {
            return (
                <p>You're in for it now boyo...</p>
            )
        } else {
            return (
                <div>
                    <p>Wait for all players to join, then click button to begin...</p>
                    <button onClick={this.lockRoom.bind(this)}>Start Game</button>
                </div>
            );
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);