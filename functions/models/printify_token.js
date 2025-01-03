const mongoose = require("mongoose");

const printifyTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
});

module.exports = mongoose.model("printifytokens", printifyTokenSchema);
