#!/bin/bash

# Dừng container cũ (nếu có)
docker stop jenkins-local 2>/dev/null && docker rm jenkins-local 2>/dev/null

# Tạo thư mục lưu dữ liệu Jenkins
mkdir -p $(pwd)/jenkins_home

# Chạy Jenkins container
docker run -d \
  --name jenkins-local \
  -p 8080:8080 -p 50000:50000 \
  -v $(pwd)/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts

# Hướng dẫn truy cập
echo "🚀 Jenkins đang chạy tại: http://localhost:8080"
echo "🔐 Đăng nhập lần đầu với password:"
docker exec jenkins-local cat /var/jenkins_home/secrets/initialAdminPassword
