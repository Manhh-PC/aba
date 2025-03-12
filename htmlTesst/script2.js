// Định nghĩa hàm toàn cục để auth.js có thể gọi
window.updateCartNotification = function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalProducts = cart.length;
    let notificationIcon = document.querySelector(".notification");
    if (notificationIcon) {
      notificationIcon.setAttribute("data-count", totalProducts);
      // Không cần setProperty --count nữa vì CSS trong file đã xử lý
    } else {
      console.log("Không tìm thấy .notification");
    }
  };
  
  document.addEventListener("DOMContentLoaded", function () {
    // Xử lý thêm vào giỏ hàng trên trang index.html
    const addToCartButtons = document.querySelectorAll(".themVaoGio");
  
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const product = {
          id: this.dataset.name,
          name: this.dataset.name,
          price: parseFloat(
            this.dataset.price.replace("₫", "").replace(/\./g, "")
          ),
          image: this.dataset.image,
          quantity: 1,
        };
  
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let existingProduct = cart.find((item) => item.id === product.id);
        if (!existingProduct) {
          cart.push(product);
        }
  
        localStorage.setItem("cart", JSON.stringify(cart));
        window.updateCartNotification();
        alert("Sản phẩm đã được thêm vào giỏ hàng!");
      });
    });
  
    // Xử lý hiển thị giỏ hàng trên cart.html
    if (document.getElementById("cartItems")) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartTableBody = document.getElementById("cartItems");
      const totalPriceElement = document.getElementById("totalPrice");
      const emptyCartMessage = document.getElementById("emptyCart");
      const cartTable = document.getElementById("cartTable");
      const totalContainer = document.getElementById("totalContainer");
      const selectedCountElement = document.getElementById("selectedCount");
      const selectedTotalPriceElement =
        document.getElementById("selectedTotalPrice");
      const buyButton = document.getElementById("buyButton");
  
      function renderCart() {
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
            <td class="tenSP"><img src="${item.image}" alt="${
            item.name
          }" width="50px"> <p>${item.name}</p></td>
            <td>${item.price.toLocaleString("vi-VN")} VND</td>
            <td>
                <input type="number" value="${
                  item.quantity
                }" min="1" max="10" class="quantity-input" data-index="${index}">
            </td>
            <td>${(item.price * item.quantity).toLocaleString("vi-VN")} VND</td>
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
  
        selectedTotalPriceElement.textContent =
          selectedTotal.toLocaleString("vi-VN") + " VND";
        selectedCountElement.textContent = selectedCount;
      }
  
      cartTableBody.addEventListener("input", function (event) {
        if (event.target.classList.contains("quantity-input")) {
          const index = event.target.dataset.index;
          let newQuantity = parseInt(event.target.value);
          if (newQuantity < 1) {
            alert("Số lượng phải lớn hơn hoặc bằng 1.");
            event.target.value = cart[index].quantity;
            return;
          }
          cart[index].quantity = newQuantity;
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart();
          updateSelectedTotal();
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart();
        }
      });
  
      cartTableBody.addEventListener("change", function (event) {
        if (event.target.classList.contains("product-checkbox")) {
          updateSelectedTotal();
        }
      });
  
      cartTableBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
          const index = event.target.dataset.index;
          if (
            confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")
          ) {
            cart = cart.filter((_, i) => i !== parseInt(index));
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
            window.updateCartNotification();
          }
        }
      });
  
      buyButton.addEventListener("click", function () {
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
  
        cart = newCart;
        localStorage.setItem("cart", JSON.stringify(cart));
  
        alert(
          `Bạn đã mua ${selectedItems.length} sản phẩm với tổng tiền ${selectedTotalPriceElement.textContent}.`
        );
  
        renderCart();
        window.updateCartNotification();
      });
  
      renderCart();
      window.updateCartNotification();
    }
  
    // Cập nhật thông báo khi tải trang
    window.updateCartNotification();
  });
  
  // Xử lý xóa toàn bộ giỏ hàng (đã comment trong file gốc, giữ nguyên)
  // document.addEventListener("DOMContentLoaded", function () {
  //   const clearCartButton = document.getElementById("clearCartButton");
  //   if (clearCartButton) {
  //     clearCartButton.addEventListener("click", function () {
  //       if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
  //         localStorage.removeItem("cart");
  //         alert("Giỏ hàng đã được xóa!");
  //         location.reload();
  //       }
  //     });
  //   }
  // });