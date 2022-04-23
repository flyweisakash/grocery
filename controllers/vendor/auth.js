import Vendor from "../../models/vendor";

// Check if the provided email is already registered
export async function checkEmail(req, res, next) {

    // if no email is provided in the req object, return error
    if (req.body.email == undefined) {
        return res.status(400).json({ error: "No email provided" });
    }

    // if the email is null or empty, return error
    if (req.body.email == null || req.body.email == "") {
        return res.status(400).json({ error: "Email is not provided" });
    }

    // Check if the provided email is already registered
    Vendor.findOne({ email }, (err, vendor) => {
        // if error, return error
        if (err) {
            return res.status(500).json({ error: err });
        }

        // if the email is already registered, return error
        if (vendor) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // if the email is not registered, continue
        next();
    });
};

// Check if the provided phone is already registered
export async function checkPhone(req, res, next) {
    // if no phone is provided in the req object, return error
    if (req.body.phone == undefined) {
        return res.status(400).json({ error: "No phone provided" });
    }

    // if the phone is null or empty, return error
    if (req.body.phone == null || req.body.phone == "") {
        return res.status(400).json({ error: "Phone is not provided" });
    }

    // Check if the provided phone is already registered
    Vendor.findOne({ phone }, (err, vendor) => {
        // if error, return error
        if (err) {
            return res.status(500).json({ error: err });
        }

        // if the phone is already registered, return error
        if (vendor) {
            return res.status(400).json({ error: "Phone is already registered" });
        }

        // if the phone is not registered, continue
        next();
    });
};

// Check the GST number
export async function checkGST(req, res, next) {
    // if no GST number is provided in the req object, return error
    if (req.body.gstNumber == undefined) {
        return res.status(400).json({ error: "No GST number provided" });
    }

    // if the GST number is null or empty, return error
    if (req.body.gstNumber == null || req.body.gstNumber == "") {
        return res.status(400).json({ error: "GST number is not provided" });
    }

    // Check if the provided GST number is already registered
    Vendor.findOne({ gstNumber }, (err, vendor) => {
        // if error, return error
        if (err) {
            return res.status(500).json({ error: err });
        }

        // if the GST number is already registered, return error
        if (vendor) {
            return res.status(400).json({ error: "GST number is already registered" });
        }

        // if the GST number is not registered, continue
        next();
    });
};


//Register the vendor account
export async function register(req, res) {

    // Change the req.password property into req.plainPassword
    req.plainPassword = req.body.password;
    // destruct the req.body object
    const { name,
        ownerName,
        email,
        phone,
        gstNumber,
        address,
        city,
        state,
        zip,
        plainPassword
    } = req.body;

    // If the provided properties are undefined, return error
    if (name == undefined
        || ownerName == undefined
        || email == undefined
        || phone == undefined
        || gstNumber == undefined
        || address == undefined
        || city == undefined
        || state == undefined
        || zip == undefined
        || plainPassword == undefined
    ) {
        return res.status(400).json({ error: "Please provide all the required fields" });
    }

    // if the provided propeties are null or empty, return error
    if (name == null || name == ""
        || ownerName == null || ownerName == ""
        || email == null || email == ""
        || phone == null || phone == ""
        || gstNumber == null || gstNumber == ""
        || address == null || address == ""
        || city == null || city == ""
        || state == null || state == ""
        || zip == null || zip == ""
        || plainPassword == null || plainPassword == ""
    ) {
        return res.status(400).json({ error: "Please provide all the required fields" });
    }

    // Save the vendor account
    const vendor = new Vendor({
        name,
        ownerName,
        email,
        phone,
        gstNumber,
        address,
        city,
        state,
        zip,
        plainPassword
    });

    // Save the vendor account
    vendor.save((err, vendor) => {
        // if error, return error
        if (err) {
            return res.status(500).json({ error: "There was an error to process the request" });
        }

        // if the vendor account is saved, return success
        return res.status(200).json(vendor);
    });
}

