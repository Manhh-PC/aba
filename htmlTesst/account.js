document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://2szhs6-8080.csb.app";
  
    // Tải thông tin người dùng cho account.html
    async function loadUserInfo() {
      try {
        let response = await fetch(`${API_URL}/currentUser`);
        if (!response.ok) throw new Error("Không thể tải thông tin người dùng từ API");
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
        alert("Lỗi khi tải thông tin người dùng! Kiểm tra API hoặc Console.");
      }
    }
  
    // Xử lý chỉnh sửa thông tin cho account.html
    const editInfoBtn = document.getElementById("edit-info");
    const updateInfoBtn = document.getElementById("update-info");
    const editForm = document.getElementById("editForm");
    const infoDisplay = document.getElementById("infoDisplay");
    const editNameInput = document.getElementById("editName");
    const editEmailInput = document.getElementById("editEmail");
  
    if (editInfoBtn && updateInfoBtn) {
      editInfoBtn.addEventListener("click", async function () {
        try {
          let response = await fetch(`${API_URL}/currentUser`);
          if (!response.ok) throw new Error("Không thể tải thông tin từ API");
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
  
        if (!newName || !newEmail) {
          alert("Vui lòng nhập đầy đủ họ tên và email!");
          return;
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(newEmail)) {
          alert("Email phải có định dạng hợp lệ (ví dụ: user@gmail.com)!");
          return;
        }
  
        try {
          let response = await fetch(`${API_URL}/currentUser`);
          if (!response.ok) throw new Error("Không thể tải currentUser từ API");
          let currentUser = await response.json();
  
          if (currentUser && currentUser.id) {
            currentUser.name = newName;
            currentUser.email = newEmail;
  
            let updateResponse = await fetch(`${API_URL}/currentUser`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(currentUser),
            });
            if (!updateResponse.ok) throw new Error("Không thể cập nhật currentUser");
  
            let userUpdateResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(currentUser),
            });
            if (!userUpdateResponse.ok) throw new Error("Không thể cập nhật users/[id]");
  
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
          alert("Đã có lỗi xảy ra khi cập nhật thông tin! Kiểm tra Console.");
        }
      });
    }
  
    // Xử lý đăng xuất cho account.html
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async function () {
        try {
          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          let response = await fetch(`${API_URL}/currentUser`);
          if (!response.ok) throw new Error("Không thể tải currentUser từ API");
          let currentUser = await response.json();
  
          if (currentUser && currentUser.id) {
            currentUser.cart = cart;
            let userUpdateResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(currentUser),
            });
            if (!userUpdateResponse.ok) throw new Error("Không thể cập nhật users/[id]");
          }
  
          let resetResponse = await fetch(`${API_URL}/currentUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (!resetResponse.ok) throw new Error("Không thể đặt lại currentUser");
  
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
          alert("Đã có lỗi xảy ra khi đăng xuất! Kiểm tra Console.");
        }
      });
    }
  
    // Xử lý đổi mật khẩu cho doiMatKhau.html
    const changePasswordBtn = document.getElementById("changePassword");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", async function (e) {
        e.preventDefault();
  
        const oldPassword = document.getElementById("old-password").value.trim();
        const newPassword = document.getElementById("new-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();
  
        // Kiểm tra các trường rỗng
        if (!oldPassword || !newPassword || !confirmPassword) {
          alert("Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu!");
          return;
        }
  
        try {
          let response = await fetch(`${API_URL}/currentUser`);
          if (!response.ok) throw new Error("Không thể tải currentUser từ API");
          let currentUser = await response.json();
  
          if (!currentUser || !currentUser.id) {
            alert("Bạn cần đăng nhập để đổi mật khẩu!");
            window.location.replace("./login.html");
            return;
          }
  
          // Kiểm tra mật khẩu cũ
          if (oldPassword !== currentUser.password) {
            alert("Mật khẩu cũ không đúng!");
            return;
          }
  
          // Kiểm tra mật khẩu mới và xác nhận mật khẩu
          if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
          }
  
          // Cập nhật mật khẩu mới
          currentUser.password = newPassword;
  
          // Cập nhật currentUser
          let updateCurrentUserResponse = await fetch(`${API_URL}/currentUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          });
          if (!updateCurrentUserResponse.ok) throw new Error("Không thể cập nhật currentUser");
  
          // Cập nhật users/[id]
          let updateUserResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          });
          if (!updateUserResponse.ok) throw new Error("Không thể cập nhật users/[id]");
  
          alert("Đổi mật khẩu thành công!");
          console.log("Chuyển hướng về account.html"); // Debug
          window.location.href = "account.html"; // Chuyển hướng sau khi thành công
        } catch (error) {
          console.error("Lỗi khi đổi mật khẩu:", error);
          alert("Đã có lỗi xảy ra khi đổi mật khẩu! Kiểm tra Console để biết chi tiết.");
        }
      });
    }
  
    // Gọi hàm tải thông tin nếu ở account.html
    if (window.location.pathname.includes("account.html")) {
      loadUserInfo();
    }
  });

