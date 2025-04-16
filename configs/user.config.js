const COLLECTION = {
    user: 'users',
    error: 'errors'
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

const USER_ROLES = {
    ADMIN:'admin',
    QAQC: 'qaqc',
    USER:'customer',
    MENTOR:'mentor'
}
module.exports = {COLLECTION, USER_ROLES, FILTER_USER, SELECT_USER}