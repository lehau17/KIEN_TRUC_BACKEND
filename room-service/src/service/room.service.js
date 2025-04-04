const RoomRepository = require("../repository/room.repository");
const ErrorWithStatus = require("../utils/errorWithStatus.util");

class RoomService {
  // 📌 Lấy danh sách tất cả các phòng (có thể lọc theo trạng thái)
  static async layDanhSachTatCaPhong(filters = {}) {
    return await RoomRepository.layDanhSachTatCaPhong(filters);
  }

  // 📌 Lấy thông tin một phòng theo ID
  static async layPhongTheoID(roomId) {
    const room = await RoomRepository.layPhongTheoID(roomId);
    if (!room) throw new ErrorWithStatus("Không tìm thấy phòng!", 400);
    return room;
  }

  // 📌 Tạo một phòng mới
  static async taoMotPhongMoi(roomData) {
    if (!roomData.name || !roomData.price || !roomData.capacity) {
      throw new ErrorWithStatus("Thiếu thông tin bắt buộc!", 400);
    }
    return await RoomRepository.taoMotPhongMoi(roomData);
  }

  // 📌 Cập nhật thông tin phòng
  static async capNhatPhong(roomId, updateData) {
    const room = await RoomRepository.capNhatPhong(roomId, updateData);
    if (!room) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật!", 400);
    return room;
  }

  // 📌 Xóa phòng (chuyển trạng thái isActive thành false)
  static async xoaPhong(roomId) {
    const room = await RoomRepository.xoaPhong(roomId);
    if (!room) throw new ErrorWithStatus("Không tìm thấy phòng để xóa!", 400);
    return room;
  }
    // 📌 Cập nhật trạng thái phòng
    static async capNhatTrangThaiPhong(roomId, status) {
        if (!["available", "booked", "maintenance"].includes(status)) {
            throw new ErrorWithStatus("Trạng thái không hợp lệ!");
        }

        // Cập nhật `isAvailable` theo trạng thái
        let isAvailable = status === "available";

        const updatedRoom = await RoomRepository.capNhatTrangThaiPhong(roomId, status, isAvailable);
        if (!updatedRoom) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật trạng thái!");
        return updatedRoom;
    }

    // 📌 Lấy danh sách phòng theo trạng thái
    static async layDanhSachPhongTheoTrangThai(status) {
        return await RoomRepository.layDanhSachPhongTheoTrangThai(status);
    }
}

module.exports = RoomService;
