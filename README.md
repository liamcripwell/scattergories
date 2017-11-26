# Play-Scala-React Template

This is a template project using Play 2.5, Scala and React.

## React Usage

React integration has been set up using WebJars and [sbt-reactjs](https://github.com/dispalt/sbt-reactjs). All .jsx scripts are to be stored in app/assets/javascripts.

## Running

Run this using [sbt](http://www.scala-sbt.org/).

```
sbt run
```

And then go to http://localhost:9000 to see the running web application.

There are several demonstration files available in this template.

## Controllers

- HomeController.scala:

  Shows how to handle simple HTTP requests. Currently responds with a basic html page containing an example React component.

## Components

- Module.scala:

  Shows how to use Guice to bind all the components needed by your application.

- ApplicationTimer.scala:

  An example of a component that starts when the application starts and stops
  when the application stops.

## Filters

- Filters.scala:

  Creates the list of HTTP filters used by your application.

- ExampleFilter.scala

  A simple filter that adds a header to every response.
