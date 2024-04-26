# GraphQL and gRPC Service Integration  
This project demonstrates the integration of GraphQL and gRPC services using Node.js, SQLite, and Protobuf.  

## Features  
- GraphQL API to manage libraries, books, and users.  
- gRPC service for managing books.  
- SQLite database for storing data.  
- Integration with both RESTful and gRPC APIs.  

## Installation  
1. Clone the repository:  
  ```
  git clone https://github.com/ghassenyaa/microservices.git
  ```


2. Install dependencies:  
  ```
  cd your-repo
  npm install
  ```  

3. Set up the database:  
- Ensure you have SQLite installed.  
- Run the following command to create the SQLite database and tables:  
  ```
  touch database.db
  ```  

4. Start the server:  
  ```
  node apiGatways.js
  ```

## Usage  
- The GraphQL server runs on http://localhost:3000/graphql.  
- RESTful endpoints are available for libraries, books, and users.  
- gRPC services are available for managing books, libraries, and users.  

## GraphQL Queries and Mutations  
- `library(id: ID!): Get a library by its ID.`  
- `librarys: Get all libraries.`  
- `book(id: ID!): Get a book by its ID.`  
- `books: Get all books.`  
- `user(id: ID!): Get a user by its ID.`  
- `users: Get all users.`  
- `createLibrary(id: ID!, title: String!, description: String!): Create a new library.`  
- `createBook(id: ID!, title: String!, description: String!): Create a new book.`  
- `updateLibrary(id: ID!, title: String!, description: String!): Update a library.`  
- `updateBook(id: ID!, title: String!, description: String!): Update a book.`  
- `deleteLibrary(id: ID!): Delete a library.`  
- `deleteBook(id: ID!): Delete a book.`  
- `createUser(id: ID!, username: String!, password: String!, email: String!): Create a new user.`  
- `updateUser(id: ID!, username: String!, password: String!, email: String!): Update a user.`  
- `deleteUser(id: ID!): Delete a user.`  

## gRPC Services  
- The gRPC service for managing books runs on localhost:50052.  
- The gRPC service for managing libraries runs on localhost:50051.  
- The gRPC service for managing users runs on localhost:50053.  
- You can use gRPC clients to interact with the services using the corresponding service definitions provided in library.proto and user.proto.  
