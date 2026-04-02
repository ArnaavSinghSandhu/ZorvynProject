const express = require("express")
const app = express()
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
app.use(cors());
app.use(express.json()) 

const authRoutes = require('./middleware/main.js');
const router = require('./routes/record.js');
const dashboard = require('./routes/dashboard.js');
const user = require('./routes/user.js');

app.use('/api/auth',authRoutes)
app.use('/api/records',router)
app.use('/api/dashboard',dashboard)
app.use('/api/users',user)

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})



