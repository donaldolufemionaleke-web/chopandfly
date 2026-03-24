/* ============================================================
   ChopandFly Online Kitchen — Main React Application
   React 18 + Tailwind CSS + Vanilla CSS Animations
   v2.0 — Multi-item cart, Item modals, Fixed menu reveal
   ============================================================ */

const { useState, useEffect, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const MENU_TABS = [
  { id: "mains", label: "🍝 Main Dishes" },
  { id: "protein", label: "🥩 Protein" },
  { id: "drinks", label: "🥤 Drinks" },
];

const MENU_ITEMS = [
  // ── Main Dishes ──
  {
    id: 1,
    name: "Penne Pasta",
    description:
      "Al-dente penne tossed in a rich house-made tomato-basil pomodoro sauce, finished with freshly grated Parmesan and a drizzle of extra-virgin olive oil.",
    price: 4500,
    tag: "Fan Favourite",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format",
    tab: "mains",
    category: "Pasta",
    rating: 4.9,
    reviews: 241,
  },
  {
    id: 2,
    name: "Spaghetti",
    description:
      "Classic spaghetti Bolognese with slow-simmered beef ragù, San Marzano tomatoes, and a generous dusting of aged Pecorino Romano.",
    price: 2500,
    tag: "Chef's Pick",
    image:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80&auto=format",
    tab: "mains",
    category: "Pasta",
    rating: 4.8,
    reviews: 198,
  },
  // ── Protein ──
  {
    id: 3,
    name: "Peppered Chicken",
    description:
      "Juicy free-range chicken breast marinated in herbs and lemon, grilled to perfection — a clean, high-protein favourite.",
    price: 4000,
    tag: "High Protein",
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=800&q=80&auto=format",
    tab: "protein",
    category: "Chicken",
    rating: 4.7,
    reviews: 165,
  },
  {
    id: 4,
    name: "Peppered Turkey",
    description:
      "Tender beef strips seasoned with smoked paprika and garlic, seared hot on a cast iron for a perfectly caramelised crust.",
    price: 5000,
    tag: "Power Meal",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format",
    tab: "protein",
    category: "Beef",
    rating: 4.8,
    reviews: 122,
  },
  {
    id: 5,
    name: "Beef",
    description:
      "Four perfectly boiled free-range eggs — a simple, nutritious protein boost to complement any meal or stand alone as a snack.",
    price: 800,
    tag: "Simple & Clean",
    image:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80&auto=format",
    tab: "protein",
    category: "Eggs",
    rating: 4.5,
    reviews: 88,
  },
  // ── Drinks ──
  {
    id: 6,
    name: "Bottled Water",
    description:
      "Hand-squeezed lemons, a hint of mint, and just the right touch of sweetness — refreshing, tangy, and perfectly chilled.",
    price: 250,
    tag: "Refreshing",
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80&auto=format",
    tab: "drinks",
    category: "Cold Drinks",
    rating: 4.8,
    reviews: 143,
  },
  {
    id: 7,
    name: " Zobo",
    description:
      "Thick, velvety Alphonso mango blended with a splash of coconut milk and a squeeze of lime — tropical bliss in a cup.",
    price: 1000,
    tag: "Tropical",
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80&auto=format",
    tab: "drinks",
    category: "Smoothies",
    rating: 4.9,
    reviews: 176,
  },
  {
    id: 8,
    name: "Fruit Juice",
    description:
      "Double-shot espresso poured over velvety cold foam and ice — bold, creamy, and energising any time of the day.",
    price: 600,
    tag: "Energy Boost",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format",
    tab: "drinks",
    category: "Coffee",
    rating: 4.7,
    reviews: 109,
  },
];

const SERVICES = [
  {
    id: 1,
    icon: "🍽️",
    title: "Event Catering",
    description:
      "From intimate dinner parties to grand celebrations, our culinary team brings great food directly to your special event.",
  },
  {
    id: 2,
    icon: "🎁",
    title: "Surprise Packages",
    description:
      "Thoughtfully curated meal packages, beautifully presented — the perfect gift for someone you love.",
  },
  {
    id: 3,
    icon: "📦",
    title: "Bulk Food Orders",
    description:
      "Large-quantity orders handled with care and precision — ideal for offices, corporate events, and gatherings.",
  },
];

const BANK_DETAILS = {
  bank: "Chase Bank",
  name: "ChopandFly Kitchen",
  account: "1234-5678-9012",
  routing: "021000021",
};

// 🔥 FIREBASE + LOCALSTORAGE FALLBACK
function isFirebaseReady() {
  const isHttpOrigin =
    window.location.protocol === "http:" ||
    window.location.protocol === "https:";
  return (
    isHttpOrigin &&
    window.db &&
    window.firebaseConfig &&
    window.firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    typeof window.addOrder === "function" &&
    typeof window.getOrders === "function"
  );
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function loadOrders() {
  if (isFirebaseReady()) {
    try {
      const result = await withTimeout(
        window.getOrders(),
        10000,
        "Load orders",
      );
      return Array.isArray(result) ? result : [];
    } catch (e) {
      console.warn("Firebase load failed, using localStorage fallback:", e);
    }
  }
  try {
    return JSON.parse(localStorage.getItem("chopandfly_orders") || "[]");
  } catch {
    return [];
  }
}

async function saveOrders(orders) {
  if (isFirebaseReady()) {
    // Firebase saves individually - just return
    return orders;
  }
  try {
    localStorage.setItem("chopandfly_orders", JSON.stringify(orders));
  } catch {}
}

async function persistOrder(order) {
  if (isFirebaseReady()) {
    try {
      const result = await withTimeout(
        window.addOrder(order),
        12000,
        "Save order",
      );
      if (!result) throw new Error("Firebase addOrder returned empty result");
      return true;
    } catch (e) {
      console.warn("Firebase save failed, using localStorage fallback:", e);
    }
  }
  // Fallback: append to localStorage
  const orders = await loadOrders();
  orders.unshift(order);
  await saveOrders(orders);
  return true;
}

// ─────────────────────────────────────────────────────────────
// HOOK: Intersection Observer for scroll animations
// ─────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "5.5rem",
        right: "1.8rem",
        zIndex: 999,
        background: "linear-gradient(135deg,#E85D26,#F07A45)",
        color: "#fff",
        padding: "0.75rem 1.4rem",
        borderRadius: "50px",
        fontWeight: 600,
        fontSize: "0.88rem",
        boxShadow: "0 8px 28px rgba(232,93,38,0.45)",
        animation: "fadeInUp 0.35s ease forwards",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <i className="fas fa-check-circle"></i> {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

function Navbar({ onOrderClick, cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => scrollTo("hero")}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled ? "bg-orange-100" : "bg-white/20"}`}
          >
            <span className="text-xl">✂️</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}
            >
              ChopandFly
            </span>
            <span
              className={`text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full transition-all duration-300 ${scrolled ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white/90"}`}
            >
              Kitchen
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            ["menu", "Menu"],
            ["services", "Services"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`nav-link transition-colors duration-300 ${scrolled ? "text-gray-700 hover:text-orange-500" : "text-white/90 hover:text-white"}`}
            >
              {label}
            </button>
          ))}

          {/* Cart Icon */}
          <button
            onClick={onCartClick}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-none cursor-pointer ${scrolled ? "bg-orange-50 text-orange-500 hover:bg-orange-100" : "bg-white/15 text-white hover:bg-white/25"}`}
            title="View Cart"
          >
            <i className="fas fa-shopping-cart text-base"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          <button
            className="btn-primary text-sm py-2.5 px-6"
            onClick={onOrderClick}
          >
            <i className="fas fa-fire text-xs"></i> Order Now
          </button>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={onCartClick}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${scrolled ? "bg-orange-50 text-orange-500" : "bg-white/15 text-white"}`}
          >
            <i className="fas fa-shopping-cart text-base"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            className={`text-2xl transition-colors duration-300 bg-transparent border-none cursor-pointer ${scrolled ? "text-gray-900" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="mobile-menu md:hidden px-5 pb-5">
          {[
            ["menu", "Menu"],
            ["services", "Services"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left py-3.5 border-b border-orange-50 text-gray-800 font-medium hover:text-orange-500 transition-colors bg-transparent border-x-0 border-t-0 cursor-pointer text-base"
            >
              {label}
            </button>
          ))}
          <button
            className="btn-primary w-full mt-4 justify-center"
            onClick={() => {
              setMobileOpen(false);
              onOrderClick();
            }}
          >
            <i className="fas fa-fire text-xs"></i> Order Now
          </button>
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────

function Hero({ onOrderClick }) {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src =
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=85&auto=format";
    img.onload = () => setBgLoaded(true);
  }, []);

  const scrollToMenu = () =>
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="hero-section">
      <div className={`hero-bg ${bgLoaded ? "loaded" : ""}`}></div>
      <div className="hero-overlay"></div>

      <div className="hero-content text-center px-5 max-w-3xl animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold tracking-[0.18em] uppercase px-5 py-2 rounded-full mb-6 border border-white/25">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Now Open · Delivering Fresh
        </div>

        <h1
          className="font-display text-white font-bold mb-5 leading-tight"
          style={{
            fontSize: "clamp(2.6rem, 6.5vw, 4.4rem)",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          Eat Bold.
          <br />
          <em style={{ color: "#F5904A" }}>Fly Fast.</em>
        </h1>

        <p className="text-white/80 text-lg mb-9 max-w-xl mx-auto leading-relaxed font-light">
          Fresh meals crafted with real ingredients, cooked in our online
          kitchen and delivered straight to your door. No fuss — just great
          food.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-hero" onClick={onOrderClick}>
            <i className="fas fa-fire"></i>
            Order Now
          </button>
          <button
            onClick={scrollToMenu}
            className="inline-flex items-center gap-2 text-white border-2 border-white/45 px-7 py-4 rounded-full font-semibold text-base cursor-pointer bg-transparent hover:bg-white/15 transition-all duration-300"
          >
            <i className="fas fa-book-open text-sm"></i>
            View Menu
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 stats-bar inline-flex gap-10 px-8 py-4 mx-auto">
          {[
            ["500+", "Happy Customers"],
            ["4.9★", "Avg Rating"],
            ["30min", "Avg Delivery"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="font-display text-white text-xl font-bold">
                {val}
              </div>
              <div className="text-white/55 text-xs mt-0.5 whitespace-nowrap">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce cursor-pointer"
        onClick={scrollToMenu}
      >
        <i className="fas fa-chevron-down text-lg"></i>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// MENU CARD  (click → item detail modal)
// ─────────────────────────────────────────────────────────────

function MenuCard({ item, onItemClick, onQuickAdd, cartQty }) {
  const ref = useReveal();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      className="reveal menu-card"
      onClick={() => onItemClick(item)}
      title={`View ${item.name}`}
    >
      <div className="menu-card-img-wrap">
        <img
          src={
            imgError
              ? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
              : item.image
          }
          alt={item.name}
          className="menu-card-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <span className="menu-badge">{item.tag}</span>
        {cartQty > 0 && (
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "#E85D26",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.72rem",
              padding: "4px 11px",
              borderRadius: "50px",
              boxShadow: "0 2px 10px rgba(232,93,38,0.45)",
            }}
          >
            ×{cartQty} in cart
          </span>
        )}
        <div className="menu-card-click-hint">
          <i className="fas fa-eye mr-1.5"></i>View Details
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="feature-pill">
            <i className="fas fa-tag text-xs"></i>
            {item.category}
          </span>
          <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
            <i className="fas fa-star text-yellow-400 text-xs"></i>
            <span className="font-semibold text-gray-700">{item.rating}</span>
            <span className="text-gray-400">({item.reviews})</span>
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
          {item.name}
        </h3>
        <p
          className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-orange-500">
              ₦{item.price}
            </span>
            <span className="text-xs text-gray-400 ml-1">per serve</span>
          </div>
          <button
            className="btn-primary text-sm py-2 px-5"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item);
            }}
            title="Quick add to cart"
          >
            <i className="fas fa-plus text-xs"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ITEM DETAIL MODAL
// ─────────────────────────────────────────────────────────────

function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  onOrderNow,
  cartQty,
}) {
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setAdded(false);
      setImgError(false);
    }
  }, [isOpen, item]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    onAddToCart(item, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  const handleOrderNow = () => {
    onAddToCart(item, qty);
    onClose();
    onOrderNow();
  };

  const subtotal = (item.price * qty).toFixed(2);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: "560px" }}>
        {/* Image */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "28px 28px 0 0",
          }}
        >
          <img
            src={
              imgError
                ? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
                : item.image
            }
            alt={item.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "260px",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
            }}
          ></div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              fontSize: "0.95rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
          {/* Tag badge */}
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "rgba(255,255,255,0.95)",
              color: "#E85D26",
              fontWeight: 700,
              fontSize: "0.75rem",
              padding: "5px 13px",
              borderRadius: "50px",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              letterSpacing: "0.04em",
            }}
          >
            {item.tag}
          </span>
          {/* Item name on image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "1.2rem 1.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: '"Playfair Display",Georgia,serif',
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                margin: 0,
              }}
            >
              {item.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem 1.75rem 2rem" }}>
          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span className="feature-pill">
              <i className="fas fa-tag" style={{ fontSize: "0.7rem" }}></i>
              {item.category}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#FFFBF0",
                color: "#92680a",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: "50px",
                border: "1px solid #FDE68A",
              }}
            >
              <i
                className="fas fa-star"
                style={{ color: "#F59E0B", fontSize: "0.72rem" }}
              ></i>
              {item.rating}{" "}
              <span style={{ color: "#bbb", fontWeight: 400 }}>
                ({item.reviews} reviews)
              </span>
            </span>
            {cartQty > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#FEF0E9",
                  color: "#E85D26",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "50px",
                  border: "1px solid #FDDCCC",
                }}
              >
                <i
                  className="fas fa-shopping-cart"
                  style={{ fontSize: "0.7rem" }}
                ></i>
                {cartQty} already in cart
              </span>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.92rem",
              lineHeight: 1.65,
              marginBottom: "1.4rem",
            }}
          >
            {item.description}
          </p>

          {/* Price */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.4rem",
              marginBottom: "1.4rem",
            }}
          >
            <span
              style={{
                fontFamily: '"Playfair Display",Georgia,serif',
                fontSize: "2rem",
                fontWeight: 700,
                color: "#E85D26",
              }}
            >
              ₦{item.price}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              per serving
            </span>
          </div>

          {/* Qty Stepper */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              background: "#FFF8F4",
              borderRadius: "14px",
              border: "2px solid #F5EDE8",
              padding: "0.5rem 0.8rem",
              width: "fit-content",
              marginBottom: "1.5rem",
            }}
          >
            <button
              className="qty-btn"
              style={{ flexShrink: 0 }}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="qty-value" style={{ minWidth: "48px" }}>
              {qty}
            </span>
            <button
              className="qty-btn"
              style={{ flexShrink: 0 }}
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
            <span
              style={{
                marginLeft: "0.8rem",
                color: "#6b7280",
                fontSize: "0.88rem",
              }}
            >
              <strong
                style={{
                  color: "#E85D26",
                  fontFamily: '"Playfair Display",serif',
                }}
              >
                ₦{subtotal}
              </strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div
            style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}
          >
            <button
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.9rem",
                fontSize: "1rem",
              }}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? (
                <>
                  <i className="fas fa-check-circle"></i> Added to Cart!
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </>
              )}
            </button>
            <button
              onClick={handleOrderNow}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "50px",
                border: "2px solid #E85D26",
                background: "transparent",
                color: "#E85D26",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#E85D26";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#E85D26";
              }}
            >
              <i className="fas fa-fire"></i> Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MENU SECTION
// ─────────────────────────────────────────────────────────────

function MenuSection({ onItemClick, onQuickAdd, cart }) {
  const titleRef = useReveal();
  const [activeTab, setActiveTab] = useState("mains");

  const visibleItems = MENU_ITEMS.filter((i) => i.tab === activeTab);

  // Helper: get cart qty for an item
  const getCartQty = (id) => {
    const found = cart.find((c) => c.id === id);
    return found ? found.qty : 0;
  };

  return (
    <section id="menu" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div ref={titleRef} className="reveal text-center mb-12">
          <span className="section-label">Our Menu</span>
          <h2 className="section-title mt-3 mb-4">Crafted with Passion</h2>
          <div className="section-divider"></div>
          <p className="text-gray-500 mt-5 max-w-lg mx-auto leading-relaxed">
            Every dish is freshly made with quality ingredients in our kitchen.{" "}
            <strong className="text-orange-500">
              Browse, add to cart and checkout when ready.
            </strong>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {MENU_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`menu-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid — NOTE: no extra 'reveal' wrapper here; MenuCard handles its own reveal */}
        <div
          className={`grid gap-8 mx-auto ${
            visibleItems.length === 1
              ? "grid-cols-1 max-w-sm"
              : visibleItems.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
          }`}
        >
          {visibleItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              onQuickAdd={onQuickAdd}
              cartQty={getCartQty(item.id)}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm italic">
            More items coming soon…
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ORDER MODAL (Checkout with multi-item cart)
// ─────────────────────────────────────────────────────────────

const INITIAL_FORM = { name: "", phone: "", address: "", note: "" };

function OrderModal({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const [step, setStep] = useState("cart"); // 'cart' | 'details' | 'success'

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setForm({ ...INITIAL_FORM });
        setErrors({});
        setLoading(false);
        setSuccess(false);
        setOrderSummary(null);
        setStep("cart");
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(form.phone))
      e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Delivery address is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const summary = {
        ...form,
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        total: parseFloat(cartTotal.toFixed(2)),
        timestamp: new Date().toISOString(),
        status: "Pending",
      };
      await persistOrder(summary);
      onClearCart();
      if (onOrderPlaced) onOrderPlaced();
      setOrderSummary({ ...summary, id: `CAF-${Date.now()}` });
      setStep("success");
    } catch (e) {
      console.error("Order save error:", e);
      // Fallback success
      setOrderSummary({
        ...form,
        items: cart.map((i) => ({ ...i, qty: i.qty })),
        total: cartTotal,
        id: `CAF-${Date.now()}`,
        status: "Pending",
        timestamp: new Date().toISOString(),
      });
      setStep("success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-7 pt-7 pb-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-display text-2xl font-semibold text-gray-900">
              {step === "success"
                ? "🎉 Order Placed!"
                : step === "details"
                  ? "📦 Delivery Details"
                  : "🛒 Your Cart"}
            </h2>
            {step === "cart" && cart.length > 0 && (
              <p className="text-gray-400 text-sm mt-0.5">
                {cartCount} item{cartCount !== 1 ? "s" : ""} · ₦
                {cartTotal.toFixed(2)} total
              </p>
            )}
            {step === "details" && (
              <p className="text-gray-400 text-sm mt-0.5">
                Fill in where to deliver your order
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === "details" && (
              <button
                onClick={() => setStep("cart")}
                className="w-9 h-9 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-500 flex items-center justify-center transition-colors border-none cursor-pointer text-sm"
                title="Back to cart"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors border-none cursor-pointer text-base"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="px-7 py-6">
          {step === "success" ? (
            <SuccessScreen summary={orderSummary} onClose={onClose} />
          ) : step === "details" ? (
            <DeliveryForm
              form={form}
              errors={errors}
              loading={loading}
              cart={cart}
              cartTotal={cartTotal}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <CartView
              cart={cart}
              cartTotal={cartTotal}
              onUpdateQty={onUpdateQty}
              onRemoveItem={onRemoveItem}
              onProceed={() => setStep("details")}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cart View (step 1) ───
function CartView({
  cart,
  cartTotal,
  onUpdateQty,
  onRemoveItem,
  onProceed,
  onClose,
}) {
  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          style={{
            width: 72,
            height: 72,
            background: "#FEF0E9",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.2rem",
            fontSize: "2rem",
          }}
        >
          🛒
        </div>
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Browse the menu and add some delicious items!
        </p>
        <button
          className="btn-primary px-8 py-3 justify-center"
          onClick={() => {
            onClose();
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <i className="fas fa-book-open text-sm"></i> Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQty={onUpdateQty}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-orange-50 rounded-2xl p-4 mb-5 border border-orange-100">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-800">
            ₦{cartTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Delivery</span>
          <span className="text-green-600 font-semibold">Free 🎉</span>
        </div>
        <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-display font-bold text-orange-500 text-lg">
            ₦{cartTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        className="btn-primary w-full justify-center text-base py-3.5"
        onClick={onProceed}
      >
        <i className="fas fa-arrow-right text-sm"></i> Proceed to Delivery
        Details
      </button>
      <p className="text-center text-gray-400 text-xs mt-3">
        <i className="fas fa-lock text-orange-300 mr-1"></i>
        Your information is safe and secure
      </p>
    </div>
  );
}

function CartItem({ item, onUpdateQty, onRemove }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        background: "#FAFAFA",
        borderRadius: 16,
        padding: "0.85rem",
        border: "1px solid #F5EDE8",
      }}
    >
      <img
        src={
          imgErr
            ? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80"
            : item.image
        }
        alt={item.name}
        onError={() => setImgErr(true)}
        style={{
          width: 58,
          height: 58,
          borderRadius: 12,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 600,
            color: "#1a1a1a",
            fontSize: "0.9rem",
            marginBottom: "0.2rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </p>
        <p
          style={{
            color: "#E85D26",
            fontWeight: 700,
            fontFamily: '"Playfair Display",serif',
            fontSize: "0.95rem",
          }}
        >
          ₦{(item.price * item.qty).toFixed(2)}
          <span
            style={{
              color: "#9ca3af",
              fontWeight: 400,
              fontFamily: "Inter,sans-serif",
              fontSize: "0.78rem",
              marginLeft: "4px",
            }}
          >
            (₦{item.price} ea)
          </span>
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexShrink: 0,
        }}
      >
        <button
          className="qty-btn"
          style={{ width: 30, height: 30, fontSize: "0.9rem" }}
          onClick={() => onUpdateQty(item.id, item.qty - 1)}
        >
          −
        </button>
        <span
          style={{
            minWidth: 22,
            textAlign: "center",
            fontWeight: 700,
            color: "#1a1a1a",
            fontSize: "0.95rem",
          }}
        >
          {item.qty}
        </span>
        <button
          className="qty-btn"
          style={{ width: 30, height: 30, fontSize: "0.9rem" }}
          onClick={() => onUpdateQty(item.id, item.qty + 1)}
        >
          +
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#FEE2E2",
          border: "none",
          cursor: "pointer",
          color: "#ef4444",
          fontSize: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#FECACA")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#FEE2E2")}
        title="Remove item"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

// ─── Delivery Form (step 2) ───
function DeliveryForm({
  form,
  errors,
  loading,
  cart,
  cartTotal,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-5">
        <div>
          <label className="form-label">
            Full Name <span className="text-orange-400">*</span>
          </label>
          <input
            className={`form-input ${errors.name ? "border-red-400" : ""}`}
            type="text"
            name="name"
            value={form.name}
            placeholder="e.g. John Doe"
            onChange={onChange}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="form-label">
            Phone Number <span className="text-orange-400">*</span>
          </label>
          <input
            className={`form-input ${errors.phone ? "border-red-400" : ""}`}
            type="tel"
            name="phone"
            value={form.phone}
            placeholder="e.g. +1 (555) 000-0000"
            onChange={onChange}
          />
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="form-label">
            Delivery Address <span className="text-orange-400">*</span>
          </label>
          <textarea
            className={`form-input resize-none ${errors.address ? "border-red-400" : ""}`}
            name="address"
            value={form.address}
            placeholder="Enter your full delivery address…"
            rows={3}
            onChange={onChange}
          />
          {errors.address && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.address}
            </p>
          )}
        </div>

        <div>
          <label className="form-label">
            Special Notes{" "}
            <span className="text-gray-400 text-xs font-normal normal-case">
              (Optional)
            </span>
          </label>
          <textarea
            className="form-input resize-none"
            name="note"
            value={form.note}
            placeholder="Dietary requirements, allergies, special requests…"
            rows={2}
            onChange={onChange}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-orange-600 text-sm font-semibold mb-3">
            Order Summary
          </p>
          <div className="space-y-1.5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-gray-700"
              >
                <span className="truncate pr-2">
                  {item.name} <span className="text-gray-400">×{item.qty}</span>
                </span>
                <span className="font-semibold whitespace-nowrap">
                  ₦{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-orange-200 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-display font-bold text-orange-500 text-lg">
              ₦{cartTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-gray-400">Delivery</span>
            <span className="text-green-600 font-semibold">Free 🎉</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center text-base py-3.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="loader-ring"></span>
              <span>Processing Order…</span>
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Place Order — ₦
              {cartTotal.toFixed(2)}
            </>
          )}
        </button>

        <p className="text-center text-gray-400 text-xs mt-2">
          <i className="fas fa-lock text-orange-300 mr-1"></i>
          Your information is safe and secure
        </p>
      </div>
    </form>
  );
}

// ─── Success Screen ───
function SuccessScreen({ summary, onClose }) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="success-check">
          <i className="fas fa-check text-2xl"></i>
        </div>
        <h3 className="font-display text-xl font-semibold text-gray-900">
          Thank You, {summary.name.split(" ")[0]}!
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Your order has been received and is being prepared.
        </p>
        <p className="text-orange-400 text-xs mt-1 font-mono">
          Order ID: {summary.id}
        </p>
      </div>

      <div className="bg-orange-50 rounded-2xl p-4 mb-5">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-3">
          Order Details
        </p>
        <div className="space-y-1.5 text-sm text-gray-700">
          {summary.items &&
            summary.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.name} <span className="text-gray-400">×{item.qty}</span>
                </span>
                <span className="font-semibold">
                  ₦{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-display font-bold text-orange-500 text-base">
              ₦{summary.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Deliver to:</span>
            <span className="font-semibold text-right max-w-[55%]">
              {summary.address}
            </span>
          </div>
        </div>
      </div>

      <div className="border-2 border-orange-100 rounded-2xl p-5 mb-5 bg-orange-50/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <i className="fas fa-university text-orange-500 text-sm"></i>
          </div>
          <p className="font-semibold text-gray-800 text-sm">
            Payment Instructions
          </p>
        </div>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
          Please complete your payment via bank transfer to confirm your order.
          Your meal will be prepared once payment is verified.
        </p>
        <div className="space-y-0">
          {[
            ["Bank", BANK_DETAILS.bank],
            ["Account Name", BANK_DETAILS.name],
            ["Account Number", BANK_DETAILS.account],
            ["Routing Number", BANK_DETAILS.routing],
          ].map(([label, value]) => (
            <div key={label} className="bank-detail-row">
              <span className="bank-detail-label">{label}</span>
              <span className="bank-detail-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <i className="fas fa-info-circle mt-0.5 flex-shrink-0"></i>
          <span>
            Send proof of payment via WhatsApp after transfer. Orders confirmed
            within 15 minutes.
          </span>
        </div>
      </div>

      <a
        href="https://wa.me/+2349032687337?text=Hi!%20I%20just%20placed%20an%20order%20at%20ChopandFly%20Kitchen%20and%20want%20to%20send%20my%20payment%20proof."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300 hover:shadow-lg text-base mb-3"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Send Payment Proof via WhatsApp
      </a>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-medium hover:bg-gray-50 transition-colors bg-transparent cursor-pointer text-sm"
      >
        Done
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICES SECTION
// ─────────────────────────────────────────────────────────────

function ServicesSection() {
  const titleRef = useReveal();

  return (
    <section id="services" className="py-24 bg-gray-50 dot-pattern">
      <div className="max-w-6xl mx-auto px-5">
        <div ref={titleRef} className="reveal text-center mb-16">
          <span className="section-label">Beyond the Plate</span>
          <h2 className="section-title mt-3 mb-4">Other Services</h2>
          <div className="section-divider"></div>
          <p className="text-gray-500 mt-5 max-w-lg mx-auto leading-relaxed">
            We go beyond delivering food — we create experiences, memories, and
            moments that last a lifetime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} delay={i + 1} />
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-gray-400 mb-4">Interested in a custom service?</p>
          <a
            href="https://wa.me/+2349032687337?text=Hi!%20I'm%20interested%20in%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex"
          >
            <i className="fas fa-comment-dots"></i>
            Let's Talk
          </a>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} service-card`}>
      <div className="service-icon">
        <span role="img" aria-label={service.title}>
          {service.icon}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
        {service.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {service.description}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────────────────────

function ContactSection() {
  const titleRef = useReveal();
  const cardsRef = useReveal();

  return (
    <section id="contact" className="contact-section py-24">
      <div className="max-w-5xl mx-auto px-5 text-center">
        <div ref={titleRef} className="reveal mb-14">
          <span className="inline-block text-white/55 text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            Get in Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Make Your
            <br />
            <em style={{ color: "#F5904A" }}>Meal Memorable</em>
          </h2>
          <p className="text-white/65 text-lg max-w-md mx-auto leading-relaxed">
            Reach out anytime — we're here to make your dining experience
            extraordinary.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="reveal grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12"
        >
          <a
            href="https://wa.me/+2349032687337"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card flex flex-col items-center gap-3 no-underline"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">WhatsApp</p>
              <p className="text-white/55 text-xs mt-0.5">+234 903 268 7337</p>
            </div>
          </a>

          <a
            href="https://instagram.com/chopandfly"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card flex flex-col items-center gap-3 no-underline"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
              }}
            >
              <i className="fab fa-instagram text-white text-xl"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Instagram</p>
              <p className="text-white/55 text-xs mt-0.5">
                @chopandfly.kitchen
              </p>
            </div>
          </a>

          <a
            href="mailto:hello@chopandfly.com"
            className="contact-card flex flex-col items-center gap-3 no-underline"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <i className="fas fa-envelope text-white text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Email Us</p>
              <p className="text-white/55 text-xs mt-0.5">
                hello@chopandfly.com
              </p>
            </div>
          </a>
        </div>

        <div className="inline-block bg-white/10 border border-white/18 rounded-2xl px-8 py-5 backdrop-blur-sm">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
            Order Hours
          </p>
          <p className="text-white font-semibold">
            Mon – Fri: 10:00 AM – 9:00 PM
          </p>
          <p className="text-white/65 text-sm mt-0.5">
            Sat – Sun: 9:00 AM – 10:00 PM
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-950 py-12 px-5 text-center">
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <span className="text-xl">✂️</span>
        <span className="font-display text-xl font-bold text-white/90">
          ChopandFly
        </span>
        <span className="text-xs text-white/35 tracking-widest uppercase ml-1">
          Online Kitchen
        </span>
      </div>
      <p className="text-white/35 text-sm mb-6">Eat Bold. Fly Fast.</p>
      <div className="flex justify-center gap-4 mb-6">
        {[
          {
            icon: "fa-instagram",
            href: "https://instagram.com/chopandfly",
            label: "Instagram",
          },
          {
            icon: "fa-whatsapp",
            href: "https://wa.me/+2349032687337",
            label: "WhatsApp",
          },
          { icon: "fa-facebook", href: "#", label: "Facebook" },
        ].map(({ icon, href, label }) => (
          <a
            key={icon}
            href={href}
            aria-label={label}
            className="w-9 h-9 bg-white/8 hover:bg-orange-500 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
          >
            <i className={`fab ${icon}`}></i>
          </a>
        ))}
      </div>
      <p className="text-white/20 text-xs">
        © {new Date().getFullYear()} ChopandFly Online Kitchen. All rights
        reserved.
      </p>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// FLOATING WHATSAPP BUTTON
// ─────────────────────────────────────────────────────────────

function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/+2349032687337"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (pass === "admin1234") {
      onLogin();
    } else {
      setErr("Incorrect password. Please try again.");
      setPass("");
    }
  };

  return (
    <div className="admin-wrapper flex items-center justify-center min-h-screen">
      <div className="admin-login-box w-full mx-5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Admin Panel
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            ChopandFly Online Kitchen
          </p>
        </div>

        <form onSubmit={handle}>
          <div className="mb-5">
            <label className="form-label">Admin Password</label>
            <input
              className={`form-input ${err ? "border-red-400" : ""}`}
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setErr("");
              }}
              placeholder="Enter admin password…"
              autoFocus
            />
            {err && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>
                {err}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary w-full justify-center py-3"
          >
            <i className="fas fa-sign-in-alt"></i> Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Default password:{" "}
          <code className="bg-orange-50 px-2 py-0.5 rounded text-orange-500">
            admin1234
          </code>
        </p>

        <p className="text-center mt-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "";
            }}
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
          >
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}

function AdminDashboard({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");

  // 🔥 REALTIME FIREBASE LISTENER
  useEffect(() => {
    let unsubscribe;

    const initOrders = async () => {
      try {
        const initialOrders = await loadOrders();
        setOrders(initialOrders);
        setStatus("ready");

        if (isFirebaseReady()) {
          unsubscribe = window.listenOrders(
            (newOrders) => {
              setOrders(newOrders);
              setStatus("live");
            },
            () => {
              setStatus("fallback");
            },
          );
        }
      } catch (e) {
        setStatus("fallback");
      }
    };

    initOrders();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const refresh = async () => {
    const newOrders = await loadOrders();
    setOrders(newOrders);
  };

  const updateStatus = async (docId, newStatus) => {
    if (isFirebaseReady()) {
      await window.updateOrderStatus(docId, newStatus);
    } else {
      const updated = orders.map((o) =>
        o.id === docId ? { ...o, status: newStatus } : o,
      );
      await saveOrders(updated);
      setOrders(updated);
    }
  };

  const deleteOrder = async (docId) => {
    if (!confirm("Delete this order?")) return;
    if (isFirebaseReady()) {
      await window.deleteOrder(docId);
    } else {
      const updated = orders.filter((o) => o.id !== docId);
      await saveOrders(updated);
      setOrders(updated);
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear ALL orders? This cannot be undone.")) return;
    if (isFirebaseReady()) {
      // Firebase: delete all via listener or batch (simplified: refresh clears view)
      await refresh();
    } else {
      await saveOrders([]);
      setOrders([]);
    }
  };

  // Helper: get a display string for order items (handles both old & new format)
  const getItemsDisplay = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.map((i) => `${i.name} ×${i.qty}`).join(", ");
    }
    // Backwards compat: old single-item format
    return `${order.foodItem || "—"} ×${order.quantity || 1}`;
  };

  const getTotalQty = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((s, i) => s + i.qty, 0);
    }
    return order.quantity || 1;
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "All" || o.status === filter;
    const matchSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      getItemsDisplay(o).toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const confirmedCount = orders.filter((o) => o.status === "Confirmed").length;

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Header */}
      <div className="admin-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl">✂️</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">
              ChopandFly Admin
            </h1>
            <p className="text-white/55 text-xs">
              Online Kitchen · Order Management
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer"
        >
          <i className="fas fa-arrow-left text-xs"></i> Back to Site
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: "fa-receipt",
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: "fa-clock",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Confirmed",
              value: confirmedCount,
              icon: "fa-check-circle",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Revenue",
              value: `₦${totalRevenue.toFixed(2)}`,
              icon: "fa-naira-sign",
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
          ].map((s) => (
            <div key={s.label} className="admin-stat-card">
              <div
                className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <i className={`fas ${s.icon} ${s.color}`}></i>
              </div>
              <div className={`font-display text-2xl font-bold ${s.color}`}>
                {s.value}
              </div>
              <div className="text-gray-400 text-xs mt-1 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Confirmed", "Preparing", "Delivered"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    filter === s
                      ? "bg-orange-500 text-white border-transparent shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {s}
                </button>
              ),
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                className="form-input pl-9 py-2 text-sm w-full sm:w-52"
                placeholder="Search orders…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={refresh}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-500 transition-all"
              title="Refresh"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            {orders.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-400 text-sm cursor-pointer hover:bg-red-100 transition-all"
                title="Clear all"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-inbox text-orange-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 font-medium">
                {orders.length === 0
                  ? "No orders yet. Orders placed on the site will appear here."
                  : "No orders match your filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items Ordered</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-xs text-orange-400">
                          {order.id}
                        </span>
                      </td>
                      <td>
                        <div className="font-semibold text-gray-800">
                          {order.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {order.phone}
                        </div>
                      </td>
                      <td>
                        <span
                          className="font-medium text-gray-700 text-xs"
                          style={{
                            maxWidth: 180,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={getItemsDisplay(order)}
                        >
                          {getItemsDisplay(order)}
                        </span>
                      </td>
                      <td className="text-center font-bold text-orange-500">
                        {getTotalQty(order)}
                      </td>
                      <td>
                        <span className="font-display font-bold text-orange-500">
                          ₦{order.total}
                        </span>
                      </td>
                      <td>
                        <span className="text-gray-400 text-xs">
                          {order.address}
                        </span>
                      </td>
                      <td>
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {fmtDate(order.timestamp)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${(order.status || "pending").toLowerCase()}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <select
                            value={order.status || "Pending"}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white cursor-pointer focus:outline-none focus:border-orange-400"
                          >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Preparing</option>
                            <option>Delivered</option>
                          </select>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 text-xs cursor-pointer border-none transition-all"
                            title="Delete"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-xs mt-4 space-y-1">
          <div>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
          </div>
          <div>
            {status === "live" && (
              <span className="text-green-500 px-2 py-0.5 bg-green-50 rounded-full text-xs">
                🔥 LIVE (Firebase realtime)
              </span>
            )}
            {status === "ready" && (
              <span className="text-blue-500 px-2 py-0.5 bg-blue-50 rounded-full text-xs">
                ✅ Firebase ready
              </span>
            )}
            {status === "fallback" && (
              <span className="text-orange-500 px-2 py-0.5 bg-orange-50 rounded-full text-xs">
                💾 LocalStorage fallback
              </span>
            )}
            {status === "loading" && (
              <span className="text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full text-xs">
                ⏳ Loading...
              </span>
            )}
          </div>
          {status !== "live" && (
            <a
              href="#"
              className="underline hover:text-orange-500 text-xs"
              onClick={(e) => {
                e.preventDefault();
                refresh();
              }}
            >
              ↻ Refresh
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPage({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  return <AdminDashboard onBack={onBack} />;
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────

function App() {
  const getPageFromHash = () =>
    window.location.hash === "#admin" ? "admin" : "main";

  const [page, setPage] = useState(getPageFromHash);
  const [cart, setCart] = useState([]); // [{id,name,price,qty,image,category,tab}]
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null); // item shown in detail modal
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Hash routing
  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goBack = () => {
    window.location.hash = "";
    setPage("main");
  };

  // ── Cart helpers ──
  const addToCart = useCallback((item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + qty } : c,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty,
          image: item.image,
          category: item.category,
          tab: item.tab,
        },
      ];
    });
  }, []);

  const updateCartQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
    } else {
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Toast helper ──
  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  }, []);

  // ── Open order modal / cart ──
  const openOrderModal = useCallback(() => {
    setDetailItem(null);
    setModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => setModalOpen(false), []);

  // ── Item detail modal ──
  const openDetail = useCallback((item) => setDetailItem(item), []);
  const closeDetail = useCallback(() => setDetailItem(null), []);

  // Quick add from card button
  const handleQuickAdd = useCallback(
    (item) => {
      addToCart(item, 1);
      showToast(`${item.name} added to cart!`);
    },
    [addToCart, showToast],
  );

  // Add from detail modal
  const handleAddFromDetail = useCallback(
    (item, qty) => {
      addToCart(item, qty);
      showToast(`${item.name} ×${qty} added to cart!`);
    },
    [addToCart, showToast],
  );

  // Order Now from detail modal: add item then open checkout
  const handleOrderNowFromDetail = useCallback(() => {
    setDetailItem(null);
    setModalOpen(true);
  }, []);

  if (page === "admin") {
    return <AdminPage onBack={goBack} />;
  }

  return (
    <>
      <Navbar
        onOrderClick={openOrderModal}
        cartCount={cartCount}
        onCartClick={openOrderModal}
      />
      <Hero onOrderClick={openOrderModal} />
      <MenuSection
        onItemClick={openDetail}
        onQuickAdd={handleQuickAdd}
        cart={cart}
      />
      <ServicesSection />
      <ContactSection />
      <Footer />
      <WhatsAppFAB />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={detailItem}
        isOpen={!!detailItem}
        onClose={closeDetail}
        onAddToCart={handleAddFromDetail}
        onOrderNow={handleOrderNowFromDetail}
        cartQty={
          detailItem ? cart.find((c) => c.id === detailItem.id)?.qty || 0 : 0
        }
      />

      {/* Checkout / Cart Modal */}
      <OrderModal
        isOpen={modalOpen}
        onClose={closeOrderModal}
        cart={cart}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onOrderPlaced={() => {}}
      />

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

// ─── Mount ───
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
