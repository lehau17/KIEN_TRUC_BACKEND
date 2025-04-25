# thêm view đánh giá phòng
# model chứa kiểu dữ liệu
# service xử lý giao tiếp với database
# controller đièu hướng
# hinhf anh khi tao room thong qua i api /upload 

# redis: luu tru du lieu o ram => tang toc do truy van du lieu

# redis : khi tao 1 phong moi => xoa cache lien qua den room


# {"key" : "value"}



# lay thong tin
# 1. kiem tra coi redis co du lieu chua bang key (goi la caching)
# 2. neu co roi => tra ve du lieu lun
# 3. neu chua co => xuong database lay du lieu
# 4. lay xong => de du lieu len redis


# lan 1 redis k co => xuong database lay => set lai redis
# lan 2 redis co => tra ve lun


# getOrSetKey : viet ra dung chung

# trong cung 1 luc co 10 nguoi cung lay 1 du lieu => chan lai chi cho 1 nguoi do, 9 nguoi kia doi du lieu ra
# xai redis : tao 1 cai khoa duy nhat tren redis => neu khoa do da ton tai => khong lay duoc

# caching bang redis

# locking bang redis
# cap 1 cai khoa duy nhat


# rate limiter : gioi han truy cap nguoi dung trong 1 khoan thoi gian