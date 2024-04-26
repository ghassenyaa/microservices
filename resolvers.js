const sqlite3 = require('sqlite3').verbose();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Protobuf files paths
const libraryProtoPath = 'library.proto';
const bookProtoPath = 'book.proto';
const userProtoPath = 'user.proto';

// Load protobuf definitions
const libraryProtoDefinition = protoLoader.loadSync(libraryProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load gRPC packages
const libraryProto = grpc.loadPackageDefinition(libraryProtoDefinition).library;
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

// Create gRPC clients
const clientLibrarys = new libraryProto.LibraryService('localhost:50051', grpc.credentials.createInsecure());
const clientBooks = new bookProto.BookService('localhost:50052', grpc.credentials.createInsecure());
const userLibrarys = new userProto.UserService('localhost:50053', grpc.credentials.createInsecure());

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// Create tables if they don't exist
db.run(`
  CREATE TABLE IF NOT EXISTS librarys (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT
  )
`);

// Define GraphQL resolvers
const resolvers = {
  Query: {
    // Resolver to get a single library by its ID
    library: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM librarys WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver to get all libraries
    librarys: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM librarys', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    // Resolver to get a single book by its ID
    book: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver to get all books
    books: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM books', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    // Resolver to get a single user by its ID
    user: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver to get all users
    users: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
  },
  Mutation: {
    // Resolver to create a new library
    CreateLibrary: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO librarys (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    // Resolver to create a new book
    CreateBook: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO books (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    // Resolver to update a library
    UpdateLibrary: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE librarys SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    // Resolver to update a book
    UpdateBook: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE books SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    // Resolver to delete a library
    DeleteLibrary: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM librarys WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },
    // Resolver to delete a book
    DeleteBook: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM books WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },
    // Resolver to create a new user
    CreateUser: (_, { id, username, password, email }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
          [id, username, password, email],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email });
            }
          }
        );
      });
    },
    // Resolver to update a user
    UpdateUser: (_, { id, username, password, email }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?',
          [username, password, email, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email });
            }
          }
        );
      });
    },
    // Resolver to delete a user
    DeleteUser: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },
  },
};

module.exports = resolvers;
