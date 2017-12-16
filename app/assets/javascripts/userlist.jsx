class MyComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            score: 0
        };

//         this.feed = new EventSource("/userfeed/@room");
//         this.feed.addEventListener("message", function(msg){
//             this.setState({
//                 score: this.state.score+1
//             });
//         });
    }

    render() {
        return (
            <h3>{this.state.score}</h3>
        );
    }
}

React.render(
    <MyComponent />,
    document.getElementById('content')
);