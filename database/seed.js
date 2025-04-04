const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const additionalColumns = `
ALTER TABLE bill ADD COLUMN isPaid BOOLEAN DEFAULT 0;
ALTER TABLE bill ADD COLUMN paidDate TEXT NULL;
`;

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  console.log('Creating database directory');
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'database', 'schema.db');

// Delete existing database if it exists to prevent constraint errors
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new sqlite3.Database(dbPath);

// SQL schema
const schema = `
CREATE TABLE IF NOT EXISTS person (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE,
    address TEXT
);

CREATE TABLE IF NOT EXISTS consumer (
    consumerid INTEGER PRIMARY KEY AUTOINCREMENT,
    id INTEGER NOT NULL, 
    meterNumber TEXT UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS moderator (
    moderatorid INTEGER PRIMARY KEY AUTOINCREMENT,
    id INTEGER NOT NULL,
    FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connection (
    connid INTEGER PRIMARY KEY AUTOINCREMENT,
    consumerid INTEGER NOT NULL,
    terminated BOOLEAN DEFAULT 0,
    terminatedDate TEXT NULL,
    issuedDate TEXT NOT NULL,
    FOREIGN KEY (consumerid) REFERENCES consumer(consumerid)
);

CREATE TABLE IF NOT EXISTS bill (
    billid INTEGER PRIMARY KEY AUTOINCREMENT,
    reading REAL NOT NULL,
    unitsConsumed INTEGER NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    moderatorid INTEGER NOT NULL,
    issuedDate TEXT NOT NULL,
    connectionid INTEGER NOT NULL,
    consumerid INTEGER NOT NULL,
    FOREIGN KEY (moderatorid) REFERENCES moderator(moderatorid),
    FOREIGN KEY (consumerid) REFERENCES consumer(consumerid),
    FOREIGN KEY (connectionid) REFERENCES connection(connid)
);

CREATE TABLE IF NOT EXISTS complaint (
    complaintid INTEGER PRIMARY KEY AUTOINCREMENT,
    consumerNo INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    dateIssued TEXT NOT NULL,
    FOREIGN KEY (consumerNo) REFERENCES consumer(consumerid)
);
`;

console.log('Starting database setup...');

