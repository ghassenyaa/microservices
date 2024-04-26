const sqlite3 = require('sqlite3').verbose();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Path to the book proto file
const bookProtoPath = 'book.proto';

// Load the book proto definition
const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the BookService from the proto definition
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;

// Define book service methods
const bookService = {
  // Method to get a book
  getBook: (call, callback) => {
    // Dummy book data for demonstration
    const notif = {
      id: call.request.book_id,
      title: 'book ex',
      description: 'This is an example book.',
    };
    // Return the book
    callback(null, { notif });
  },
};

// Create a gRPC server
const server = new grpc.Server();

// Add the BookService to the server
server.addService(bookProto.BookService.service, bookService);

const port = 50052;

// Initialize SQLite database
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Database connected.');
});

// Create a table for books if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Uncomment below to insert a sample book into the table
// db.run(`
//   INSERT INTO books (id, title, description)
//   VALUES (1, 'book ex', 'This is an example book.')
// `);

// Bind the server to the specified port
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }

  console.log(`Server is running on port ${port}`);
  // Start the server
  server.start();
});

console.log(`Book microservice running on port ${port}`);
