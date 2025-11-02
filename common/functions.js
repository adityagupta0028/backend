const _ = require("lodash");
const fs = require('fs');
const { DateTime } = require("luxon");

module.exports.setPrecision = async (no, precision) => {
    precision = precision || 3;
    if (!isNaN(no)) {
        return (+(Math.round(+(no + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    } else {
        return 0;
    }
};
module.exports.prettyCase = (str) => {
    if (typeof str === "string" && /^[A-Z_]+$/.test(str)) {
        str = _.lowerCase(str);
        str = _.startCase(str);
    }
    return str;
};
module.exports.toDecimals = (val, decimal = 2) => {
    const base = Math.pow(10, decimal);
    return Math.round(val * base) / base;
};
module.exports.toObject = (data, key, val) => {
    if (!Array.isArray(data)) throw new Error("INVALID_DATA");
    if (!key || typeof key !== "string") throw new Error("INVALID_KEY");

    const newObj = {};
    if (data.length > 0) {
        for (const item of data) {
            newObj[item[key] + ""] = !!val ? item[val] : item;
        }
    }
    return newObj;
};