// Execute database setup
db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
      return;
    }
    console.log('Foreign keys enabled');
  });
  
  // Create tables
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
      return;
    }
    console.log('Tables created successfully');
    
    // Insert data one by one to debug any issues
    console.log('Inserting sample data...');
    
    // 1. Insert persons
    db.run(`INSERT INTO person (id, name, mobile, address) VALUES (123456789012, 'John Doe', '9876543210', '123 Main St')`, (err) => {
      if (err) {
        console.error('Error inserting first person:', err.message);
        return;
      }
      console.log('First person inserted');
      
      db.run(`INSERT INTO person (id, name, mobile, address) VALUES (234567890123, 'Jane Smith', '8765432109', '456 Oak Ave')`, (err) => {
        if (err) {
          console.error('Error inserting second person:', err.message);
          return;
        }
        console.log('Second person inserted');
        
        db.run(`INSERT INTO person (id, name, mobile, address) VALUES (345678901234, 'Robert Brown', '7654321098', '789 Pine Rd')`, (err) => {
          if (err) {
            console.error('Error inserting third person:', err.message);
            return;
          }
          console.log('Third person inserted');
          
          db.run(`INSERT INTO person (id, name, mobile, address) VALUES (456789012345, 'Emily Wilson', '6543210987', '101 Cedar Ln')`, (err) => {
            if (err) {
              console.error('Error inserting fourth person:', err.message);
              return;
            }
            console.log('Fourth person inserted');
            
            // 2. Insert consumers
            db.run(`INSERT INTO consumer (id, meterNumber) VALUES (123456789012, 'M001')`, (err) => {
              if (err) {
                console.error('Error inserting first consumer:', err.message);
                return;
              }
              console.log('First consumer inserted');
              
              db.run(`INSERT INTO consumer (id, meterNumber) VALUES (234567890123, 'M002')`, (err) => {
                if (err) {
                  console.error('Error inserting second consumer:', err.message);
                  return;
                }
                console.log('Second consumer inserted');
                
                // 3. Insert moderators
                db.run(`INSERT INTO moderator (id) VALUES (345678901234)`, (err) => {
                  if (err) {
                    console.error('Error inserting first moderator:', err.message);
                    return;
                  }
                  console.log('First moderator inserted');
                  
                  db.run(`INSERT INTO moderator (id) VALUES (456789012345)`, (err) => {
                    if (err) {
                      console.error('Error inserting second moderator:', err.message);
                      return;
                    }
                    console.log('Second moderator inserted');
                    
                    // 4. Insert connections
                    db.run(`INSERT INTO connection (consumerid, terminated, issuedDate) VALUES (1, 0, '2024-01-01')`, (err) => {
                      if (err) {
                        console.error('Error inserting first connection:', err.message);
                        return;
                      }
                      console.log('First connection inserted');
                      
                      db.run(`INSERT INTO connection (consumerid, terminated, issuedDate) VALUES (2, 0, '2024-02-15')`, (err) => {
                        if (err) {
                          console.error('Error inserting second connection:', err.message);
                          return;
                        }
                        console.log('Second connection inserted');
                        
                        // 5. Insert bills
                        db.run(`INSERT INTO bill (reading, unitsConsumed, amount, dueDate, moderatorid, issuedDate, connectionid, consumerid) VALUES 
                          (100.5, 75, 1500.0, '2024-04-15', 1, '2024-03-15', 1, 1)`, (err) => {
                          if (err) {
                            console.error('Error inserting first bill:', err.message);
                            return;
                          }
                          console.log('First bill inserted');
                          
                          db.run(`INSERT INTO bill (reading, unitsConsumed, amount, dueDate, moderatorid, issuedDate, connectionid, consumerid) VALUES 
                            (200.3, 95, 1900.0, '2024-04-15', 1, '2024-03-15', 2, 2)`, (err) => {
                            if (err) {
                              console.error('Error inserting second bill:', err.message);
                              return;
                            }
                            console.log('Second bill inserted');
                            
                            db.run(`INSERT INTO bill (reading, unitsConsumed, amount, dueDate, moderatorid, issuedDate, connectionid, consumerid) VALUES 
                              (150.8, 85, 1700.0, '2024-03-15', 2, '2024-02-15', 1, 1)`, (err) => {
                              if (err) {
                                console.error('Error inserting third bill:', err.message);
                                return;
                              }
                              console.log('Third bill inserted');
                              
                              db.run(`INSERT INTO bill (reading, unitsConsumed, amount, dueDate, moderatorid, issuedDate, connectionid, consumerid) VALUES 
                                (250.1, 105, 2100.0, '2024-03-15', 2, '2024-02-15', 2, 2)`, (err) => {
                                if (err) {
                                  console.error('Error inserting fourth bill:', err.message);
                                  return;
                                }
                                console.log('Fourth bill inserted');
                                
                                // 6. Insert complaints
                                db.run(`INSERT INTO complaint (consumerNo, title, description, dateIssued) VALUES 
                                  (1, 'High Bill', 'My bill seems unusually high this month', '2024-03-10')`, (err) => {
                                  if (err) {
                                    console.error('Error inserting first complaint:', err.message);
                                    return;
                                  }
                                  console.log('First complaint inserted');
                                  
                                  db.run(`INSERT INTO complaint (consumerNo, title, description, dateIssued) VALUES 
                                    (2, 'Meter Issues', 'I think my meter is not working correctly', '2024-03-05')`, (err) => {
                                    if (err) {
                                      console.error('Error inserting second complaint:', err.message);
                                      return;
                                    }
                                    console.log('Second complaint inserted');
                                    console.log('Sample data inserted successfully');
                                    
                                    // Close database connection
                                    db.close((err) => {
                                      if (err) {
                                        console.error('Error closing database:', err.message);
                                      } else {
                                        console.log('Database connection closed');
                                      }
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

db.exec(additionalColumns, (err) => {
  if (err) {
    console.error('Error adding payment columns:', err.message);
    return;
  }
  console.log('Payment columns added successfully');
});
console.log('Database setup script executed');