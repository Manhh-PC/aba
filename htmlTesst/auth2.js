document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000";

  // ĐĂNG KÝ TÀI KHOẢN
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      let name = document.getElementById("registerName").value.trim();
      let email = document.getElementById("registerEmail").value.trim();
      let password = document.getElementById("registerPassword").value.trim();

      if (!name || !email || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      try {
        let response = await fetch(`${API_URL}/users`);
        let users = await response.json();
        let userExists = users.some((user) => user.email === email);

        if (userExists) {
          alert("Email này đã được đăng ký. Vui lòng chọn email khác.");
        } else {
          let newUser = { id: generateID(), name, email, password, cart: [] };
          await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
          alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
          window.location.href = "login.html";
        }
      } catch (error) {
        alert("Lỗi kết nối đến server! Vui lòng thử lại.");
      }
    });
  }

  function generateID() {
    return Math.random().toString(36).substr(2, 4);
  }

  // ĐĂNG NHẬP
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      console.log("✅ Nút đăng nhập đã được click!");
      e.preventDefault();
      let email = document.getElementById("loginEmail").value.trim();
      let password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        alert("Vui lòng nhập email và mật khẩu!");
        return;
      }

      try {
        let response = await fetch(`${API_URL}/users`);
        let users = await response.json();
        let user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          await fetch(`${API_URL}/currentUser`, {
            method: "POST", // Thử POST thay vì PUT/PATCH
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });
          alert("Đăng nhập thành công!");
          console.log("User tìm thấy:", user);
          window.location.href = "index.html";
        } else {
          alert("Sai email hoặc mật khẩu!");
        }
      } catch (error) {
        alert("Lỗi kết nối đến server! Vui lòng thử lại.");
      }
    });
  }

  // HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
  async function loadUserInfo() {
    try {
      let response = await fetch(`${API_URL}/currentUser`);
      let user = await response.json();
      if (user && user.email) {
        document.getElementById("userName").textContent = user.name;
        document.getElementById("userEmail").textContent = user.email;
        document.querySelector(".dangNhap1 p").textContent = "Tài khoản";
        document.querySelector(".logIna").href = "./account.html";
      } else {
        window.location.replace("index.html");
      }
    } catch (error) {
      alert("Lỗi khi tải thông tin người dùng!");
    }
  }
  document.getElementById;
  if (window.location.pathname.includes("account.html")) {
    loadUserInfo();
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/currentUser`, { method: "DELETE" });
        alert("Đăng xuất thành công!");
        window.location.href = "index.html";
      });
    }
  }

  // QUẢN LÝ USER (Admin Page)
  if (window.location.pathname.includes("admin.html")) {
    loadUsers();

    async function loadUsers() {
      try {
        let response = await fetch(`${API_URL}/users`);
        let users = await response.json();
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
        document.querySelector("#userTable tbody").innerHTML = userTable;
      } catch (error) {
        alert("Lỗi khi tải danh sách người dùng!");
      }
    }

    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("deleteUser")) {
        let userId = e.target.dataset.id;
        if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
          try {
            await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
            alert("Xóa thành công!");
            loadUsers();
          } catch (error) {
            alert("Lỗi khi xóa người dùng!");
          }
        }
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "http://localhost:3000";

  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let user = await response.json();

    const dangNhapDiv = document.getElementById("dangNhap");

    if (user && user.id) {
      // Nếu đã đăng nhập, thay đổi giao diện
      dangNhapDiv.innerHTML = `
        <img src="Manhh.png" alt="Logo" class="loGo" />
        <a href="./account.html" class="logIna">
          <div class="dangNhap1" style="margin-right: 10px">
            <i class="fa-regular fa-user"></i>
            <p>Tài khoản</p>
          </div>
        </a>
        <a href="cart.html">
          <div class="gioHang1">
            <div class="notification">
              <i class="fa-solid fa-cart-shopping"></i>
            </div>
            <p>Giỏ hàng</p>
          </div>
        </a>
      `;
    } else {
      // Nếu chưa đăng nhập, giữ nguyên giao diện ban đầu
      dangNhapDiv.innerHTML = `
        <img src="Manhh.png" alt="Logo" class="loGo" />
        <a href="./login.html" class="logIna">
          <div class="dangNhap1" style="margin-right: 10px">
            <i class="fa-regular fa-user"></i>
            <p>Đăng nhập</p>
          </div>
        </a>
        <a href="cart.html">
          <div class="gioHang1">
            <div class="notification">
              <i class="fa-solid fa-cart-shopping"></i>
            </div>
            <p>Giỏ hàng</p>
          </div>
        </a>
      `;
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
  }
});
