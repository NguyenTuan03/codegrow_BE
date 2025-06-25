const { USER_ROLES, SELECT_USER } = require("../configs/user.config");
const {
    NotFoundRequestError,
    BadRequestError,
} = require("../core/responses/error.response");
const courseModel = require("../models/course.model");
const lessonModel = require("../models/lesson.model");
const userModel = require("../models/user.model");
const userProgressModel = require("../models/user.process.model");
const { getAllUsers } = require("../repositories/user.repo");
const bcrypt = require("bcrypt");
const { s3, createUrlS3, uploadImage } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");
const enrollModel = require("../models/enroll.model");
const { default: mongoose } = require("mongoose");
const { default: axios } = require("axios");
class UserService {
    static getAllUser = async ({ limit, sort, page, filter, select }) => {
        return await getAllUsers({ limit, sort, page, filter, select });
    };
    static getUserById = async ({ id }) => {
        const user = await userModel.findOne({ _id: id }).populate({
            path: "enrolledCourses",
            select: "title description price author category",
            populate: {
                path: "category",
                select: "name",
            },
        });

        if (!user) {
            throw new NotFoundRequestError("User not found");
        }

        return user;
    };
    static getConsultedUser = async () => {
        const enroll = await enrollModel
            .find({
                isConsulted: false,
            })
            .populate([
                {
                    path: "user",
                    select: SELECT_USER.DEFAULT,
                },
            ]);
        return enroll;
    };
    static createUser = async ({ fullName, email, password, role }) => {
        const user = await userModel.findOne({ email }).lean();
        if (user) {
            throw new BadRequestError("Email already exist");
        }
        const hashPass = await bcrypt.hash(
            password,
            parseInt(process.env.PASSWORD_SALT)
        );
        await userModel.create({
            fullName,
            role: role || USER_ROLES.USER,
            wallet: 0,
            email,
            password: hashPass,
            isVerified: true,
        });
        return;
    };
    static updateUser = async ({ id, fullName, email, role, avatar }) => {
        const user = await userModel.findById(id);
        if (!user) throw new NotFoundRequestError("User not found");

        let avatarUrl = user.avatar;

        if (avatar && avatar.buffer && avatar.mimetype) {
            const key = `avatars/${uuidv4()}-${avatar.originalname}`;
            const command = uploadImage({
                key: key,
                body: avatar.buffer,
                fileType: avatar.mimetype,
            });
            await s3.send(command);

            avatarUrl = createUrlS3(key);
        }

        await userModel.updateOne(
            { _id: id },
            {
                fullName: fullName || user.fullName,
                email: email || user.email,
                role: role || user.role,
                avatar: avatarUrl,
            }
        );
        return;
    };
    static deleteUser = async ({ id }) => {
        const user = await userModel
            .findOne({
                _id: id,
                isDeleted: false,
            })
            .lean();
        if (!user) {
            throw new NotFoundRequestError("User not found");
        }
        await userModel.updateOne({ _id: id }, { isDeleted: true });
        return user;
    };
    static enrollCourse = async ({ req, id, courseId }) => {
        if (!courseId) throw new BadRequestError("CourseId is required");

        // Tìm khóa học
        const course = await courseModel.findById(courseId);
        if (!course) throw new BadRequestError("Course not found");

        // Kiểm tra user tồn tại
        const user = await userModel.findById(id).select("enrollCourses");
        if (!user) throw new BadRequestError("User not found");

        // Đã enroll chưa?
        if (user?.enrolledCourses?.includes(courseId)) {
            throw new BadRequestError("You already enrolled this course");
        }
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error("Invalid courseId format");
        }
        // Nếu khóa học miễn phí
        if (course.price === 0) {
            // Thêm course vào user.enrollCourses
            await userModel.findByIdAndUpdate(id, {
                $addToSet: { enrolledCourses: courseId },
            });

            // Thêm user vào course.students
            await courseModel.findByIdAndUpdate(courseId, {
                $addToSet: { students: id },
                $inc: { enrolledCount: 1 },
            });

            // Debug sau cập nhật
            const updatedUser = await userModel
                .findById(id)
                .populate("enrolledCourses");
            const updatedCourse = await courseModel
                .findById(courseId)
                .populate("students");

            console.log(
                "✅ User.enrolledCourses:",
                updatedUser.enrolledCourses?.map((c) => c._id)
            );
            console.log(
                "✅ Course.students:",
                updatedCourse.students?.map((u) => u._id)
            );

            return {
                needPayment: false,
                enrollment: {
                    user: id,
                    course: courseId,
                    progress: 0,
                    completed: false,
                },
            };
        }

