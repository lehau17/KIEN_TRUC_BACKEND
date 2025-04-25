# Bài test Backend NodeJS : Lê Trung Hậu

# Link deploy dự án :
```javascript     
http://testbackend.haudev.io.vn/swagger
```
- Url database postgres : postgresql://admin:admin1234@3.1.103.77:5432/quan_ly_nhan_su?schema=public
- Backend : Nodejs(NestJS)
- Database : PostgreSQL 
- Caching : localCache
- Security : accessToken, refreshToken, RateLimiter, BlackList
- Ops : Ec2, docker-compose, github actions
# Môi trường phát triển 
- local : window 11 acer, itel i5 10000
- Môi trường production : ubuntu 24.04



# hướng dẫn triển khai bằng command

```javascript     
git clone https://github.com/lehau17/NB_HCNS_TestPV_NodeJSDeveloper_LeTrungHau.git
```
```javascript     
cd NB_HCNS_TestPV_NodeJSDeveloper_LeTrungHau
```
```javascript     
yarn
```
```javascript     
yarn start:dev
```

# hướng dẫn triển khai bằng docker

```javascript     
git clone https://github.com/lehau17/NB_HCNS_TestPV_NodeJSDeveloper_LeTrungHau.git
```
```javascript     
cd NB_HCNS_TestPV_NodeJSDeveloper_LeTrungHau
```
```javascript     
docker-compose up -d
```
```javascript     
http://localhost:8080/swagger
```
# Quản lý lỗi tập trung
- ![error](moTaDuAn/error.png)

# Design Pattern
## Builder Pattern
- ![Builder Pattern](moTaDuAn/builder_1.png)
- ![Builder Pattern](moTaDuAn/builder_2.png)
- ![Builder Pattern](moTaDuAn/builder_3.png)
## Singleton Pattern
- ![Singleton Pattern](moTaDuAn/signloten.png)


## Factory Method Pattern (Đơn giản)
- ![Factory Method Pattern](moTaDuAn/factory.png)

# Docker
## Dockerfile
- ![Docker file](moTaDuAn/dockerfile.png)
## Docker compose
- ![Docker compose](moTaDuAn/dockercompose_1.png)
- ![Docker compose](moTaDuAn/dockercompose_2.png)

# Tính năng mở rộng
## rate limit triển khai ở localcache mỗi 10 giây tối đa 10 request
- ![rate limiter](moTaDuAn/ratelimit.png) 
## Blacklist
- Mô tả : khi mình deactive 1 user thì vẫn còn token, thì sẽ lưu token đó xuống localcache với thời gian như accessToken
- ![blacklist](moTaDuAn/blacklist.png) 
## Phân role theo mô hình RBAC 
- ![phân role theo mô hinh](moTaDuAn/checkrole_1.png)
- ![phân role theo mô hinh](moTaDuAn/checkrole_2.png)



# Cấu trúc dự án
![Cấu trúc dư án](moTaDuAn/cauTrucDuAn.png)
- libs : 1 module dùng để khai báo các hàm, biến được chia sẻ với nhau trong source code
- src : nơi tập trung các module chính
- data : volumn của docker
- prisma : lưu file .prisma của ORM prisma
- .github : chứa file cấu hình github action
- Mô hình quản lý RBAC : ![database](moTaDuAn/db.png)

# Mô tả API :
## Login : /auth/login
- Thành công :  ![Login thành công](moTaDuAn/login_success.png)
- Sai Tên tài khoản : ![Login sai tên tài khoản](moTaDuAn/login_sai_tk.png)

- Sai mật khẩu : ![Login sai mật khẩu](moTaDuAn/login_sai_mk.png)

## register : /auth/register

- Thành công : ![Register thành công](moTaDuAn/register_success.png)
- Trùng Tên tài khoản : ![Register trùng tên tài khoản](moTaDuAn/register_trung_tk.png)


## refresh token : /auth/refresh_token truyền vào header 'x-refresh-token'
 - Thành công : ![refresh token](moTaDuAn/refresh_token_success.png)
 - Truyền sai : ![refresh token](moTaDuAn/refresh_token_fail.png)


## Change password : /auth/change_password
 - Thành công :![change password](moTaDuAn/change_password_success.png)
 - Sai mật khẩu gốc : ![change password](moTaDuAn/change_password_fail_old.png)
 - new Password và config password khác nhau : ![change password](moTaDuAn/change_password_confirm_fail.png)
 - Mật khẩu mới và mật khẩu cũ giống nhau : ![change password](moTaDuAn/change_password_old_and_new_password.png)

## Lấy danh sách user : /employees chỉ có quyền admin mới được xem danh sách user 
- Không có quyền : ![không có quyền](moTaDuAn/get_employee_forbidden.png)
- Lấy danh sách : [danh-sachs](moTaDuAn/get_employee.png)

## Lấy thông tin info của chính mình
- Thành công : ![thông tin](moTaDuAn/get_me.png)

## Update thông tin bản thân /patch : employee/me
- Thành công : ![thông tin](moTaDuAn/update_me.png)

## deactive tài khoản bản thân /delete : employee/me
- thành công : ![thông tin](moTaDuAn/deactivate_me.png)
- Không tìm thấy : khi deactive thì id của tài khoản vừa deactive sẽ được thêm vào blacklist với ttl bằng thời gian sống bằng token : ![thông tin](moTaDuAn/deactive_not_found.png)


## Cập nhật thông tin user khi có quyền ADMIN
-- không có quyền ![thông tin](moTaDuAn/forbidden_update_em.png)
-- không tìm thấy user  ![thông tin](moTaDuAn/notfound_update_em.png)
-- update thành công ![thông tin](moTaDuAn/success_update_em.png)

## API ROLE (chỉ cho phép quyền ADMIN truy cập)
--  lấy danh sách : ![thông tin](moTaDuAn/get_role.png)
-- tạo role : ![thông tin](moTaDuAn/create_role.png)
-- cập nhật role : ![thông tin](moTaDuAn/update_role.png)
-- deactive role : ![thông tin](moTaDuAn/deactivate_role.png)

## API resources (chỉ cho phép quyền ADMIN truy cập)
--  lấy danh sách : ![thông tin](moTaDuAn/get_resource.png)
-- tạo resource : ![thông tin](moTaDuAn/create_resource.png)
-- cập nhật resource : ![thông tin](moTaDuAn/update_resource.png)
-- deactive resource : ![thông tin](moTaDuAn/deactivate_resource.png)

## API permission (chỉ cho phép quyền ADMIN truy cập)
--  lấy danh sách : ![thông tin](moTaDuAn/get_permission.png)
-- tạo permission : ![thông tin](moTaDuAn/create_permission.png)
-- cập nhật permission : ![thông tin](moTaDuAn/update_permission.png)
-- deactive permission : ![thông tin](moTaDuAn/deactivate_permission.png)
