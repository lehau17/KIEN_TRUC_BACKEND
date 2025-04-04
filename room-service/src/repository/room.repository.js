const { Room } = require("../model");

class RoomRepository {
  static async layDanhSachTatCaPhong(filters = {}) {
    return await Room.find(filters);
  }

  static async layPhongTheoID(roomId) {
    return await Room.findById(roomId);
  }

  static async taoMotPhongMoi(roomData) {
    const newRoom = new Room(roomData);
    return await newRoom.save();
  }

  static async capNhatPhong(roomId, updateData) {
    return await Room.findByIdAndUpdate(roomId, updateData, { new: true });
  }

  static async xoaPhong(roomId) {
    return await Room.findByIdAndUpdate(roomId, { isActive: false }, { new: true });
  }


    // 📌 Cập nhật trạng thái phòng
    static async capNhatTrangThaiPhong(roomId, status, isAvailable) {
        return await Room.findByIdAndUpdate(
            roomId,
            { status, isAvailable },
            { new: true }
        );
    }

    // 📌 Lấy danh sách phòng theo trạng thái
    static async layDanhSachPhongTheoTrangThai(status) {
        return await Room.find({ status });
    }

}

module.exports = RoomRepository;
