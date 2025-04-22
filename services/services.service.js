const { BadRequestError } = require("../core/responses/error.response")
const userModel = require("../models/user.model")
const responseModel = require('../models/response.model')
const {getAllTickets} = require('../repositories/ticket.repo')
const courseModel = require("../models/course.model")
const { SELECT_USER, SELECT_COURSE } = require("../configs/user.config")
class ServiceService {
    static getAllTickets = async({limit, sort, page, filter, select,expand}) => {
        return await getAllTickets({limit, sort, page, filter, select, expand})
    }
    static getResponseMine = async({userId}) => {
        const responses = await responseModel.find({ sender: userId })
            .populate([
                {
                    path:'sender',
                    select: SELECT_USER.DEFAULT
                },
                {
                    path:'course',
                    select: SELECT_COURSE.DEFAULT
                },
            ])
            .sort({ createdAt: -1 });
        return responses;
    }
    static sendTickets = async({userId,courseId, title, message}) => {
        if (!userId) throw new BadRequestError('User id is required')
        if (!title || !message) throw new BadRequestError('All fields are required')

        const user = await userModel.findById(userId)
        if (!user) throw new BadRequestError('Cannot find user')

        const course = await courseModel.findById(courseId)
        if (!course) throw new BadRequestError('Cannot find course')

        const response = await responseModel.create({
            sender:user._id,
            title,
            message,
            course: course._id
        });
        return response
    }
    static responseTicket = async({id,repliedBy,status, qaqcReply}) => {
        if (!id) throw new BadRequestError('Id is required')
        if (!qaqcReply) throw new BadRequestError('Need to answer this service')
        if (!['resolved', 'rejected'].includes(status)) {
            throw new BadRequestError('Status must be resolved or rejected');
        }
        const updated = await responseModel.findByIdAndUpdate(
            id,
            {
                qaqcReply,
                status,
                repliedBy,
                replyAt: new Date()
            },
            { new: true }
        );
        return updated;
    }

}
module.exports = ServiceService