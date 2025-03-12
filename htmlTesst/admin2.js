$(document).ready(function () {
    const API_URL = "https://9hknc9-8080.csb.app";
  
    // Tải danh sách người dùng
    function loadUsers() {
      $.ajax({
        url: `${API_URL}/users`,
        method: "GET",
        success: function (users) {
          displayUsers(users);
        },
        error: function (error) {
          console.error("Lỗi khi tải danh sách người dùng:", error);
          alert("Không thể tải danh sách người dùng! Kiểm tra Console.");
        },
      });
    }
  
    // Hiển thị danh sách người dùng
    function displayUsers(users) {
      const $userContainer = $("#userContainer");
      $userContainer.empty(); // Xóa nội dung cũ
  
      users.forEach((user, index) => {
        const stt = index + 1; // Số thứ tự bắt đầu từ 1
        const userBox = `
            <div class="user-box" data-id="${user.id}">
              <h3 class="list-user"><span> ${stt}: ${user.name}</span></h3>
              <p class="user-email">Email: <span>${user.email}</span></p>
              <p class="user-password">Mật Khẩu: <span>${user.password}</span></p>
              <div class="user-action">
                <div style="display: flex; justify-content: space-between; width: 80px">
                  <button class="button-user edit-user">Sửa</button>
                  <button class="button-user delete-user">Xóa</button>
                </div>
              </div>
            </div>
          `;
        $userContainer.append(userBox);
      });
  
      // Gắn sự kiện cho các nút
      attachEventListeners();
    }
  
    // Gắn sự kiện cho các nút
    function attachEventListeners() {
      // Sự kiện click để hiển thị/ẩn thông tin
      $(".user-box").click(function () {
        // Ẩn thông tin và xóa background của tất cả user-box
        $(".user-box p, .user-action button").hide();
        $(".user-box").css("backgroundColor", ""); // Xóa background khi ẩn
  
        // Hiển thị thông tin và thêm background cho user-box được click
        $(this).find("p, .user-action button").show();
        $(this).css("backgroundColor", "#e0f7fa");
        $(".user-box h3").css("color", "#000");
      });
  
      // Sự kiện sửa user
      $(".edit-user")
        .off("click")
        .on("click", function (e) {
          e.stopPropagation(); // Ngăn sự kiện click của user-box
          const $userBox = $(this).closest(".user-box");
          const userId = $userBox.data("id");
  
          // Nếu đang ở chế độ chỉnh sửa thì không làm gì
          if ($userBox.find(".edit-form").length > 0) return;
  
          // Lấy thông tin hiện tại (bao gồm STT)
          const currentNameWithSTT = $userBox.find(".list-user span").text();
          const currentName = currentNameWithSTT.replace(/^STT: \d+ - /, ""); // Loại bỏ STT
          const currentEmail = $userBox.find(".user-email span").text();
          const currentPassword = $userBox.find(".user-password span").text();
  
          // Thay thế nội dung bằng form chỉnh sửa (không hiển thị STT trong input)
          $userBox.html(`
            <h3 class="list-user">Tên: <input type="text" class="edit-name" value="${currentName}" /></h3>
            <p class="user-email">Email: <input type="text" class="edit-email" value="${currentEmail}" /></p>
            <p class="user-password">Mật Khẩu: <input type="text" class="edit-password" value="${currentPassword}" /></p>
            <div class="user-action edit-form">
              <div class="edit-form-btn">
                <button class="button-user save-user">Lưu</button>
                <button class="button-user cancel-edit">Hủy</button>
              </div>
            </div>
          `);
  
          // Gắn sự kiện cho nút Lưu và Hủy
          $userBox.find(".save-user").on("click", function (e) {
            e.stopPropagation();
            saveUser(userId, $userBox);
          });
  
          $userBox.find(".cancel-edit").on("click", function (e) {
            e.stopPropagation();
            loadUsers(); // Tải lại danh sách để hủy chỉnh sửa
          });
        });
  
      // Sự kiện xóa user
      $(".delete-user")
        .off("click")
        .on("click", function (e) {
          e.stopPropagation(); // Ngăn sự kiện click của user-box
          const userId = $(this).closest(".user-box").data("id");
          deleteUser(userId);
        });
    }
  
    // Lưu thông tin người dùng
    function saveUser(userId, $userBox) {
      const newName = $userBox.find(".edit-name").val().trim();
      const newEmail = $userBox.find(".edit-email").val().trim();
      const newPassword = $userBox.find(".edit-password").val().trim();
  
      if (!newName || !newEmail || !newPassword) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        alert("Email phải có định dạng hợp lệ (ví dụ: user@gmail.com)!");
        return;
      }
  
      $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: "GET",
        success: function (user) {
          const updatedUser = {
            ...user,
            name: newName,
            email: newEmail,
            password: newPassword,
          };
  
          $.ajax({
            url: `${API_URL}/users/${userId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedUser),
            success: function () {
              alert("Cập nhật thông tin người dùng thành công!");
              loadUsers(); // Tải lại danh sách
            },
            error: function (error) {
              console.error("Lỗi khi cập nhật người dùng:", error);
              alert("Không thể cập nhật người dùng! Kiểm tra Console.");
            },
          });
        },
        error: function (error) {
          console.error("Lỗi khi tải thông tin người dùng:", error);
          alert("Không thể tải thông tin người dùng để sửa!");
        },
      });
    }
  
    // Xóa người dùng
    function deleteUser(userId) {
      if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
  
      $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: "DELETE",
        success: function () {
          alert("Xóa người dùng thành công!");
          loadUsers(); // Tải lại danh sách
        },
        error: function (error) {
          console.error("Lỗi khi xóa người dùng:", error);
          alert("Không thể xóa người dùng! Kiểm tra Console.");
        },
      });
    }
  
    // Tải danh sách người dùng khi trang được tải
    loadUsers();
  });