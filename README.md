# Star Wars Character Search Client

Command line application written in Typescript that enables users to search for
Star Wars characters and which of the first six movies they appears in.

## Running

### Dependencies

* nodejs (developed and tested against v22.11.0)
* docker

### Setup

Install the required npm dependencies
```
npm install
```

Start the backend environment (i..e the provided docker image)
```
npm run backend
```

### Build and run
Build the application
```
npm run build
```

Run the application
```
npm start
```

## Usage notes

* Enter your desired character at the prompt and enjoy your results
* If the connection is interrupted (say by stopping the docker container) then it should
  be automatically re-connected
