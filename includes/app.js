import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';

import rateLimit from 'express-rate-limit';

import { readFileSync } from 'fs';

const commands = [
    "help",
    "restart",
    "shutdown",
    "version"
]

function startServer(serverAdminPassword) {
    const logger = global.modules.get('logger');
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.static(path.resolve('core/dashboard/public')));

    app.use(cors());
    app.use(helmet());

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    }));

    app.get('/', (req, res) => {
        res.sendFile(path.resolve('core/dashboard/public', 'index.html'));
    });

    app.use((req, res, next) => {
        if (req.headers['xva-access-token'] != serverAdminPassword) return res.status(401).send('Unauthorized');
        next();
    });

    app.get('/getConfig', (req, res) => {
        const config = global.config;
