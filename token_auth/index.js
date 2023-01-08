const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const cors = require('cors');
const axios = require('axios');
const { auth } = require('express-oauth2-jwt-bearer');
const fs = require('fs');

require('dotenv').config();

const checkJwt = auth({
    audience: process.env.AUTH_AUDIENCE,
    issuerBaseURL: process.env.AUTH_DOMAIN,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/get-user-info', checkJwt, (req, res) => {
    const auth = req.auth;
    if (auth) {
        axios
            .get(`${process.env.AUTH_DOMAIN}api/v2/users/${auth.payload.sub}`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            })
            .then(({ data }) => {
                return res.json({
                    username: data.nickname,
                });
            })
            .catch((err) => {
                console.log('Error: ' + err);
                return res.status(403).end();
            });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
