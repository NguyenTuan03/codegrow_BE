const { FILTER_USER } = require("../configs/user.config")
const { OK } = require("../core/responses/success.response")
const EnrollService = require('../services/enroll.service')
class enrollController {
    getAllEnroll = async (req,res) => {
        new OK({
            message:'Get all enrollment successfully',
            metadata: await EnrollService.getAllEnroll({
                limit: req.query.limit || 1000,
                sort: req.query.sort || 'ctime',
                page: req.query.page || 1,
                filter: req.query.filter ? JSON.parse(req.query.filter) : FILTER_USER.AVAILABLE_USER, 
                select: req.query.select || '',
                expand: req.query.expand || ''
            })
        }).send(res)
    }
    getEnrollById = async (req,res) => {        
            new OK({
                message:'Get enroll successfully',
                metadata: await EnrollService.getEnrollById(req.params)
            }).send(res)        
    }
}
module.exports = new enrollController()