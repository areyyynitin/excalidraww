import express from 'express';
import cors from 'cors'
import roomRoutes from './routes/room';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/rooms", roomRoutes);

app.listen(port, () => {
    console.log(`>>> HTTP Backend running on http://localhost:${port}`);
});
