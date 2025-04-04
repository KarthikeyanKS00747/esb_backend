const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
const port = 5001;

// Database connection
const dbPath = path.join(__dirname, "database", "schema.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Simple database check to verify tables exist
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='person'", (err, row) => {
    if (err) {
        console.error("Error checking database tables:", err.message);
    } else if (!row) {
        console.error("Database tables not found. Please run seed.js first.");
    } else {
        console.log("Database tables verified.");
    }
});

app.get("/" ,(req, res, next) => {
    res.status(200).send("Welcome to ESB Website");
});

app.get("/esb" ,(req, res, next) => {
    res.status(200).send("Welcome to ESB Website");
});

// User login
app.post("/esb/login/user", (req, res, next) => {
    const {aadhaar, mobile} = req.body;
    console.log(aadhaar, mobile); // Debug log
    
    if (!aadhaar || !mobile) {
        return res.status(400).json({
            verified: false,
            message: "Aadhaar and mobile number are required"
        });
    }
    
    const token = "someUsertoken1";
    const query = `SELECT * FROM person WHERE id = ? AND mobile = ?`;
    
    db.get(query, [aadhaar, mobile], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ 
                verified: false,
                error: "Database error",
                message: err.message
            });
        } 
        
        if (row) {
            // Check if this person is a consumer
            db.get("SELECT * FROM consumer WHERE id = ?", [aadhaar], (err, consumerRow) => {
                if (err) {
                    console.error("Error checking consumer status:", err.message);
                    return res.status(500).json({ error: "Database error" });
                }
                
                res.status(200).json({
                    verified: true,
                    token: token,
                    user: {
                        name: row.name,
                        aadhaar: row.id,
                        mobile: row.mobile,
                        address: row.address,
                        isConsumer: consumerRow ? true : false,
                        consumerId: consumerRow ? consumerRow.consumerid : null
                    }
                });
            });
        } else {
            res.status(401).json({
                verified: false,
                message: "Invalid Aadhaar or mobile"
            });
        }
    });
});

// Inspector login
app.post("/esb/login/inspector", (req, res, next) => {
    const {aadhaar, mobile} = req.body;
    console.log("Inspector login attempt:", aadhaar, mobile); // Debug log
    
    if (!aadhaar || !mobile) {
        return res.status(400).json({
            verified: false,
            message: "Aadhaar and mobile number are required"
        });
    }
    
    const token = "someInspectortoken1";
    
    const query = `
        SELECT p.*, m.moderatorid FROM person p
        JOIN moderator m ON p.id = m.id
        WHERE p.id = ? AND p.mobile = ?
    `;
    
    db.get(query, [aadhaar, mobile], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ 
                verified: false,
                error: "Database error" 
            });
        } 
        
        if (row) {
            res.status(200).json({
                verified: true,
                token: token,
                user: {
                    name: row.name,
                    aadhaar: row.id,
                    mobile: row.mobile,
                    moderatorId: row.moderatorid
                }
            });
        } else {
            res.status(401).json({
                verified: false,
                message: "Invalid credentials or not authorized as inspector"
            });
        }
    });
});

// Verify consumer
app.post("/esb/verify-consumer", (req, res, next) => {
    const {consumerid, mobile} = req.body;
    
    if (!consumerid || !mobile) {
        return res.status(400).json({
            verified: false, 
            message: "Missing Consumer ID or Mobile No"
        });
    }

    console.log(consumerid, mobile);
    
    const query = `
        SELECT c.consumerid, c.meterNumber, p.name, p.mobile, p.address, p.id as aadhaar
        FROM consumer c
        JOIN person p ON c.id = p.id
        WHERE c.consumerid = ?
    `;
    
    db.get(query, [consumerid], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        } 
        
        if (row) {
            res.status(200).json({
                verified: true,
                message: "Consumer verified successfully",
                user: {
                    name: row.name,
                    consumerNo: row.consumerid,
                    mobile: row.mobile,
                    address: row.address,
                    meterNumber: row.meterNumber,
                    aadhaar: row.aadhaar
                }
            });
        } else {
            res.status(401).json({
                verified: false,
                message: "Verification failed"
            });
        }
    });
});

