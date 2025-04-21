const COLLECTION = {
    user: 'users',
    error: 'errors',
    category: 'categories',
    quizz:'quizzes'
}
const FILTER_USER = {
    AVAILABLE_USER: {
        isDeleted : false
    },
    DELETED_USER: {
        isDeleted: true
    },
}
const SELECT_USER = {
    DEFAULT: 'fullName email role',
    FULL: 'fullName email role isDeleted'
}
const SELECT_CLASS = {
    DEFAULT: 'title course description mentor students schedule',
    FULL:'title course description mentor status maxStudents students schedule'
}
const SELECT_COURSE = {
    FULL: 'title description price enrolledCount author category createdAt',    
    DEFAULT: 'title description'
}
const USER_ROLES = {
    ADMIN:'admin',
    QAQC: 'qaqc',
    USER:'customer',
    MENTOR:'mentor'
}
module.exports = {COLLECTION, SELECT_COURSE, USER_ROLES, FILTER_USER, SELECT_USER, SELECT_CLASS}