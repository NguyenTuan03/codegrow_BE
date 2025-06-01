const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");
const { uploadImage, s3, createUrlS3 } = require("../utils/s3client");
class messageService {
    static async getUsersForSideBar({ userId }) {
        const filterUsers = await userModel.find({
            _id: { $ne: userId },
            isDeleted: false,
        }).select("-password");
        return filterUsers;
    }
    static getMessages = async ({ userId, receiverId }) => {
        if (!receiverId) {
            throw new Error("Receiver ID is required");
        }
        const messages = await messageModel.find({
            $or: [
                {
                   senderId: userId, 
                   receiverId: receiverId
                },
                {
                    senderId: receiverId,
                    receiverId: userId
                }
            ]
        }).sort({ createAt: 1 })
        return messages;
    }
    static sendMessage = async ({ senderId, receiverId, content, image }) => {
        if (!receiverId) {
            throw new Error("Receiver ID is required");
        }
        if (!image || !image.originalname) {
            throw new Error("Avatar file is missing or invalid");
        }
        if (image && image.buffer && image.mimetype) {
            const key = `message/${uuidv4()}-${image.originalname}`;
            const command = uploadImage({
                key: key,
                body: image.buffer,
                fileType: image.mimetype,
            });
            await s3.send(command);

            image = createUrlS3(key);
        }
        const message = await messageModel.create({
            senderId,
            receiverId,
            text: content,
            image: image
        });
        return message;
    }
}

module.exports = messageService;