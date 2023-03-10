const mongoose = require("mongoose");

// Administrator Schema
const administratorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please Enter Administrator First Name "],
    },
    lastName: {
        type: String,
        required: [true, "Please Enter Administrator Last Name "],
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/,
            "Please Enter a valid Email",
        ],
        required: [true, "Please Enter Administrator Email"],
    },
    password: {
        type: String,
        minlength: 4,
        required: [true, "Please Enter Administrator Password"],
    },
    birthDate: {
        type: Date,
        required: [true, "Please Enter Administrator Birth Date"],
    },
    hireDate: {
        type: Date,
        required: [true, "Please Enter Administrator Hire Date"],
    },
    image: String,
    salary: {
        type: Number,
        required: [true, "Please Enter Administrator Salary"],
    },
});

// Mapping Schema to Model
mongoose.model("administrators", administratorSchema);
