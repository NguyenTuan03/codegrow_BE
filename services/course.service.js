const { SELECT_USER } = require('../configs/user.config')
const { BadRequestError } = require('../core/responses/error.response')
const courseModel = require('../models/course.model')
const categoryModel = require('../models/category.model')
const enrollModel = require('../models/enroll.model')
const {getAllCourses} = require('../repositories/course.repo')
class CourseService {
    static getAllCourse = async({limit, sort, page, filter, select,expand}) => {
        return await getAllCourses({limit, sort, page, filter, select, expand})
    }
    static getCourseById = async({id}) => {
        const classroom = await courseModel
            .findOne({_id:id})
            .populate([
                {
                    path: 'author',
                    select: SELECT_USER.DEFAULT
                },
                {
                    path:'category',
                    select: 'name'
                }
            ])
            .lean()
        if (!classroom) throw new NotFoundRequestError('Course not found')
        return classroom;
    }
    static createCourse = async({title, description, price, author, category}) => {
        if (!title || !description) {
            throw new BadRequestError('Missing any required fields: title, description')
        }
        const foundcategory = await categoryModel.findById(category)
        if (!foundcategory) throw new BadRequestError('Missing category id')

        const newCourse = await courseModel.create({
            title,
            description,
            price: price || 0,
            author,
            category:foundcategory._id
        });
        return newCourse;
    }
    static updateCourse = async ({ id, title, description, price, author, category }) => {
        const updateData = {};
      
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (author !== undefined) updateData.author = author;

        if (category !== undefined) {
            const foundCategory = await categoryModel.findById(category);
            if (!foundCategory) throw new BadRequestError('Invalid category ID');
            updateData.category = foundCategory._id;
        }
      
        const updatedCourse = await courseModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
      
        if (!updatedCourse) throw new BadRequestError('Course not found');
      
        return updatedCourse;
    };
    static deleteCourse = async({id}) => {
        const existingCourse = await courseModel.findById(id);
        if (!existingCourse) {
            throw new NotFoundError("Course not found");
        }

        if (existingCourse.isDeleted) {
            throw new BadRequestError("Course already deleted");
        }
            
        existingCourse.isDeleted = true;
        await existingCourse.save();
    }
    static getStudentsEnrolled = async({id}) => {
        if (!id) throw new BadRequestError('CourseId is required')

        const enrollment = await enrollModel.find({
            course: id
        }).populate({
            path:'user',
            select:SELECT_USER.DEFAULT
        })

        const students = enrollment
            .map((enroll) => {
                return enroll.user
            })
            .filter(Boolean)
        
        return students

    }
}
module.exports = CourseService