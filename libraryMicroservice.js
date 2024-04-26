const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const libraryProtoPath = 'library.proto';
const libraryProtoDefinition = protoLoader.loadSync(libraryProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const libraryProto = grpc.loadPackageDefinition(libraryProtoDefinition).library;
const db = new sqlite3.Database('./database.db'); 

// Create a table for librarys
db.run(`
  CREATE TABLE IF NOT EXISTS librarys (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);


const libraryService = {
  getLibrary: (call, callback) => {
    const { library_id } = call.request;
    
    db.get('SELECT * FROM librarys WHERE id = ?', [library_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        const library = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        callback(null, { library });
      } else {
        callback(new Error('Library not found'));
      }
    });
  },
  searchLibrarys: (call, callback) => {
    db.all('SELECT * FROM librarys', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        const librarys = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        }));
        callback(null, { librarys });
      }
    });
  },
  CreateLibrary: (call, callback) => {
    const { library_id, title, description } = call.request;
    db.run(
      'INSERT INTO librarys (id, title, description) VALUES (?, ?, ?)',
      [library_id, title, description],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const library = {
            id: library_id,
            title,
            description,
          };
          callback(null, { library });
        }
      }
    );
  },
};



const server = new grpc.Server();
server.addService(libraryProto.LibraryService.service, libraryService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Library microservice running on port ${port}`);
