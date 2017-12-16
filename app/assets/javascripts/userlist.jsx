class MyComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            score: 0
        };
    }

    render() {
        return (
            <div>
            <h3>{this.state.score}</h3>
            </div>
        );
    }
}

React.render(
    <MyComponent />,
    document.getElementById('content')
);