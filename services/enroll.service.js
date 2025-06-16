const { SELECT_USER, SELECT_COURSE } = require('../configs/user.config')
const enrollModel = require('../models/enroll.model')
const {getAllEnrollment} = require('../repositories/enroll.repo')
class EnrollService {
    static getAllEnroll = async({limit, sort, page, filter, select,expand}) => {
        return await getAllEnrollment({limit, sort, page, filter, select, expand})
    }
    static getEnrollById = async({id}) => {
        const enroll = await enrollModel
            .findOne({_id:id})
            .populate([
                {
                    path: 'user',
                    select: SELECT_USER.DEFAULT
                },
                {
                    path: 'course',
                    select: SELECT_COURSE.DEFAULT
                }
            ])
            .lean()
        if (!enroll) throw new NotFoundRequestError('Enroll not found')
        return enroll;
    }
}
module.exports = EnrollService