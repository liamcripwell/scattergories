class Game extends React.Component {

    constructor(props) {
        super(props);

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

        this.setState({
            inGame: true
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