const { OK, CREATED } = require("../core/responses/success.response");
const messageService = require("../services/message.service");

class messageController {
    getUsersForSideBar = async (req, res) => {
        new OK({
            message: "Get users for sidebar successfully",
            metadata: await messageService.getUsersForSideBar({
                userId: req.userId,
            }),
        }).send(res);
    };
    getMessages = async (req, res) => {
        new OK({
            message: "Get messages successfully",
            metadata: await messageService.getMessages({
                userId: req.userId,
                receiverId: req.params.id,
            }),
        }).send(res);
    };
    sendMessage = async (req,res) => {
        new CREATED({
            message: "Send message successfully",
            metadata: await messageService.sendMessage({
                senderId: req.userId,
                receiverId: req.params.id,
                content: req.body.content,
                image: req.file
            })
        }).send(res);
    }
}

module.exports = new messageController();
