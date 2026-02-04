// Simple in-browser state for cart and books
// NOTE: When you plug in your Spring Boot backend later,
// you can return this same shape from your /books endpoint:
// {
//   id, title, author, price, tag, description, imageUrl
// }
const books = [
  {
    id: "natural-ways-to-health-shiatsu",
    title: "Natural Ways to Health: Shiatsu",
    author: "Natural Health Series",
    price: 15000,
    tag: "Ethnic health",
    imageUrl:
      "https://images.pexels.com/photos/3735761/pexels-photo-3735761.jpeg",
    description:
      "Discover the traditional Japanese art of shiatsu for natural healing. This practical guide explains how gentle pressure on specific points can help relieve stress, ease pain, and support your body’s natural balance. Step‑by‑step illustrations make it simple to follow at home.",
  },
  {
    id: "complete-illustrated-guide-vitamins-minerals",
    title: "The Complete Illustrated Guide to Vitamins & Minerals",
    author: "Denise Mortimore",
    price: 16000,
    tag: "Nutrition",
    imageUrl:
      "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg",
    description:
      "An easy‑to‑use reference to every major vitamin and mineral. Learn what each nutrient does in the body, where to find it in food, and how to use it safely to support health concerns. Ideal for anyone who wants to understand supplements in a clear, visual way.",
  },
  {
    id: "alternative-medicine-norman-shealy",
    title: "Alternative Medicine",
    author: "Norman Shealy",
    price: 17000,
    tag: "Holistic",
    imageUrl:
      "https://images.pexels.com/photos/204649/pexels-photo-204649.jpeg",
    description:
      "A comprehensive overview of non‑conventional healing methods, from herbal remedies and acupuncture to mind‑body therapies. Norman Shealy explains when and how alternative approaches can complement conventional medicine, with a strong focus on safety and evidence.",
  },
  {
    id: "illustrated-encyclopedia-essential-oils",
    title: "The Illustrated Encyclopedia of Essential Oils",
    author: "Essential Oils Reference",
    price: 18000,
    tag: "Aromatherapy",
    imageUrl:
      "https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg",
    description:
      "A rich visual encyclopedia covering dozens of essential oils and their traditional uses. Includes guidance on blending, safe dilution, and practical recipes for relaxation, beauty care, and natural home remedies, with a strong emphasis on therapeutic quality.",
  },
  {
    id: "complete-illustrated-guide-reflexology",
    title: "The Complete Illustrated Guide to Reflexology",
    author: "Inge Dougans",
    price: 19000,
    tag: "Reflexology",
    imageUrl:
      "https://images.pexels.com/photos/161477/massage-therapist-spa-swedish-massage-massage-161477.jpeg",
    description:
      "Step‑by‑step, fully illustrated guide to reflexology – the natural therapy that works on reflex points in the feet and hands. Inge Dougans explains how stimulating these points can help improve circulation, support organs, and promote overall wellbeing.",
  },
];

const state = {
  cart: [],
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount / 1); // values are already in kobo-like units
}

function findCartItem(id) {
  return state.cart.find((item) => item.id === id);
}

function addToCart(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return;

  const existing = findCartItem(id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...book, qty: 1 });
  }
  renderCart();
}

function updateQty(id, delta) {
  const item = findCartItem(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((i) => i.id !== id);
  }
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  renderCart();
}

function cartTotals() {
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { count, total };
}

