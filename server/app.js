const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { parseISO, getMonth } = require('date-fns');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const corsOptions = {
    origin: 'http://127.0.0.1:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/Project', {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Add this to eliminate deprecation warning
});

const transactionSchema = new mongoose.Schema({
    ID: Number,
    title: String,
    description: String,
    category: String,
    price: Number,
    dateOfSale: Date,
    sold: Boolean,
    image: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
app.get('/', (req, res) => {
    res.send('hello world')
})
// API to list all transactions with search and pagination
app.get('/listTransactions', async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = '' } = req.query;
        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;

        const query = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { description: regex },
            ];

            // Only apply the regex filter on price if it's present in the query
            if (!isNaN(parseFloat(search)) && isFinite(search)) {
                query.$or.push({ price: parseFloat(search) });
            }
        }

        const filteredTransactions = await Transaction.find(query);

        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

        res.json({ success: true, data: paginatedTransactions });
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API for statistics
app.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        const monthMap = {
            'January': 1,
            'February': 2,
            'March': 3,
            'April': 4,
            'May': 5,
            'June': 6,
            'July': 7,
            'August': 8,
            'September': 9,
            'October': 10,
            'November': 11,
            'December': 12,
        };

        const parsedMonth = monthMap[month] || parseInt(month);

        if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            throw new Error('Invalid month provided');
        }

        // Use $expr to compare the month part of ISODate
        const selectedMonthTransactions = await Transaction.find({
            $expr: {
                $eq: [{ $month: '$dateOfSale' }, parsedMonth],
            },
        });

        const totalSaleAmount = selectedMonthTransactions.reduce((total, transaction) => {
            return total + transaction.price;
        }, 0);

        const totalSoldItems = selectedMonthTransactions.length;

        const totalNotSoldItems = (await Transaction.countDocuments()) - totalSoldItems;

        res.json({ success: true, totalSaleAmount, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        console.error('Error fetching statistics:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


// API for bar chart
// app.get('/barChart', async (req, res) => {
//     try {
//         const { month } = req.query;
//         const monthNumber = parseInt(month, 10);

//         if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
//             res.status(400).json({ success: false, error: 'Invalid month provided' });
//             return;
//         }

//         const priceRanges = [
//             { min: 0, max: 100 },
//             { min: 101, max: 200 },
//             { min: 201, max: 300 },
//             { min: 301, max: 400 },
//             { min: 401, max: 500 },
//             { min: 501, max: 600 },
//             { min: 601, max: 700 },
//             { min: 701, max: 800 },
//             { min: 801, max: 900 },
//             // Assuming 'above' corresponds to a large value
//             { min: 901, max: Number.MAX_SAFE_INTEGER },
//             // ... Add more ranges as needed
//         ];

//         const itemsInPriceRanges = await Promise.all(priceRanges.map(async (range) => {
//             let priceQuery;
//             if (range.max === Number.MAX_SAFE_INTEGER) {
//                 priceQuery = { $gte: range.min };
//             } else {
//                 priceQuery = { $gte: range.min, $lte: range.max };
//             }

//             const itemsInRange = await Transaction.find({
//                 price: priceQuery,
//                 $expr: {
//                     $and: [
//                         { $eq: [{ $month: '$dateOfSale' }, monthNumber + 1] },
//                         { $eq: [{ $year: '$dateOfSale' }, new Date().getFullYear()] },
//                     ],
//                 },
//             });

//             return { range, count: itemsInRange.length };
//         }));

//         res.json({ success: true, data: itemsInPriceRanges });
//     } catch (error) {
//         console.error('Error fetching bar chart data:', error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// });
app.get('/barChart', async (req, res) => {
    try {
        const { month } = req.query;
        const monthNumber = parseInt(month, 10);

        if (isNaN(monthNumber) || monthNumber < 0 || monthNumber > 11) {
            res.status(400).json({ success: false, error: 'Invalid month provided' });
            return;
        }

        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 600 },
            { min: 601, max: 700 },
            { min: 701, max: 800 },
            { min: 801, max: 900 },
            { min: 901, max: Number.MAX_SAFE_INTEGER },
            // ... Add more ranges as needed
        ];

        const itemsInPriceRanges = await Promise.all(priceRanges.map(async (range) => {
            let priceQuery;
            if (range.max === Number.MAX_SAFE_INTEGER) {
                priceQuery = { $gte: range.min };
            } else {
                priceQuery = { $gte: range.min, $lte: range.max };
            }

            const itemsInRange = await Transaction.find({
                price: priceQuery,
                dateOfSale: {
                    $gte: new Date(new Date().getFullYear(), monthNumber, 1),
                    $lt: new Date(new Date().getFullYear(), monthNumber + 1, 1),
                },
            });

            return { range, count: itemsInRange.length };
        }));

        res.json({ success: true, data: itemsInPriceRanges });
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



// API for pie chart
app.get('/pieChart', async (req, res) => {
    try {
        const { month } = req.query;

        const uniqueCategories = await Transaction.distinct('category');

        const categoryCounts = await Promise.all(uniqueCategories.map(async (category) => {
            const itemsInCategory = await Transaction.find({
                category,
                dateOfSale: {
                    $gte: new Date(`${month}-01T00:00:00Z`),
                    $lt: new Date(`${month}-01T00:00:00Z`).setMonth(new Date(`${month}-01T00:00:00Z`).getMonth() + 1),
                },
            });

            return { category, count: itemsInCategory.length };
        }));

        res.json({ success: true, data: categoryCounts });
    } catch (error) {
        console.error('Error fetching pie chart data:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Combined API
app.get('/combinedData', async (req, res) => {
    try {
        const month = req.query.month || 'January'; // Set a default month if not provided
        const [listTransactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
            axios.get(`/listTransactions?month=${month}`),
            axios.get(`/statistics?month=${month}`),
            axios.get(`/barChart?month=${month}`),
            axios.get(`/pieChart?month=${month}`)
        ]);

        res.json({
            success: true,
            listTransactions: listTransactionsResponse.data,
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        });
    } catch (error) {
        console.error('Error fetching combined data:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
// Initialize database
app.get('/initializeDatabase', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const seedData = response.data;

        await Transaction.deleteMany({}); // Clear existing data

        // Assuming the data has an array structure, you may need to adjust this based on the actual data
        await Transaction.insertMany(seedData);

        res.json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
// Add this middleware at the end of your Express app before the error handling middleware

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
