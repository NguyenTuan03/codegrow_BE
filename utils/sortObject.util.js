function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj);
    keys.sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
    return sorted;
}

function extractUserIdFromOrderInfo(info) {
    // decode nếu có dấu '+'
    const cleanInfo = decodeURIComponent(info.replace(/\+/g, " "));
    const parts = cleanInfo.trim().split(" ");
    return parts[parts.length - 1]; // => userId
}
module.exports = { sortObject, extractUserIdFromOrderInfo };
