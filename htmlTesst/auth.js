document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "https://2szhs6-8080.csb.app";

  // Kiểm tra trạng thái đăng nhập và cập nhật giao diện
  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let user = await response.json();
    const dangNhapDiv = document.getElementById("dangNhap");
    const adminAccountInfo = document.getElementById("admin-account-info");

    if (user && user.id) {
      console.log("🔒 Đã đăng nhập:", user.email);
      // Chặn truy cập login.html nếu đã đăng nhập
      if (window.location.pathname.includes("login.html")) {
        window.location.replace("index.html");
      }
      // Chặn truy cập admin.html nếu không phải admin
      if (
        window.location.pathname.includes("admin.html") &&
        user.role !== "admin"
      ) {
        window.location.replace("index.html");
      }

      // Cập nhật giao diện header
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

      // Cập nhật giao diện account.html dựa trên vai trò
      if (adminAccountInfo) {
        if (user.role === "admin") {
          adminAccountInfo.innerHTML = `
              <img src="./Manhh.png" alt="" class="" />
              <p>ㅤ<span id="userName" class="tenHienThi">${user.name}</span></p>
              <p style="font-size: 15px; color: #323232">Admin Mạnh PC Shop</p>
              <br />
              <button class="nutDangXuat">
                <a href="./admin.html">Quản lí user</a>
              </button>
              <button id="logoutBtn" class="nutDangXuat">Đăng xuất</button>
            `;
        } else {
          adminAccountInfo.innerHTML = `
              <img src="./Manhh.png" alt="" class="" />
              <p>ㅤ<span id="userName" class="tenHienThi">${user.name}</span></p>
              <p style="font-size: 15px; color: #323232">Thành viên Mạnh PC Shop</p>
              <br />
              <button id="logoutBtn" class="nutDangXuat">Đăng xuất</button>
            `;
        }

        // Gắn sự kiện cho nút đăng xuất
        document
          .getElementById("logoutBtn")
          .addEventListener("click", async () => {
            await fetch(`${API_URL}/currentUser`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            localStorage.removeItem("cart");
            alert("Đăng xuất thành công !");
            window.location.href = "login.html";
          });
      }
    } else {
      // Chưa đăng nhập, chặn truy cập admin.html
      if (window.location.pathname.includes("admin.html")) {
        window.location.replace("login.html");
      }
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
    if (typeof window.updateCartNotification === "function") {
      window.updateCartNotification();
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
  }

  // 🔹 ĐĂNG KÝ TÀI KHOẢN
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        alert(
          "Email không đúng định dạng! Vui lòng nhập theo dạng username@domain.com (ví dụ: username@gmail.com)."
        );
        return;
      }

      try {
        let response = await fetch(`${API_URL}/users`);
        let users = await response.json();
        let userExists = users.some((user) => user.email === email);

        if (userExists) {
          alert("Email đã tồn tại. Vui lòng chọn email khác.");
        } else {
          let newUser = {
            id: generateID(),
            name,
            email,
            password,
            cart: [],
            role: "user",
          };
          await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
          alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
          window.location.href = "login.html";
        }
      } catch (error) {
        alert("Lỗi kết nối đến server! Chạy file json server để khắc phục.");
      }
    });
  }

  function generateID() {
    return Math.random().toString(36).substr(2, 4);
  }

  // 🔹 ĐĂNG NHẬP
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
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
          let localCart = JSON.parse(localStorage.getItem("cart")) || [];
          user.cart = user.cart || [];
          let mergedCart = [...user.cart];
          localCart.forEach((localItem) => {
            let existingItem = mergedCart.find(
              (item) => item.id === localItem.id
            );
            if (!existingItem) {
              mergedCart.push(localItem);
            }
          });
          user.cart = mergedCart;

          await fetch(`${API_URL}/currentUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });

          await fetch(`${API_URL}/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });

          localStorage.setItem("cart", JSON.stringify(mergedCart));

          if (user.role === "admin") {
            alert("Bạn đang đăng nhập với tư cách admin");
          } else {
            alert("Đăng nhập thành công!");
          }
          window.location.href = "index.html";
        } else {
          alert("Sai email hoặc mật khẩu!");
        }
      } catch (error) {
        alert("Lỗi kết nối đến server! Vui lòng chạy json server");
      }
    });
  }
});
