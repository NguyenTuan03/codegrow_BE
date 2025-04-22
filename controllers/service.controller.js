const { FILTER_USER } = require("../configs/user.config")
const { CREATED, UPDATED, OK } = require("../core/responses/success.response")
const ServiceService = require('../services/services.service')
class ServiceController {
    getResponseTicket = async(req,res) => {
        new OK({
            message:'Get all tickets successfully',
            metadata: await ServiceService.getAllTickets({
                limit: req.query.limit || 1000,
                sort: req.query.sort || 'ctime',
                page: req.query.page || 1,
                filter: req.query.filter ? JSON.parse(req.query.filter) : FILTER_USER.AVAILABLE_USER, 
                select: req.query.select || '',
                expand: req.query.expand || ''
            })
        }).send(res)
    }
    getResponseMine = async(req,res) => {
        new OK({
            message:'Get all your tickes status successfully',
            metadata: await ServiceService.getResponseMine({
                userId: req.userId
            })
        }).send(res)
    }
    SendTicket = async(req,res) => {
        new CREATED({
            message: 'Create ticket successfully',
            metadata: await ServiceService.sendTickets({
                userId: req.userId,
                ...req.body
            })
        }).send(res)
    }
    responseTicket = async(req,res) => {
        new UPDATED({
            message: 'Reponse ticket successfully',
            metadata: await ServiceService.responseTicket({
                id: req.params.id,
                repliedBy: req.userId,
                ...req.body
            })
        }).send(res)
    }
}
module.exports = new ServiceController()