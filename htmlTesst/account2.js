document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000";

  // Tải thông tin người dùng
  async function loadUserInfo() {
    try {
      let response = await fetch(`${API_URL}/currentUser`);
      let user = await response.json();
      if (user && user.email) {
        document.getElementById("userName").textContent = user.name;
        document.getElementById("userName2").textContent = user.name;
        document.getElementById("userEmail").textContent = user.email;
        document.querySelector(".dangNhap1 p").textContent = "Tài khoản";
        document.querySelector(".logIna").href = "./account.html";
      } else {
        window.location.replace("./login.html");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      alert("Lỗi khi tải thông tin người dùng!");
    }
  }

  // Xử lý chỉnh sửa thông tin
  const editInfoBtn = document.getElementById("edit-info");
  const updateInfoBtn = document.getElementById("update-info");
  const editForm = document.getElementById("editForm");
  const infoDisplay = document.getElementById("infoDisplay");
  const editNameInput = document.getElementById("editName");
  const editEmailInput = document.getElementById("editEmail");

  editInfoBtn.addEventListener("click", async function () {
    try {
      let response = await fetch(`${API_URL}/currentUser`);
      let user = await response.json();
      if (user && user.id) {
        editNameInput.value = user.name;
        editEmailInput.value = user.email;
        editForm.style.display = "block";
        infoDisplay.style.display = "none";
        editInfoBtn.style.display = "none";
        updateInfoBtn.style.display = "block";
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin để chỉnh sửa:", error);
      alert("Không thể tải thông tin để chỉnh sửa!");
    }
  });

  updateInfoBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const newName = editNameInput.value.trim();
    const newEmail = editEmailInput.value.trim();

    // Kiểm tra các trường rỗng
    if (!newName || !newEmail) {
      alert("Vui lòng nhập đầy đủ họ tên và email!");
      return;
    }

    // Kiểm tra định dạng email hợp lệ với @ và đuôi như .com, .org, .net, ...
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      alert(
        "Email phải có định dạng hợp lệ (ví dụ: user@gmail.com, user@hotmail.com)!"
      );
      return;
    }

    try {
      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();

      if (currentUser && currentUser.id) {
        currentUser.name = newName;
        currentUser.email = newEmail;

        // Cập nhật currentUser
        await fetch(`${API_URL}/currentUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });

        // Cập nhật users/[id]
        await fetch(`${API_URL}/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });

        // Cập nhật giao diện
        document.getElementById("userName").textContent = newName;
        document.getElementById("userName2").textContent = newName;
        document.getElementById("userEmail").textContent = newEmail;

        editForm.style.display = "none";
        infoDisplay.style.display = "block";
        editInfoBtn.style.display = "block";
        updateInfoBtn.style.display = "none";

        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      alert("Đã có lỗi xảy ra khi cập nhật thông tin!");
    }
  });

  // Xử lý đăng xuất
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      try {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let response = await fetch(`${API_URL}/currentUser`);
        let currentUser = await response.json();

        if (currentUser && currentUser.id) {
          currentUser.cart = cart;
          await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          });
        }

        await fetch(`${API_URL}/currentUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        console.log("Đã xóa currentUser thành công");
        alert("Đăng xuất thành công!");

        const dangNhapDiv = document.getElementById("dangNhap");
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
        if (typeof window.updateCartNotification === "function") {
          window.updateCartNotification();
        }

        window.location.href = "index.html";
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
        alert(
          "Đã có lỗi xảy ra khi đăng xuất! Kiểm tra Console để biết chi tiết."
        );
      }
    });
  }

  // Gọi hàm tải thông tin khi trang tải
  loadUserInfo();
});
