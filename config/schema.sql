CREATE TABLE IF NOT EXISTS person (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE IF NOT EXISTS complaint (
    complaintid INTEGER PRIMARY KEY AUTOINCREMENT,
    consumerNo INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    dateIssued TEXT NOT NULL,
    FOREIGN KEY (consumerNo) REFERENCES consumer(consumerid)
);
