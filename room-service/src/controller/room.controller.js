const { ObjectIdSchema } = require("../schemas/objectID.schema");
const { RoomSchema, RoomUpdateSchema } = require("../schemas/room.schema");
const RoomService = require("../service/room.service");
const { SuccessResponse, CreatedResponse } = require("../utils/response");

class RoomController {
    // 📌 Lấy danh sách tất cả các phòng
    static async layDanhSachTatCaPhong(req, res, next) {
        const filters = req.query; // Lọc theo query params nếu có
        const rooms = await RoomService.layDanhSachTatCaPhong(filters);
        new SuccessResponse(rooms, "Lấy danh sách phòng thành công.").response(res);

    }

    // 📌 Lấy thông tin một phòng theo ID
    static async layPhongTheoID(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const room = await RoomService.layPhongTheoID(roomId);
        new SuccessResponse(room, "Lấy danh sách phòng thành công.").response(res);

    }

    // 📌 Tạo một phòng mới
    static async taoMotPhongMoi(req, res, next) {
        RoomSchema.parse(req.body);
        const newRoom = await RoomService.taoMotPhongMoi(req.body);
        new CreatedResponse(newRoom, "Tạo phòng thành công.").response(res);


    }



    // 📌 Cập nhật thông tin phòng
    static async capNhatPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        RoomUpdateSchema.parse(req.body);
        const updatedRoom = await RoomService.capNhatPhong(roomId, req.body);
        new SuccessResponse(updatedRoom, "Cập nhật phòng thành cộng.").response(res);

    }

    // 📌 Xóa phòng (chuyển trạng thái isActive thành false)
    static async xoaPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const deletedRoom = await RoomService.xoaPhong(roomId);
        new SuccessResponse(deletedRoom, "Xoá phòng thành cộng.").response(res);

        // res.status(200).json(deletedRoom);
    }



    static async capNhatTrangThaiPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const { status } = req.body; // Trạng thái mới của phòng
        const updatedRoom = await RoomService.capNhatTrangThaiPhong(roomId, status);
        new SuccessResponse(updatedRoom, "Đã thay đổi trạng thái phòng.").response(res);

        // res.status(200).json(updatedRoom);
    }

    // 📌 Lấy danh sách phòng theo trạng thái
    static async layDanhSachPhongTheoTrangThai(req, res, next) {
        const { status } = req.params;
        const rooms = await RoomService.layDanhSachPhongTheoTrangThai(status);
        new SuccessResponse(rooms, "Lấy danh sách phòng thành cộng.").response(res);
        // res.status(200).json(rooms);
    }
}

module.exports = RoomController;
