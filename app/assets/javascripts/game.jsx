class Game extends React.Component {

    constructor(props) {
        super(props);

        // handle stream game events
        var gameFeed = new EventSource("/gamefeed/" + room);

        gameFeed.addEventListener("message", function(msg){

            let m = JSON.parse(msg.data);
            this.parseEvent(m);

        }.bind(this));

        this.state = {
            inGame: false
        };
    }

    parseEvent(m) {
        if (m.type === "start") {
            this.setState({
                inGame: true,
                letter: m.letter
            });
        } else if (m.type === "userready" && m.user === user) {
            this.setState({
                inGame: true,
                letter: this.state.letter,
                ready: true
            });
        }
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

    userReady() {
        $.ajax({
            url: "/userready",
            data: JSON.stringify( {
                "room": room,
                "user": user
            } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
        });
    }

    render() {
        if (!this.state.inGame) {
            return (
                <div>
                    <p>Wait for all players to join, then click button to begin...</p>
                    <button onClick={this.lockRoom.bind(this)}>Start Game</button>
                </div>
            );
        } else if (this.state.ready !== true) {
            return (
                <div>
                    <p>The current letter is... {this.state.letter}</p>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon1">cat1</span>
                        <input type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon1" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon2">cat2</span>
                        <input type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon2" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon3">cat3</span>
                        <input type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon3" />
                    </div>

                    <button onClick={this.userReady.bind(this)}>I'm ready!</button>
                </div>
            );
        } else if (this.state.ready) {
            return (
                <div>
                    <p>Nice going big boy...</p>
                </div>
            )
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);