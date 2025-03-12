$(document).ready(function () {
  const API_URL = "http://localhost:3000";

  // ĐĂNG KÝ TÀI KHOẢN
  $("#registerBtn").click(function (e) {
    e.preventDefault();

    let name = $("#registerName").val().trim();
    let email = $("#registerEmail").val().trim();
    let password = $("#registerPassword").val().trim();

    if (!name || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    $.get(`${API_URL}/users`, function (users) {
      let userExists = users.some((user) => user.email === email);

      if (userExists) {
        alert("Email này đã được đăng ký. Vui lòng chọn email khác.");
      } else {
        let newUser = { id: generateID(), name, email, password, cart: [] };

        $.ajax({
          url: `${API_URL}/users`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(newUser),
          success: function () {
            alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
            // window.location.replace("https://facebook.com");
            window.location.href = "https://facebook.com";
          },
          error: function () {
            alert("Lỗi khi đăng ký, vui lòng thử lại!");
          },
        });
      }
    }).fail(function () {
      alert("Lỗi kết nối đến server! Vui lòng thử lại.");
    });
  });

  function generateID() {
    return Math.random().toString(36).substr(2, 4);
  }

  // ĐĂNG NHẬP
  $("#loginBtn").click(function (e) {
    e.preventDefault();

    let email = $("#loginEmail").val().trim();
    let password = $("#loginPassword").val().trim();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu!");
      return;
    }

    $.get(`${API_URL}/users`, function (users) {
      let user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        $.ajax({
          url: `${API_URL}/currentUser`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(user),
          success: function () {
            alert("Đăng nhập thành công!");
            window.location.href = "./index.html";
          },
          error: function (xhr, status, error) {
            console.error("Lỗi đăng nhập:", status, error, xhr.responseText);
            alert("Lỗi đăng nhập: " + error);
          },
        });
      } else {
        alert("Sai email hoặc mật khẩu!");
      }
    }).fail(function () {
      alert("Lỗi kết nối đến server! Vui lòng thử lại.");
    });
  });

  // HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
  function loadUserInfo() {
    $.get(`${API_URL}/currentUser`, function (user) {
      if (user) {
        $("#userName").text(user.name);
        $("#userEmail").text(user.email);
        $(".dangNhap1 p")
          .text("Tài khoản")
          .parent()
          .attr("href", "account.html");
      } else {
        window.location.href = "./login.html";
      }
    });
  }

  if (window.location.pathname.includes("./account.html")) {
    loadUserInfo();

    // ĐĂNG XUẤT
    $("#logoutBtn").click(function () {
      $.ajax({
        url: `${API_URL}/currentUser`,
        type: "DELETE",
        success: function () {
          alert("Đăng xuất thành công!");
          window.location.href = "index.html";
        },
      });
    });
  }

  // QUẢN LÝ USER (Admin Page)
  if (window.location.pathname.includes("./admin.html")) {
    loadUsers();

    function loadUsers() {
      $.get(`${API_URL}/users`, function (users) {
        let userTable = "";
        users.forEach((user) => {
          userTable += `<tr>
                          <td>${user.id}</td>
                          <td>${user.name}</td>
                          <td>${user.email}</td>
                          <td>
                            <button class='deleteUser' data-id='${user.id}'>Xóa</button>
                          </td>
                        </tr>`;
        });
        $("#userTable tbody").html(userTable);
      });
    }

    $(document).on("click", ".deleteUser", function () {
      let userId = $(this).data("id");
      if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
        $.ajax({
          url: `${API_URL}/users/${userId}`,
          type: "DELETE",
          success: function () {
            alert("Xóa thành công!");
            loadUsers();
          },
          error: function () {
            alert("Lỗi khi xóa người dùng!");
          },
        });
      }
    });
  }
});
