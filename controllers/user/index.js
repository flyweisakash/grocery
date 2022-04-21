import mongoose from "mongoose";
import User from "../../models/user"
import Address from "../../models/user/address"

// Get the user by user id
// Get the userById is a middleware function that is used to get the user by user id
export async function getUserById(req, res, next) {
    // Get the user id either from the params or from the query
    const userId  = req.params.userId ? req.params.userId : req.query.userId;

    // if the user id is not a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        // return the error
        return res.status(400).json({
            message: "User id is invalid"
        });
    }

    // Get the user by user id
    User.findById(userId).exec((err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // If the user is not found
        if (user == null) {
            return res.status(401).json({ "error": "No user found" });
        }
        // If the user is found
        req.user = user;
        next();
    });

}

// Get the user details
export async function getUser(req, res) {
    // create new user object from the req.user object
    let user = {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    }
    // Return the user object
    return res.status(200).json(user);
}

// Update the user or edit the user profile
export async function updateUser(req, res) {
    // Get the user id from the request
    const _id = req.user._id;
    // Get the user object from the request
    const { fullName, email, phone } = req.body;

    // what to update
    let user = {
        fullName: fullName,
        email: email,
        phone: phone
    }

    // Update the user
    User.findByIdAndUpdate(_id, user, { new: true }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // send the updated user
        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone
        });
    });
}

// Add new address
export async function addNewAddress(req, res) {
    const {
        fullName,
        addressLine,
        area, state,
        pinCode,
        contact,
        alternateContact
    } = req.body;

    // check all the fields are present
    if (!fullName || !addressLine || !area || !state || !pinCode || !contact || !alternateContact) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    // Check all the address fields are valid
    // ["fullName", "addressLine", "area", "state", "pinCode", "contact", "alternateContact"].forEach(field => {
    //     if (typeof req.body[field] !== "string") {
    //         return res.status(400).json({
    //             error: `${field} is not a valid string`
    //         });
    //     }
    // });

    // Create new address object
    const newAddress = {
        user: req.user._id,
        fullName,
        addressLine,
        area,
        state,
        pinCode,
        contact,
        alternateContact
    };
    // Create address document  
    const address = Address(newAddress);
    // Save the address document
    await address.save((err, address) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // return the address
        return res.status(200).json(address);

    });
}

// Update the address
export async function updateAddress(req, res) {
    // Get the address id from the request params
    const { addressId } = req.params;

    const {
        fullName,
        addressLine,
        area, state,
        pinCode,
        contact,
        alternateContact
    } = req.body;;

    // Create new address object
    const newAddress = {
        fullName,
        addressLine,
        area,
        state,
        pinCode,
        contact,
        alternateContact
    };

    // Update the address
    // find the address by id and update the address
    Address.findByIdAndUpdate(addressId, newAddress, { new: true }, (err, address) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // return the updated address
        return res.status(200).json(address);
    });
}

//Delete the Address
export async function deleteAddress(req, res) {
    // Get the address id from the request params
    const { addressId } = req.params;
    // Delete the address
    Address.findByIdAndRemove(addressId, (err, address) => {
        if (err) {
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // return the deleted address
        return res.status(200).json(address);
    });
}

//Get all Addresses of the user
export async function getAllAddresses(req, res) {
    // Get the user id from the request.user object
    const { _id } = req.user;
    // Get all addresses of the user
    Address.find({ user: _id })
        .sort({ createdAt: -1 })
        .exec((err, addresses) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ "error": "There was an error to process the request" });
            }
            // return all addresses
            return res.status(200).json(addresses);
        });
};

//Get a address
export async function getAddress(req, res) {
    // Get the address id from the request params
    const { addressId } = req.params;
    // Get the address by id
    Address.findById(addressId, (err, address) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }
        // return the address
        return res.status(200).json(address);
    });
}