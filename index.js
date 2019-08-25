const express = require('express');
const app = express();

const ip2loc = require('ip2location-nodejs');
const _ = require('lodash');

const rateLimit = require('express-rate-limit');


//120 requests in 60s for each client ip address
const limiter = rateLimit({
    windowsMs: 60*1000,
    max: 120
});

app.use(limiter);

//Put your IP2LOCATION database in the db folder
//Set the environement variable "IP2LOC_DB" to its name with its extension.
const ip2loc_db = process.env.IP2LOC_DB || "IP2LOCATION-LITE-DB3.BIN";
ip2loc.IP2Location_init(`./db/${ip2loc_db}`);


const {param, validationResult} = require('express-validator');

app.get('/:ipaddress', param('ipaddress', 'IP Address is invalid').isIP(), (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).send(error);


    const raw_data = ip2loc.IP2Location_get_all(req.params.ipaddress);
    // In Case you have a premium IP2LOCATION DB:
    // Delete the line below and use 'raw_data' instead of 'data' to get all the information (isp, coordinates...).
    const data = _.pick(raw_data, ['ip', 'country_short', 'country_long', 'region', 'city', 'status']);
    
    res.send(data);
});



const port = process.env.IP2LOC_PORT || 3000 ;
app.listen(port, () => console.log(`Listening on port ${port}...`));