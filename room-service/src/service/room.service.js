const { yeuCauKhoa, moKhoa, redis } = require("../config/redis.config");
const RoomRepository = require("../repository/room.repository");
const { getOrSetCache } = require("../utils/cache.util");
const ErrorWithStatus = require("../utils/errorWithStatus.util");
const crypto = require("crypto");
class RoomService {
    static async layDanhSachTatCaPhong(params) {
        // dùng thuật toán md5 băm nhỏ để làm key ngắn lại
        // miễn sao params không đổi, cache key không đỏi
        const cacheKey = `rooms:list:${crypto.createHash("md5").update(JSON.stringify(params)).digest("hex")}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            // 5000 : thời gian sống của khoá
            // 2000 : thời gian chờ lấy khoá
            // 100 : thời gian thử lại
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100); // TTL 5s, timeout 2s, delay 100ms
            // nếu sau 2s không có khoá => trả về null
            if (!lockValue) {
                console.warn("⚠️ Không lấy được lock, huỷ bỏ cache set.");
                return null;
            }

            try {
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
                sort[sortBy] = sortOrder === "asc" ? 1 : -1;
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
            } finally {
                await moKhoa(lockKey, lockValue); // Giải phóng lock dù có lỗi hay không
            }
        }, 5); // tính bằng giây

    }

    static async layPhongTheoID(roomId) {
        const cacheKey = `room:detail:${roomId}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            // chan nguoi dung cung truy van vao 1 nguon du lieu => chi cho 1 nguoi do
            // cap khoa cho 1 nguoi duy nhat => cho phep ho doi 2s,
            // moi 100 mili giay, goi ham lay khoa 1 lan
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100); // TTL=5s, timeout=2s
            // qua 2 giay => tra ve null
            if (!lockValue) {
                console.warn(`⚠️ Không lấy được lock khi lấy phòng ${roomId}`);
                return null;
            }

            try {
                // lay du lieu o database
                const room = await RoomRepository.layPhongTheoID(roomId);
                // neu co du lieu => tra ve
                // khong co => bao loi
                if (!room || room.isActive === false) throw new ErrorWithStatus("Không tìm thấy phòng!", 400);
                return room;
            } finally {
                await moKhoa(lockKey, lockValue);
            }
        }, 5); // Cache 5 phút
    }

    static async taoMotPhongMoi(roomData) {
        // kiem tra du lieu
        if (roomData.name.trim() === "" || !roomData.price || !roomData.capacity) {
            throw new ErrorWithStatus("Thiếu thông tin bắt buộc!", 400);
        }
        // tao phong moi
        const room = await RoomRepository.taoMotPhongMoi({ ...roomData, status: "available" });
        // Xoá toàn bộ cache danh sách phòng
        const keys = await redis.keys("rooms:list:́́́*");// lay tat ca cac data o redis co key bat dau bang rooms:list
        // xoa du lieu o redis
        if (keys.length) await redis.del(...keys);

        return room;
    }

    static async capNhatPhong(roomId, updateData) {
        const room = await RoomRepository.capNhatPhong(roomId, updateData);
        if (!room || room.isActive === false) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật!", 400);

        // 🔥 Xoá cache liên quan
        await redis.del(`room:detail:${roomId}`);       // Cache chi tiết phòng
        const keys = await redis.keys("rooms:list:*");  // Cache danh sách phòng
        if (keys.length) await redis.del(...keys);

        return room;
    }

    static async xoaPhong(roomId) {
        const room = await RoomRepository.xoaPhong(roomId);
        // an luon, xoa du lieu o redis
        const cacheKey = `room:detail:${roomId}`;
        redis.del(cacheKey)
        if (!room) throw new ErrorWithStatus("Không tìm thấy phòng để xóa!", 400);
        return room;
    }


    static async capNhatTrangThaiPhong(roomId, status) {
        if (!["available", "booked", "maintenance"].includes(status)) {
            throw new ErrorWithStatus("Trạng thái không hợp lệ!");
        }

        const isAvailable = status === "available";

        const updatedRoom = await RoomRepository.capNhatTrangThaiPhong(roomId, status, isAvailable);
        if (!updatedRoom) throw new ErrorWithStatus("Không tìm thấy phòng để cập nhật trạng thái!");

        // 🧹 Xoá cache
        await redis.del(`room:detail:${roomId}`);
        const keys = await redis.keys("rooms:list:*");
        if (keys.length) await redis.del(...keys);
        await redis.del(`rooms:byStatus:available`);
        await redis.del(`rooms:byStatus:booked`);
        await redis.del(`rooms:byStatus:maintenance`);

        return updatedRoom;
    }


    static async layDanhSachPhongTheoTrangThai(status) {
        const cacheKey = `rooms:byStatus:${status}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100); // TTL: 5s, timeout: 2s, retry: 100ms

            if (!lockValue) {
                console.warn(`⚠️ Không lấy được lock khi lấy danh sách phòng theo trạng thái '${status}'`);
                return null; // hoặc throw nếu muốn fail
            }

            try {
                return await RoomRepository.layDanhSachPhongTheoTrangThai(status);
            } finally {
                await moKhoa(lockKey, lockValue);
            }
        }, 5); // Cache 5 phút
    }

}

module.exports = RoomService;
