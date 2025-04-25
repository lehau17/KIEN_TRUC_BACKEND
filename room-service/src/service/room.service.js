const RoomRepository = require("../repository/room.repository");
const { getOrSetCache } = require("../utils/cache.util");
const ErrorWithStatus = require("../utils/errorWithStatus.util");
const crypto = require("crypto");
class RoomService {
    static async layDanhSachTatCaPhong(params) {
        const key = `rooms:list:${crypto.createHash('md5').update(JSON.stringify(params)).digest('hex')}`;
        return await getOrSetCache(key, async () => {
            const filter = {};
            const {
                name,
                to_price,
                from_price = 0,
                isAvailable,
                roomType,
                status,
                from_rating,
                to_rating,
                isActive,
                sortBy = "createdAt",
                sortOrder = "desc",
                page = 1,
                limit = 10
            } = params;

            if (name) {
                filter.name = { $regex: name, $options: "i" };
            }
            filter.price = { $gte: from_price };
            if (to_price) filter.price.$lte = to_price;

            if (typeof isAvailable === "boolean") filter.isAvailable = isAvailable;

            const validRoomTypes = ["Standard", "Deluxe", "Suite"];
            if (roomType && validRoomTypes.includes(roomType)) filter.roomType = roomType;

            const validStatus = ["available", "booked", "maintenance"];
            if (status && validStatus.includes(status)) filter.status = status;

            if (from_rating || to_rating) {
                filter.rating = {};
                if (from_rating) filter.rating.$gte = from_rating;
                if (to_rating) filter.rating.$lte = to_rating;
            }

            if (typeof isActive === "boolean") filter.isActive = isActive;

            const sort = {};
            if (sortBy) sort[sortBy] = sortOrder === "asc" ? 1 : -1;

            const skip = (page - 1) * limit;

            const [total, rooms] = await Promise.all([
                RoomRepository.demSoLuong(filter),
                RoomRepository.layDanhSachTatCaPhong(filter, sort, skip, limit)
            ]);

            return {
                data: rooms,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }, 300);
    }




    static async layPhongTheoID(roomId) {
        const key = `room:detail:${roomId}`;

        return await getOrSetCache(key, async () => {
            const room = await RoomRepository.layPhongTheoID(roomId);
            if (!room) throw new ErrorWithStatus("Không tìm thấy phòng!", 400);
            return room;
        }, 300); // Cache 5 phút
    }

    static async taoMotPhongMoi(roomData) {
        if (!roomData.name || !roomData.price || !roomData.capacity) {
            throw new ErrorWithStatus("Thiếu thông tin bắt buộc!", 400);
        }

        const room = await RoomRepository.taoMotPhongMoi(roomData);

        // Xoá toàn bộ cache danh sách phòng
        const keys = await redis.keys("rooms:list:*");
        if (keys.length) await redis.del(...keys);

        return room;
    }

    static async capNhatPhong(roomId, updateData) {
        const room = await RoomRepository.capNhatPhong(roomId, updateData);
        if (!room) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật!", 400);
        return room;
    }

    static async xoaPhong(roomId) {
        const room = await RoomRepository.xoaPhong(roomId);
        if (!room) throw new ErrorWithStatus("Không tìm thấy phòng để xóa!", 400);
        return room;
    }


    static async capNhatTrangThaiPhong(roomId, status) {
        if (!["available", "booked", "maintenance"].includes(status)) {
            throw new ErrorWithStatus("Trạng thái không hợp lệ!");
        }

        let isAvailable = status === "available";

        const updatedRoom = await RoomRepository.capNhatTrangThaiPhong(roomId, status, isAvailable);
        if (!updatedRoom) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật trạng thái!");
        return updatedRoom;
    }

    static async layDanhSachPhongTheoTrangThai(status) {
        return await RoomRepository.layDanhSachPhongTheoTrangThai(status);
    }
}

module.exports = RoomService;
