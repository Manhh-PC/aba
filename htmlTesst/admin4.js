$(document).ready(function () {
  const API_URL = "https://2szhs6-8080.csb.app";

  // Kiểm tra trạng thái đăng nhập trước khi tải trang admin
  $.ajax({
    url: `${API_URL}/currentUser`,
    method: "GET",
    success: function (user) {
      if (!user || !user.id) {
        // Chưa đăng nhập, chuyển hướng về login.html
        window.location.replace("login.html");
      } else if (user.role !== "admin") {
        // Không phải admin, chuyển hướng về index.html
        window.location.replace("index.html");
      } else {
        // Là admin, tiếp tục tải danh sách user
        loadUsers();
      }
    },
    error: function (error) {
      console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      window.location.replace("login.html"); // Lỗi thì cũng chuyển về login
    },
  });

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

    if (users.length === 0) {
      $userContainer.html(`
          <div class="no-users">
            <h2>Không có user nào tồn tại</h2>
          </div>
        `);
    } else {
      users.forEach((user, index) => {
        const stt = index + 1;
        const userBox = `
            <div class="user-box" data-id="${user.id}">
              <h3 class="list-user"><span class="stt">${stt}: </span><span class="user-name">${user.name}</span></h3>
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
      attachEventListeners();
    }
  }

  // Gắn sự kiện cho các nút
  function attachEventListeners() {
    $(".user-box").click(function () {
      $(".user-box p, .user-action button").hide();
      $(".user-box").css("backgroundColor", "");
      $(this).find("p, .user-action button").show();
      $(this).css("backgroundColor", "#e0f7fa");
      $(".user-box h3").css("color", "#000");
    });

    $(".edit-user")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
        const $userBox = $(this).closest(".user-box");
        const userId = $userBox.data("id");

        if ($userBox.find(".edit-form").length > 0) return;

        const currentName = $userBox.find(".user-name").text();
        const currentEmail = $userBox.find(".user-email span").text();
        const currentPassword = $userBox.find(".user-password span").text();

        $userBox.html(`
            <h3 class="list-user">Tên: ㅤ ㅤ<input type="text" class="edit-name input" value="${currentName}" /></h3>
            <p class="user-email">Email:ㅤㅤ <input type="text" class="edit-email input" value="${currentEmail}" /></p>
            <p class="user-password"> Mật Khẩu:  <input type="text" class="edit-password input" value="${currentPassword}" /></p>
            <div class="user-action edit-form">
              <div class="edit-form-btn">
                <button class="button-user save-user">Lưu</button>
                <button class="button-user cancel-edit">Hủy</button>
              </div>
            </div>
          `);

        $userBox.find(".save-user").on("click", function (e) {
          e.stopPropagation();
          saveUser(userId, $userBox);
        });

        $userBox.find(".cancel-edit").on("click", function (e) {
          e.stopPropagation();
          loadUsers();
        });
      });

    $(".delete-user")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
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
            loadUsers();
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
        loadUsers();
      },
      error: function (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Không thể xóa người dùng! Kiểm tra Console.");
      },
    });
  }
});
