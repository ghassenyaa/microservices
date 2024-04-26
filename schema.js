const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Library {
    id: String!
    title: String!
    description: String!
  }

  type Book {
    id: String!
    title: String!
    description: String!
  }

  type User {
    id: String!
    username: String!
    password: String!
    email: String!
  }

  type Query {
    library(id: String!): Library
    librarys: [Library]
    book(id: String!): Book
    books: [Book]
    user(id: String!): User
    users: [User]
  
  }
  type Mutation {
    CreateLibrary(id: String!, title: String!, description:String!): Library
    CreateBook(id: String!, title: String!, description:String!): Book
    UpdateLibrary(id: String!, title: String!, description:String!): Library
    UpdateBook(id: String!, title: String!, description:String!): Book
    DeleteLibrary(id: String!): Library
    DeleteBook(id: String!): Book
    CreateUser(id: String!, username: String!, password: String!, email: String!): User
    UpdateUser(id: String!, username: String!, password: String!, email: String!): User
    DeleteUser(id: String!): User
  
  
  }
`;

module.exports = typeDefs