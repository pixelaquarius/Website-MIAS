<div align="center">

# 🚀 Miasteam Agency Website
(M'Project)

**Source code chính thức cho website [miasteam.vn](https://miasteam.vn)**

</div>

<div align="center">

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/[USERNAME]/[REPO]/pages.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/[USERNAME]/[REPO]/actions/workflows/pages.yml)
[![Jekyll](https://img.shields.io/badge/Tech-Jekyll-red?style=for-the-badge&logo=jekyll)](https://jekyllrb.com/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## Overview

Dự án này là website chính thức của Miasteam (M'Project), một agency chuyên về **Tăng trưởng E-commerce & Performance Marketing**. Website được xây dựng trên nền tảng Jekyll (static site) để đảm bảo tốc độ tải trang, bảo mật và khả năng SEO vượt trội.

Website đóng vai trò là portolio, giới thiệu các dịch vụ cốt lõi, case study thực tế và là kênh thu thập lead (khách hàng tiềm năng) chính của agency.

![Project Preview Image](assets/uploads/project-preview.png)

## ✨ Tính năng Nổi bật

* **Tĩnh (Static):** Tốc độ tải trang cực nhanh, tăng điểm Google Lighthouse và cải thiện trải nghiệm người dùng.
* **Hero Slider:** Sử dụng **Swiper.js** để tạo slider giới thiệu linh hoạt, thu hút ngay từ giây đầu tiên.
* **Tab Dịch vụ:** Cấu trúc dịch vụ (Performance Ads, E-com Enabler, Analytics) rõ ràng bằng tab tương tác.
* **Responsive Toàn diện:** Sử dụng **Tailwind CSS** đảm bảo hiển thị hoàn hảo trên mọi thiết bị (Desktop, Tablet, Mobile).
* **Tương tác (Interactivity):** Tích hợp **Alpine.js** cho các thành phần tương tác gọn nhẹ (menu, popup...) mà không cần jQuery.
* **Dễ dàng Mở rộng:** Quản lý bài viết blog và case study thông qua cấu trúc thư mục `_posts` và `_case-studies` của Jekyll.
* **SEO-Friendly:** Cấu trúc sitemap, meta tags và URL chuẩn SEO được tối ưu tự động.

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

* **Framework:** [Jekyll](https://jekyllrb.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **JavaScript:** [Alpine.js](https://alpinejs.dev/), [Swiper.js](https://swiperjs.com/)
* **Deployment:** [GitHub Pages](https://pages.github.com/)
* **Icons:** [Font Awesome](https://fontawesome.com/)

---

## ⚙️ Cài đặt và Chạy (Running Locally)

Để chạy dự án này trên máy local, bạn cần cài đặt Ruby, Bundler và Jekyll.

1.  **Clone dự án:**
    ```bash
    git clone [https://github.com/](https://github.com/)[USERNAME]/[REPO].git
    cd [REPO]
    ```

2.  **Cài đặt dependencies:**
    (Đảm bảo bạn đã cài đặt `bundler`: `gem install bundler`)
    ```bash
    bundle install
    ```

3.  **Chạy server local:**
    ```bash
    bundle exec jekyll serve --livereload
    ```

4.  Mở trình duyệt và truy cập `http://127.0.0.1:4000/` để xem website.

## 🚀 Triển khai (Deployment)

Dự án này được cấu hình để tự động triển khai (CI/CD) lên **GitHub Pages** mỗi khi có thay đổi được push lên nhánh `main`.

Quá trình này được quản lý bởi file `.github/workflows/pages.yml`.

---

## 📄 Giấy phép (License)

Dự án này được cấp phép theo **MIT License**. Xem file `LICENSE` để biết thêm chi tiết.
