const { BadRequestError } = require("../core/responses/error.response")
const userModel = require("../models/user.model")
const responseModel = require('../models/response.model')
const {getAllTickets} = require('../repositories/ticket.repo')
const courseModel = require("../models/course.model")
const { SELECT_USER, SELECT_COURSE } = require("../configs/user.config")
const ClassroomModel = require("../models/Classroom.model")
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
    static sendTickets = async({ userId, courseId, classId, title, message }) => {
        if (!userId) throw new BadRequestError('User id is required');
        if (!title || !message) throw new BadRequestError('All fields are required');
      
        const user = await userModel.findById(userId);
        if (!user) throw new BadRequestError('Cannot find user');
      
        const payload = {
          sender: user._id,
          title,
          message,
        };
            
        if (courseId) {
          const course = await courseModel.findById(courseId);
          if (!course) throw new BadRequestError('Course not found');
          payload.course = course._id;
        }
      
        if (classId) {
          const classroom = await ClassroomModel.findById(classId);
          if (!classroom) throw new BadRequestError('Class not found');
          payload.class = classroom._id;
        }
      
        const response = await responseModel.create(payload);
        return response;
    };
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