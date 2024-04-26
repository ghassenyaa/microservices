const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Proto files paths
const libraryProtoPath = 'library.proto';
const bookProtoPath = 'book.proto';
const userProtoPath = 'user.proto';

// Import resolvers and typeDefs for ApolloServer
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// Create tables if not exists
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

const app = express();
app.use(bodyParser.json());

// Load proto definitions
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

// ApolloServer setup
const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  // Set up ApolloServer middleware
  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server),
  );
});

// Routes for fetching libraries and books
app.get('/librarys', (req, res) => {
  db.all('SELECT * FROM librarys', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

app.get('/librarys/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM librarys WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Library not found.');
    }
  });
});

app.get('/books/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Book not found.');
    }
  });
});

// Routes for fetching all books and adding books
app.get('/books', (req, res) => {
  db.all('SELECT * FROM books', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

app.post('/librarys', (req, res) => {
  const { id, title, description } = req.body;
  db.run(
    'INSERT INTO librarys (id, title, description) VALUES (?, ?, ?)',
    [id, title, description],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, title, description });
      }
    }
  );
});

app.post('/books', (req, res) => {
  const { id, title, description } = req.body;
  db.run(
    'INSERT INTO books (id, title, description) VALUES (?, ?, ?)',
    [id, title, description],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, title, description });
      }
    }
  );
});

// Routes for updating libraries and books
app.put('/librarys/:id', (req, res) => {
  const { title, description } = req.body;
  const libraryId = req.params.id;
  db.run(
    'UPDATE librarys SET title = ?, description = ? WHERE id = ?',
    [title, description, libraryId],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id: libraryId, title, description });
      }
    }
  );
});

app.put('/books/:id', (req, res) => {
  const { title, description } = req.body;
  const bookId = req.params.id;
  db.run(
    'UPDATE books SET title = ?, description = ? WHERE id = ?',
    [title, description, bookId],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id: bookId, title, description });
      }
    }
  );
});

// Routes for deleting libraries, books, and users
app.delete('/librarys/:id', (req, res) => {
  const libraryId = req.params.id;
  db.run(
    'DELETE FROM librarys WHERE id = ?',
    libraryId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.run(
    'DELETE FROM books WHERE id = ?',
    bookId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

// Additional routes for users
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('User not found.');
    }
  });
});

app.post('/users', (req, res) => {
  const { id, username, password, email } = req.body;
  db.run(
    'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
    [id, username, password, email],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, username, password, email });
      }
    }
  );
});

app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.run(
    'DELETE FROM users WHERE id = ?',
    userId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
