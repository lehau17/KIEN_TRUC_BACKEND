const { Room } = require("../model");
const ErrorWithStatus = require("../utils/errorWithStatus.util");

class RoomRepository {
    static async layDanhSachTatCaPhong(filter = {}, sort = {}, skip = 0, limit = 10) {
        return await Room.find(filter).sort(sort).skip(skip).limit(limit);
      }

    static async demSoLuong(filter = {}) {
        return await Room.countDocuments(filter)
    }

  static async layPhongTheoID(roomId) {
    return await Room.findById(roomId);
  }

  static async taoMotPhongMoi(roomData) {
    const newRoom = new Room(roomData);
    return await newRoom.save();
  }

  static async capNhatPhong(roomId, updateData) {
    const room = await Room.findById(roomId)
    if(!room || room.isActive === false) 
      throw new ErrorWithStatus("Phong khong ton tai hoac da xoa", 400)
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
