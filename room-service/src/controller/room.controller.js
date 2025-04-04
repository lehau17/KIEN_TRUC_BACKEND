const { ObjectIdSchema } = require("../schemas/objectID.schema");
const { RoomSchema, RoomUpdateSchema } = require("../schemas/room.schema");
const RoomService = require("../service/room.service");

class RoomController {
    // 📌 Lấy danh sách tất cả các phòng
    static async layDanhSachTatCaPhong(req, res, next) {
        const filters = req.query; // Lọc theo query params nếu có
        const rooms = await RoomService.layDanhSachTatCaPhong(filters);
        res.status(200).json(rooms);

    }

    // 📌 Lấy thông tin một phòng theo ID
    static async layPhongTheoID(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const room = await RoomService.layPhongTheoID(roomId);
        res.status(200).json(room);
    }

    // 📌 Tạo một phòng mới
    static async taoMotPhongMoi(req, res, next) {
        RoomSchema.parse(req.body);
        const newRoom = await RoomService.taoMotPhongMoi(req.body);
        res.status(201).json(newRoom);

    }



    // 📌 Cập nhật thông tin phòng
    static async capNhatPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        RoomUpdateSchema.parse(req.body);
        const updatedRoom = await RoomService.capNhatPhong(roomId, req.body);
        res.status(200).json(updatedRoom);
    }

    // 📌 Xóa phòng (chuyển trạng thái isActive thành false)
    static async xoaPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const deletedRoom = await RoomService.xoaPhong(roomId);
        res.status(200).json(deletedRoom);
    }



    static async capNhatTrangThaiPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const { status } = req.body; // Trạng thái mới của phòng
        const updatedRoom = await RoomService.capNhatTrangThaiPhong(roomId, status);
        res.status(200).json(updatedRoom);
    }

    // 📌 Lấy danh sách phòng theo trạng thái
    static async layDanhSachPhongTheoTrangThai(req, res, next) {
        const { status } = req.params;
        const rooms = await RoomService.layDanhSachPhongTheoTrangThai(status);
        res.status(200).json(rooms);
    }
}

module.exports = RoomController;
