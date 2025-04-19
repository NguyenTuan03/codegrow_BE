const { FILTER_USER } = require("../configs/user.config")
const { OK } = require("../core/responses/success.response")
const CategoryService = require('../services/category.service')
class CategoryController {
    getAll = async (req,res) => {
        new OK({
            message:'Get all categories successfully',
            metadata: await CategoryService.getAll({
                limit: req.query.limit || 1000,
                sort: req.query.sort || 'ctime',
                page: req.query.page || 1,
                filter: req.query.filter ? JSON.parse(req.query.filter) : FILTER_USER.AVAILABLE_USER, 
                select: req.query.select || '',
                expand: req.query.expand || ''
            })
        }).send(res)
    }
}
module.exports = new CategoryController()