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
    const parts = info.trim().split(" ");
    return parts[parts.length - 1];
}
module.exports = { sortObject, extractUserIdFromOrderInfo };
