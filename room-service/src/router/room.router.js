const express = require("express");
const { wrapperRequestHandler } = require("../utils");
const RoomController = require("../controller/room.controller");
const roomRouter = express.Router();


// Lấy danh sách phòng
roomRouter.get("/", wrapperRequestHandler(RoomController.layDanhSachTatCaPhong));
// Lấy phòng theo ID
roomRouter.get("/:roomId", wrapperRequestHandler(RoomController.layPhongTheoID));
// Tạo phòng
roomRouter.post("/", wrapperRequestHandler(RoomController.taoMotPhongMoi));
// Cập nhật thông tin phòng
roomRouter.put("/:roomId", wrapperRequestHandler(RoomController.capNhatPhong));
// Xoá phong
roomRouter.delete("/:roomId", wrapperRequestHandler(RoomController.xoaPhong));
// Thay doi trang thai phong
roomRouter.put("/:roomId/status", wrapperRequestHandler(RoomController.capNhatTrangThaiPhong));
// Lấy danh sách phòng theo trangj thái
roomRouter.get("/status/:status", wrapperRequestHandler(RoomController.layDanhSachPhongTheoTrangThai));

module.exports = roomRouter;
