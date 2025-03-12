const API_URL = "https://2szhs6-8080.csb.app";

// Hàm đồng bộ giỏ hàng lên API
async function syncCartToAPI(cart) {
  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let currentUser = await response.json();

    if (currentUser && currentUser.id) {
      currentUser.cart = cart;
      await fetch(`${API_URL}/currentUser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });

      await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ giỏ hàng lên API:", error);
  }
}

// Hàm lấy giỏ hàng từ API hoặc localStorage
async function getCart() {
  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let currentUser = await response.json();
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];

    if (currentUser && currentUser.id && currentUser.cart) {
      let mergedCart = [...currentUser.cart];
      localCart.forEach((localItem) => {
        let existingItem = mergedCart.find((item) => item.id === localItem.id);
        if (!existingItem) {
          mergedCart.push(localItem);
        }
      });
      localStorage.setItem("cart", JSON.stringify(mergedCart));
      return mergedCart;
    }
    return localCart;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
}

// Cập nhật thông báo giỏ hàng
window.updateCartNotification = async function () {
  let cart = await getCart();
  let totalProducts = cart.length;
  let notificationIcon = document.querySelector(".notification");
  if (notificationIcon) {
    notificationIcon.setAttribute("data-count", totalProducts);
  } else {
    console.log("Không tìm thấy .notification");
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  // Xử lý thêm vào giỏ hàng trên trang index.html
  const addToCartButtons = document.querySelectorAll(".themVaoGio");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const product = {
        id: this.dataset.name,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price.replace("₫", "").replace(/\./g, "")),
        image: this.dataset.image,
        quantity: 1,
      };

      let cart = await getCart();
      let existingProduct = cart.find((item) => item.id === product.id);
      if (!existingProduct) {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      await syncCartToAPI(cart);
      window.updateCartNotification();
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    });
  });

  // Xử lý hiển thị giỏ hàng trên cart.html
  if (document.getElementById("cartItems")) {
    let cart = await getCart();
    const cartTableBody = document.getElementById("cartItems");
    const totalPriceElement = document.getElementById("totalPrice");
    const emptyCartMessage = document.getElementById("emptyCart");
    const cartTable = document.getElementById("cartTable");
    const totalContainer = document.getElementById("totalContainer");
    const selectedCountElement = document.getElementById("selectedCount");
    const selectedTotalPriceElement = document.getElementById("selectedTotalPrice");
    const buyButton = document.getElementById("buyButton");

    async function renderCart() {
      cartTableBody.innerHTML = "";
      let total = 0;

      if (cart.length === 0) {
        cartTable.style.display = "none";
        totalContainer.style.display = "none";
        emptyCartMessage.style.display = "block";
        return;
      } else {
        cartTable.style.display = "table";
        totalContainer.style.display = "block";
        emptyCartMessage.style.display = "none";
      }

      cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
              <label class="checkbox-container">
                <input class="custom-checkbox product-checkbox" type="checkbox" data-index="${index}" />
                <span class="checkmark"></span>
              </label>
          </td>
          <td class="tenSP"><img src="${item.image}" alt="${item.name}" width="50px"> <p>${item.name}</p></td>
          <td>${item.price.toLocaleString("vi-VN")} VND</td>
          <td>
            <div class="nutTangGiam">
              <button class="button-reduce" data-index="${index}">-</button>
              <input
                type="text"
                role="spinbutton"
                value="${item.quantity}"
                class="quantity-input"
                data-index="${index}"
              />
              <button class="button-increase" data-index="${index}">+</button>
            </div>
          </td>
          <td class="subtotal">${(item.price * item.quantity).toLocaleString("vi-VN")} VND</td>
          <td>
            <button class="delete-btn" data-index="${index}">Xóa</button>
          </td>
        `;
        cartTableBody.appendChild(row);
        total += item.price * item.quantity;
      });

      totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";
      updateSelectedTotal();
    }

    function updateSelectedTotal() {
      let selectedTotal = 0;
      let selectedCount = 0;

      document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
        if (checkbox.checked) {
          let index = checkbox.dataset.index;
          selectedTotal += cart[index].price * cart[index].quantity;
          selectedCount++;
        }
      });

      selectedTotalPriceElement.textContent = selectedTotal.toLocaleString("vi-VN") + " VND";
      selectedCountElement.textContent = selectedCount;
    }

    // Xử lý tăng giảm số lượng
    cartTableBody.addEventListener("click", async function (event) {
      if (event.target.classList.contains("button-reduce") || event.target.classList.contains("button-increase")) {
        const index = event.target.dataset.index;
        let quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
        let currentQuantity = parseInt(quantityInput.value) || 1;

        if (event.target.classList.contains("button-reduce")) {
          currentQuantity = Math.max(1, currentQuantity - 1); // Tối thiểu là 1
        } else if (event.target.classList.contains("button-increase")) {
          currentQuantity = Math.min(150, currentQuantity + 1); // Tối đa là 150
        }

        quantityInput.value = currentQuantity;
        cart[index].quantity = currentQuantity;

        // Cập nhật giá sản phẩm
        const subtotalElement = quantityInput.closest("tr").querySelector(".subtotal");
        subtotalElement.textContent = (cart[index].price * cart[index].quantity).toLocaleString("vi-VN") + " VND";

        // Cập nhật tổng tiền
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";

        localStorage.setItem("cart", JSON.stringify(cart));
        await syncCartToAPI(cart);
        updateSelectedTotal(); // Cập nhật selectedTotalPrice khi thay đổi số lượng
      }

      if (event.target.classList.contains("delete-btn")) {
        const index = event.target.dataset.index;
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
          cart = cart.filter((_, i) => i !== parseInt(index));
          localStorage.setItem("cart", JSON.stringify(cart));
          await syncCartToAPI(cart);
          renderCart();
          window.updateCartNotification();
        }
      }
    });

    // Ngăn nhập text, chỉ cho phép số, giới hạn 1-150
    cartTableBody.addEventListener("input", function (event) {
      if (event.target.classList.contains("quantity-input")) {
        const index = event.target.dataset.index;
        let value = event.target.value;

        if (!/^\d*$/.test(value)) {
          event.target.value = cart[index].quantity; // Giữ giá trị cũ nếu không phải số
          return;
        }

        let numValue = parseInt(value);
        if (value !== "" && (numValue < 1 || numValue > 150)) {
          event.target.value = cart[index].quantity; // Giữ giá trị cũ nếu vượt giới hạn
          return;
        }
      }
    });

    cartTableBody.addEventListener("blur", async function (event) {
      if (event.target.classList.contains("quantity-input")) {
        const index = event.target.dataset.index;
        let value = parseInt(event.target.value);

        if (isNaN(value) || value < 1) {
          event.target.value = 1;
          cart[index].quantity = 1;
        } else if (value > 150) {
          event.target.value = 150;
          cart[index].quantity = 150;
        } else {
          cart[index].quantity = value;
        }

        const subtotalElement = event.target.closest("tr").querySelector(".subtotal");
        subtotalElement.textContent = (cart[index].price * cart[index].quantity).toLocaleString("vi-VN") + " VND";

        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";

        localStorage.setItem("cart", JSON.stringify(cart));
        await syncCartToAPI(cart);
        updateSelectedTotal(); // Cập nhật selectedTotalPrice khi blur
      }
    }, true);

    cartTableBody.addEventListener("change", function (event) {
      if (event.target.classList.contains("product-checkbox")) {
        updateSelectedTotal();
      }
    });

    buyButton.addEventListener("click", async function () {
      let selectedItems = [];
      let newCart = [];

      document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
        let index = parseInt(checkbox.dataset.index);
        if (checkbox.checked) {
          selectedItems.push(cart[index]);
        } else {
          newCart.push(cart[index]);
        }
      });

      if (selectedItems.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để mua!");
        return;
      }

      // Lưu danh sách sản phẩm đã chọn vào localStorage để sử dụng ở trang thanhToan.html
      localStorage.setItem("selectedItems", JSON.stringify(selectedItems));

      // Cập nhật giỏ hàng (loại bỏ các sản phẩm đã chọn)
      cart = newCart;
      localStorage.setItem("cart", JSON.stringify(cart));
      await syncCartToAPI(cart);

      // Chuyển hướng sang trang thanhToan.html
      window.location.href = "thanhToan.html";
    });

    await renderCart();
    window.updateCartNotification();
  }

  window.updateCartNotification();
});