function renderBooks() {
  const grid = document.getElementById("books-grid");
  if (!grid) return;

  grid.innerHTML = "";
  books.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.innerHTML = `
      <img
        src="${book.imageUrl}"
        alt="${book.title} front cover"
        class="book-cover"
        loading="lazy"
      />
      <div class="book-body">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
        <div class="book-meta">
          <span class="badge">${book.tag}</span>
          <span class="book-price">${formatCurrency(book.price)}</span>
        </div>
        <p class="book-description" data-description="${book.id}">
          ${book.description}
        </p>
        <div class="book-actions">
          <button class="btn btn-ghost btn-sm" data-details="${book.id}">
            Read more
          </button>
          <button class="btn primary" data-add="${book.id}">
            Add to cart
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement) {
      const id = target.getAttribute("data-add");
      const detailsId = target.getAttribute("data-details");

      if (id) {
        addToCart(id);
      }

      if (detailsId) {
        const desc = grid.querySelector(
          `.book-description[data-description="${detailsId}"]`
        );
        if (desc) {
          desc.classList.toggle("expanded");
        }

        // Toggle button text between "Read more" and "Show less"
        if (target.textContent && target.textContent.toLowerCase().includes("read more")) {
          target.textContent = "Show less";
        } else {
          target.textContent = "Read more";
        }
      }
    }
  });
}

function renderCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-button");

  if (!cartItemsEl || !subtotalEl || !cartCountEl || !cartTotalEl || !checkoutBtn) return;

  const { count, total } = cartTotals();

  cartItemsEl.innerHTML = "";

  if (state.cart.length === 0) {
    cartItemsEl.classList.add("empty-state");
    cartItemsEl.innerHTML = `<p>Your cart is empty. Add some books!</p>`;
    checkoutBtn.disabled = true;
  } else {
    cartItemsEl.classList.remove("empty-state");
    state.cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-details">
          <p class="cart-item-title">${item.title}</p>
          <p class="cart-item-meta">${item.author}</p>
        </div>
        <div class="cart-item-actions">
          <span class="cart-item-price">${formatCurrency(item.price * item.qty)}</span>
          <div class="cart-qty">
            <button aria-label="Decrease" data-dec="${item.id}">−</button>
            <span>${item.qty}</span>
            <button aria-label="Increase" data-inc="${item.id}">+</button>
          </div>
          <button class="btn btn-sm btn-outline" data-remove="${item.id}">
            Remove
          </button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    checkoutBtn.disabled = false;
  }

  subtotalEl.textContent = formatCurrency(total);
  cartCountEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
  cartTotalEl.textContent = formatCurrency(total);
}

function setupCartInteractions() {
  const cartItemsEl = document.getElementById("cart-items");
  if (!cartItemsEl) return;

  cartItemsEl.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const dec = target.getAttribute("data-dec");
    const inc = target.getAttribute("data-inc");
    const remove = target.getAttribute("data-remove");
    if (dec) updateQty(dec, -1);
    if (inc) updateQty(inc, 1);
    if (remove) removeFromCart(remove);
  });
}

// ---- Paystack integration ----
// IMPORTANT:
// 1. Replace the value of PAYSTACK_PUBLIC_KEY with your own Paystack test public key
// 2. Email + amount are passed from the form/cart
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // TODO: change this

function handleCheckout() {
  const { total, count } = cartTotals();
  if (total <= 0 || count === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes("xxxx")) {
    alert("Please configure your Paystack public key in app.js before testing payments.");
    return;
  }

  const email = prompt("Enter your email address for the receipt:", "customer@example.com");
  if (!email) return;

  const paystack = new PaystackPop();

  const reference = `BOOKS-${Date.now()}`;

  // amount is specified in kobo, so we multiply by 100 if you treat prices as naira.
  // Our prices above are in naira, so convert:
  const amountInKobo = total * 100;

  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountInKobo,
    reference,
    metadata: {
      cart_items: state.cart.map((item) => ({
        id: item.id,
        title: item.title,
        qty: item.qty,
        unit_price: item.price,
      })),
    },
    onSuccess: (transaction) => {
      alert(`Payment successful! Reference: ${transaction.reference}`);
      // Clear cart after successful payment
      state.cart = [];
      renderCart();
    },
    onCancel: () => {
      alert("Payment cancelled.");
    },
  });
}

function setupCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-button");
  if (!checkoutBtn) return;
  checkoutBtn.addEventListener("click", handleCheckout);
}

document.addEventListener("DOMContentLoaded", () => {
  renderBooks();
  renderCart();
  setupCartInteractions();
  setupCheckoutButton();
});

