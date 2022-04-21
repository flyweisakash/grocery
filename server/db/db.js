import mongoose from "mongoose";
import config from "../../config/server";

// Database options
const options = {
    dbName: config.server.dbName,
    user: config.server.user,
    pass: config.server.password
}

// Database connection
mongoose.connect(
    config.server.url,
    options
).then(() => {
    console.log("Database connection sucessful!")
}).catch(err => {
    console.log(err)
});




