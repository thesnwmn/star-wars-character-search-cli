# Project Instructions

## Overview

As a member of the Valstro Engineering team, interacting with event-driven APIs is a task that comes up often. The purpose of this assessment is to show that you can interact with a simple Websocket API(implemented with [Socket.io v4](https://socket.io/docs/v4/).

The [Star Wars API](https://swapi.dev/documentation#search) is a public REST API for making queries about the first 6 Star Wars films. We have provided a simple Socket.io wrapper to allow you to query this dataset and get results streamed back asynchronously.

The only endpoint exposed for this task is the "people" search- so, you'll be creating a console app to search for Star Wars characters. Search is case-insensitive and works on the basis of partial matches, so a query like "dar" should match Darth Vader, Darth Maul, and others.

Requirements will be explained below, but the general goal is this: build a simple console (command line) application in your stack/framework of choice (or as directed by your interviewers) that can search for movie characters by name, handle asynchronous streaming responses, and handle any errors that may occur.

## Server Setup & Requirements

It will be necessary for you to pull and run a prepared Docker image to bring up the Socket.io backend

- You will need a recent version of Docker installed

- Run the following command at a terminal: `docker run -p 3000:3000 clonardo/socketio-backend`

## API Info

- The test API server is a Socket.IO v4.x-based websocket server listening on `http://localhost:3000`

- The API makes use of [named events in socket.io](https://socket.io/docs/v4/listening-to-events/).

- Standard `connect`, `disconnect`, and `error` events are used for informational purposes

- Queries should be sent to the server as `search` events, and replies (including errors) will be sent back to the client as `search` events as well.

### Search Request Semantics

_Request_

* As described above, `search` events should be raised using the Socket.io client API to trigger search actions on the server
* The query that the client sends to the server should have an object payload of the form `{query: string}`, such as `{query: "Luke"}`

_Multiple Responses_

Important: `search` events will be received as single element arrays on the client. Multiple responses will be broken into multiple messages.

* In the event of one or more matches: multiple `search` events (as described below) will be received from the server

```
[{
    // Message index. If this matches resultCount, it is the last message in a sequence!
    page: 5

    // total number of results to be sent to client
    resultCount: 42

    // name matched against query
    name: "Luke Skywalker",

    // array of comma-separated strings, showing a character's filmography
    films: ["A New Hope", "The Empire Strikes Back", "Return of the Jedi", "Revenge of the Sith"]
}]
```

Note on Streaming: to simulate a real-world websocket API, if multiple matches have been found (again, meaning that multiple messages will be sent from the server to the client), publication of each message will be delayed by a random 250-1,000ms interval

* In the event of an error (or no matches against your query term), an error object (as described below -- again, inside a single element array) will be returned:

```
[{
    // if a message represents an error, page & resultCount will always be -1
    page: -1,
    resultCount: -1,

    // error text will always be populated for errors
    error: "Server Error: Unknown - Fatal"
}]
```

## Requirements

* The candidate must produce a console/CLI application (the "Client App") that acts as a Socket.io client to the test server as described here
* The Client App must allow a user to search for arbitrary strings against the person/character search API
* The Client App works with the prepared `clonardo/socketio-backend` Docker image (representing the server)
* When search results are received, the names of the character that was matched ("name" field)+ their filmography ("films" field) should be printed to the console
* When any errors are received, they should be logged to the console
* The console should reset on completion of a search (on receipt of the last message in case of success, or on any error) to allow the user to make another search without restarting the application
* Unless directed to do otherwise, please implement the Client App in the tech stack of your choice.

## Help

* Please e-mail careers@valstro.com with any questions
* Please see [here](https://youtu.be/9KXWKNWczs0) for a brief video of a working, accepted solution

# How to submit

Upload your completed project to your GitHub, and then paste a link to the repository below in the form along with any comments you have about your solution.

Please be sure to  include a README.md file with instructions on how to build and Run your App.