const express = require("express")
const app = express()
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

app.use(cors());
app.use(express.json()) 

app.use(express.static('frontend'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const authRoutes = require('./middleware/main.js');
const router = require('./routes/record.js');
const dashboard = require('./routes/dashboard.js');
const user = require('./routes/user.js');

app.use('/api/auth',authRoutes)
app.use('/api/records',router)
app.use('/api/dashboard',dashboard)
app.use('/api/users',user)

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
})

app.use(errorHandler)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})



