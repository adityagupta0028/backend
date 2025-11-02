const functions = require("./functions");

module.exports = () => (req, res, next) => {
    // success response
    res.success = (message, data , number) => {
        message = functions.prettyCase(message);
        return res.send({success:true, statusCode: 200, message, data: data || {}, status:number || 1 });
    };

    // error resposne
    res.error = (code, message, data) => {
        message = functions.prettyCase(message);
        res.status(400).send({ statusCode: code, message, data: data || {}, status :0 });
    };
    next();
};