// Calculate bill
app.post("/esb/calculate-bill", (req, res, next) => {
    const {consumerid} = req.body;
    
    if (!consumerid) {
        return res.status(400).json({error: "Missing Consumer ID"});
    }
    
    const query = `
        SELECT billid, reading, unitsConsumed, amount, dueDate, issuedDate, isPaid
        FROM bill 
        WHERE consumerid = ? 
        ORDER BY issuedDate DESC 
        LIMIT 1
    `;
    
    db.get(query, [consumerid], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        } 
        
        if (row) {
            res.status(200).json({
                billId: row.billid,
                previousReading: row.reading - row.unitsConsumed,
                currentReading: row.reading,
                unitsConsumed: row.unitsConsumed,
                amount: row.amount,
                dueDate: row.dueDate,
                issuedDate: row.issuedDate,
                isPaid: row.isPaid === 1
            });
        } else {
            res.status(404).json({
                error: "No bills found for this consumer"
            });
        }
    });
});

// Reading history
app.post("/esb/reading-history", (req, res, next) => {
    const {consumerid} = req.body;
    
    if (!consumerid) {
        return res.status(400).json({error: "Missing Consumer ID"});
    }
    
    const query = `
        SELECT reading, unitsConsumed, amount, dueDate, issuedDate
        FROM bill 
        WHERE consumerid = ? 
        ORDER BY issuedDate DESC 
        LIMIT 5
    `;
    
    db.all(query, [consumerid], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        } 
        
        if (rows && rows.length > 0) {
            const readings = rows.map(row => {
                // Determine if the payment is past due
                const isPastDue = new Date(row.dueDate) < new Date();
                
                return {
                    readingDate: row.issuedDate,
                    unitsConsumed: row.unitsConsumed,
                    amount: row.amount,
                    paymentStatus: isPastDue ? "unpaid" : "paid"
                };
            });
            
            res.status(200).json({ readings });
        } else {
            res.status(404).json({
                error: "No reading history found for this consumer"
            });
        }
    });
});

// Add complaint
app.post("/esb/add-complaint", (req, res, next) => {
    const {consumerNo, title, description} = req.body;
    
    if (!consumerNo || !title || !description) {
        return res.status(400).json({error: "Missing required fields"});
    }
    
    const dateIssued = new Date().toISOString().split('T')[0];
    
    const query = `
        INSERT INTO complaint (consumerNo, title, description, dateIssued)
        VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [consumerNo, title, description, dateIssued], function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        
        res.status(201).json({
            success: true,
            message: "Complaint registered successfully",
            complaintId: this.lastID
        });
    });
});

// Get all complaints
app.get("/esb/complaints/:consumerNo", (req, res, next) => {
    const consumerNo = req.params.consumerNo;
    
    if (!consumerNo) {
        return res.status(400).json({error: "Missing Consumer Number"});
    }
    
    const query = `
        SELECT * FROM complaint
        WHERE consumerNo = ?
        ORDER BY dateIssued DESC
    `;
    
    db.all(query, [consumerNo], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        
        res.status(200).json({ complaints: rows || [] });
    });
});

app.post("/esb/mark-bill-paid", (req, res, next) => {
    const {billId, consumerid} = req.body;
    
    if (!billId || !consumerid) {
        return res.status(400).json({error: "Missing Bill ID or Consumer ID"});
    }
    
    // Update the bill status to paid in the database
    const query = `
        UPDATE bill 
        SET isPaid = 1, paidDate = ? 
        WHERE billid = ? AND consumerid = ?
    `;
    
    const paidDate = new Date().toISOString().split('T')[0];
    
    db.run(query, [paidDate, billId, consumerid], function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error", message: err.message });
        }
        
        if (this.changes > 0) {
            res.status(200).json({
                success: true,
                message: "Payment processed successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Bill not found or already paid"
            });
        }
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});