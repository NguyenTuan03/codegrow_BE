const {getAll} = require('../repositories/category.repo')
class CategoryService {
    static getAll = async({limit, sort, page, filter, select}) => {
        return await getAll({limit, sort, page, filter, select})
    }
}
module.exports = CategoryService