        // Nếu là khóa học trả phí → tạo link thanh toán
        const payService = require("./payment.service");
        const payLink = await payService.createPayOSPayment({
            req,
            amount: course.price,
            userId: id,
            courseId,
        });

        return {
            needPayment: true,
            payUrl: payLink,
        };
    };
    static enrollClass = async ({ id, fullName, email, phone, city, note }) => {
        if (!fullName || !email || !phone || !city || !note)
            throw new BadRequestError("All fields are required");
        const alreadyConsulted = await enrollModel.findById(id);
        if (alreadyConsulted)
            throw new BadRequestError("You have sent the consultant request!");
        const enrollMent = await enrollModel.create({
            user: id,
            fullName,
            email,
            phone,
            note,
            isConsulted: false,
        });
        return enrollMent;
    };
    static lessonComplete = async ({ id, lessonId, courseId }) => {
        const progress = await userProgressModel.findOneAndUpdate(
            {
                user: id,
                course: courseId,
            },
            {
                $addToSet: { completedLessons: lessonId },
                $set: { lastLesson: lessonId, updatedAt: new Date() },
            },
            { new: true, upsert: true }
        );
        return progress;
    };
    static markQuizComplete = async ({ id, quizId, courseId }) => {
        const progress = await userProgressModel.findOneAndUpdate(
            { user: id, course: courseId },
            {
                $addToSet: { completedQuizzes: quizId },
                $set: { updatedAt: new Date() },
            },
            { new: true, upsert: true }
        );
        return progress;
    };
    static getUserProgress = async ({ id, courseId }) => {
        const progress = await userProgressModel
            .findOne({
                user: id,
                course: courseId,
            })
            .populate("completedLessons")
            .populate("completedQuizzes")
            .populate("lastLesson");
        console.log(progress);
        const totalLessons = await lessonModel.countDocuments({
            course: courseId,
        });
        const completedCount = progress?.completedLessons?.length || 0;
        console.log(completedCount, totalLessons);
        const percent =
            totalLessons > 0
                ? Math.floor((completedCount / totalLessons) * 100)
                : 0;
        return {
            completedLessons: progress?.completedLessons || [],
            completedQuizzes: progress?.completedQuizzes || [],
            lastLesson: progress?.lastLesson || null,
            progress: percent,
        };
    };
    static getCourseInfoDetail = async (courseId) => {
        const course = await courseModel.findById(courseId).lean();

        if (!course) throw new Error("Course not found");

        return `
            Tiêu đề: ${course.title}
            Mô tả: ${course.description}
            Nội dung chính: ${course.content}
            Thời lượng: ${course.duration}
            Học phí: ${course.price} VNĐ
        `;
    };
    static getCourseInfo = async ({ promt, courseId }) => {
        try {
            console.log(promt, typeof promt);

            if (!promt || typeof promt !== "string") {
                throw new Error("Prompt không hợp lệ – cần là chuỗi");
            }
            const courseInfo = await UserService.getCourseInfoDetail(courseId); // bạn tự viết hàm này

            // B2: Gọi OpenRouter API
            const response = await axios.post(
                process.env.URL_CHAT,
                {
                    model: "openai/gpt-4.1-mini",
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "system",
                            content: `Bạn là một tư vấn viên giáo dục chuyên nghiệp, nhiệm vụ của bạn là giới thiệu khóa học cho người học một cách gần gũi, rõ ràng và dễ hiểu. Dưới đây là thông tin khóa học cần giới thiệu:

${courseInfo}

Hãy diễn giải nội dung này theo cách tự nhiên, giống như đang tư vấn thật. Nếu dữ liệu còn thiếu, hãy nhắc khéo người dùng cập nhật thêm.`,
                        },
                        {
                            role: "user",
                            content: promt,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 10000,
                }
            );

            console.log(response);
            const reply = response.data.choices[0].message.content;

            return reply;
        } catch (err) {
            console.error(
                "Lỗi từ GPT API:",
                err.response?.data || err.message || err
            );
            throw new Error("Lỗi gọi GPT");
        }
    };
}
module.exports = UserService;
