const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());
const port = 5001;


// stupid data. Will be change dlater
const data = {12345 : [10, 20, 30, 20, 50], 12346: [30, 20, 10, 0, 50]};

app.get("/" ,(req, res, next) => {
    res.status(200).send("Welcome to ESB Website");
})

app.get("/esb" ,(req, res, next) => {
    res.status(200).send("Welcome to ESB Website");
})

app.post("/esb/verify-consumer", (req, res, next) => {
    const {consumerNo, mobile} = req.body;
    console.log(consumerNo, mobile);
    if (!consumerNo || !mobile) 
    {
        return res.status(400).json({verified: false, message: "Missing cNo or Mobile No"})
    }
    else
    {
        const isVerified = consumerNo === "12345" && mobile === "1234567890";
        res.status(200).json({
            verified: isVerified,
            message: isVerified ? "Consumer verfied successfully" : "Verification failed",
            user: {name: "Kevin", consumerNo: consumerNo, mobile: mobile, address: "16th street", meterNumber: "A22452626"}
        })
    }
})

app.post("/esb/calculate-bill", (req, res, next) => {
    const {consumerNo} = req.body;

    if (consumerNo in data) 
    {
        res.status(200).json({
            "previousReading": 12,
            "currentReading": 13,
            "unitsConsumed": 75,
            "amount": 34000,
            "dueDate": Date.now()
          })
    }
    else
    {
        res.status(400).json({
            error: "Invalid Consumer Number"
        })
    }
})

app.post("/esb/reading-history", (req, res, next) => {
    const {consumerNo} = req.body;
    if (consumerNo in data)
    {
        res.status(200).json({
            "readings": [
              {
                "readingDate": "2025-03-01",
                "unitsConsumed": 10,
                "amount": 35.0,
                "paymentStatus": "paid"
              },
              {
                "readingDate": "2025-02-01",
                "unitsConsumed": 20,
                "amount": 70.0,
                "paymentStatus": "paid"
              },
              {
                "readingDate": "2025-01-01",
                "unitsConsumed": 30,
                "amount": 105.0,
                "paymentStatus": "paid"
              },
              {
                "readingDate": "2024-12-01",
                "unitsConsumed": 20,
                "amount": 70.0,
                "paymentStatus": "paid"
              },
              {
                "readingDate": "2024-11-01",
                "unitsConsumed": 50,
                "amount": 175.0,
                "paymentStatus": "unpaid"
              }
            ]
          })
    }
    else
    {
        res.status(400).json(
            {
                error: "Invalid Consumer Number"
            }
        )
    }
    
})





// app.post("/esb/save-reading", (req, res, next) => {
//     // assumptions
//     // 0 - consumer
//     // 1 - inspector
//     const {user, consumerNo, currentReading} = req.body;
//     if (user == 0) 
//     {
        

//     }
// })

app.listen(port);