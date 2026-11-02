import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router";
import {
  ShoppingBag,
  Package,
  RotateCcw,
  Lock,
  MessageCircle,
  LoaderCircle,
  Image as ImageIcon,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { axiosRequest } from "../api/axiosRequest";
import Styles from "./home.module.css";

const SERVER_URL = "http://localhost:5001";
const FEATURED_COUNT = 8;

const categories = [
  "Clothing",
  "Footwear",
  "Accessories",
  "Electronics",
  "Watches",
  "Beauty",
  "Home",
];

const features = [
  {
    icon: Package,
    title: "Free shipping",
    text: "On select orders, delivered to your door.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "Changed your mind? Send it back with ease.",
  },
  {
    icon: Lock,
    title: "Secure payments",
    text: "Your checkout details stay protected.",
  },
  {
    icon: MessageCircle,
    title: "Friendly support",
    text: "Questions about an order? We are here to help.",
  },
];

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
};

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Header search: `searchInput` is what is typed, `searchKey` is what is applied
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKey, setSearchKey] = useState("");

  // The hero keeps showing the newest product, even while searching
  const [heroProduct, setHeroProduct] = useState(null);

  const { hash } = useLocation();

  // Links like "/#shop" (from the product page) scroll to that section
  useEffect(() => {
    if (!hash) return;

    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  // Load the latest products for the featured section
  useEffect(() => {
    const source = axios.CancelToken.source();

    // NOTE: if you have a public (non-admin) products endpoint, use it here.
    axiosRequest(
      "/admin/get-products",
      null,
      "GET",
      {},
      {
        params: {
          page: 1,
          pageSize: FEATURED_COUNT,
          searchKey,
          sort: "desc",
        },
        cancelToken: source.token,
      }
    )
      .then((res) => {
        const list = res?.data || [];

        setProducts(list);
        if (!searchKey) setHeroProduct(list[0] || null);
        setLoading(false);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load products"
        );
        setLoading(false);
      });

    return () => source.cancel();
  }, [searchKey]);

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // No newsletter API yet: connect it here when you add one.
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const value = searchInput.trim();

    if (value !== searchKey) {
      setLoading(true);
      setSearchKey(value);
    }

    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearSearch = () => {
    setSearchInput("");

    if (searchKey) {
      setLoading(true);
      setSearchKey("");
    }
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    handleClearSearch();
  };

  const handleCartClick = () => {
    // No cart yet: send the user to your cart page here once you add one.
    toast.info("Your cart is empty");
  };

  const featured = heroProduct;

  return (
    <div className={Styles.page}>
      <div className={Styles.announcement}>
        Free shipping on select orders · New arrivals every week
      </div>

      {/* Header */}
      <header className={Styles.header}>
        <div className={Styles.headerInner}>
          <Link to="/" className={Styles.logo}>
            <ShoppingBag size={26} />
            E-Commerce
          </Link>

          <nav className={Styles.nav} aria-label="Main">
            <a href="#shop" className={Styles.navLink}>Shop</a>
            <a href="#categories" className={Styles.navLink}>Categories</a>
            <a href="#new" className={Styles.navLink}>New arrivals</a>
            <a href="#offers" className={Styles.navLink}>Offers</a>
          </nav>

          <div className={Styles.authButtons}>
            <button
              type="button"
              className={Styles.iconButton}
              aria-label="Search products"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className={Styles.iconButton}
              aria-label="Cart"
              onClick={handleCartClick}
            >
              <ShoppingCart size={18} />
            </button>

            <Link to="/login" className={Styles.loginButton}>
              Log in
            </Link>
            <Link to="/signup" className={Styles.signupButton}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Search bar (opens from the header search icon) */}
      {searchOpen && (
        <div className={Styles.searchBar}>
          <form className={Styles.searchForm} onSubmit={handleSearchSubmit}>
            <Search size={18} />

            <input
              type="text"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              autoFocus
            />

            {searchInput && (
              <button
                type="button"
                className={Styles.searchClear}
                aria-label="Clear search"
                onClick={handleClearSearch}
              >
                <X size={16} />
              </button>
            )}

            <button type="submit" className={Styles.searchSubmit}>
              Search
            </button>
          </form>

          <button
            type="button"
            className={Styles.searchClose}
            onClick={handleCloseSearch}
          >
            Close
          </button>
        </div>
      )}

      {/* Hero */}
      <section className={Styles.hero}>
        <div className={Styles.heroText}>
          <span className={Styles.badge}>New season, new arrivals</span>

          <h1 className={Styles.heroTitle}>
            Everyday finds, <br />
            beautifully chosen.
          </h1>

          <p className={Styles.heroSub}>
            Discover clothing, footwear, accessories and more, carefully
            picked and delivered to your door.
          </p>

          <div className={Styles.heroActions}>
            <a href="#shop" className={Styles.primaryLink}>
              Shop now
            </a>
            <a href="#categories" className={Styles.secondaryLink}>
              Browse categories
            </a>
          </div>
        </div>

        <div className={Styles.heroVisual}>
          <div className={Styles.circleA} />
          <div className={Styles.circleB} />

          {featured?.product_image ? (
            <img
              className={Styles.heroImage}
              src={getImageUrl(featured.product_image)}
              alt={featured.product_name}
            />
          ) : (
            <div className={Styles.heroPlaceholder}>
              <ImageIcon size={40} />
            </div>
          )}

          {featured && (
            <Link
              to={`/product/${featured._id}`}
              className={Styles.heroCard}
            >
              <div className={Styles.heroCardInfo}>
                <span className={Styles.productCategory}>
                  {featured.category || "Uncategorized"}
                </span>
                <span className={Styles.heroCardName}>
                  {featured.product_name}
                </span>
              </div>

              <div className={Styles.heroCardRight}>
                <span className={Styles.heroCardPrice}>
                  {formatPrice(featured.price)}
                </span>
                <span
                  className={
                    Number(featured.stock_quantity) > 0
                      ? Styles.inStock
                      : Styles.outOfStock
                  }
                >
                  {Number(featured.stock_quantity) > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className={Styles.section}>
        <div className={Styles.sectionHead}>
          <div>
            <span className={Styles.eyebrow}>Browse</span>
            <h2 className={Styles.sectionTitle}>Shop by category</h2>
          </div>
        </div>

        <div className={Styles.categoryGrid}>
          {categories.map((name) => (
            <a key={name} href="#shop" className={Styles.categoryCard}>
              <span className={Styles.categoryName}>{name}</span>
              <span className={Styles.categoryCta}>Shop now →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section id="shop" className={Styles.section}>
        <div className={Styles.sectionHead}>
          <div>
            <span id="new" className={Styles.eyebrow}>
              Just in
            </span>
            <h2 className={Styles.sectionTitle}>Featured products</h2>
          </div>
        </div>

        {searchKey && (
          <p className={Styles.resultsText}>
            Showing results for “{searchKey}”
          </p>
        )}

        {loading ? (
          <div className={Styles.emptyState}>
            <LoaderCircle size={28} className={Styles.spinner} />
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={Styles.emptyState}>
            <Package size={40} />
            <h3>{searchKey ? "No products found" : "No products yet"}</h3>
            <p>
              {searchKey
                ? "Try a different search."
                : "Check back soon for new arrivals."}
            </p>
          </div>
        ) : (
          <div className={Styles.productGrid}>
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className={Styles.productCard}
              >
                <div className={Styles.productImageWrapper}>
                  {product.product_image ? (
                    <img
                      className={Styles.productImage}
                      src={getImageUrl(product.product_image)}
                      alt={product.product_name}
                      loading="lazy"
                    />
                  ) : (
                    <div className={Styles.productPlaceholder}>
                      <ImageIcon size={36} />
                    </div>
                  )}

                  <span
                    className={
                      Number(product.stock_quantity) > 0
                        ? Styles.inStock
                        : Styles.outOfStock
                    }
                  >
                    {Number(product.stock_quantity) > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </div>

                <div className={Styles.productBody}>
                  <span className={Styles.productCategory}>
                    {product.category || "Uncategorized"}
                  </span>
                  <h3 className={Styles.productName}>
                    {product.product_name}
                  </h3>

                  <div className={Styles.productFooter}>
                    <span className={Styles.price}>
                      {formatPrice(product.price)}
                    </span>
                    <span className={Styles.viewButton}>View details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Promo */}
      <section id="offers" className={Styles.section}>
        <div className={Styles.promo}>
          <div className={Styles.promoCircle} />

          <div className={Styles.promoText}>
            <span className={Styles.promoEyebrow}>Limited time</span>
            <h2 className={Styles.promoTitle}>The new season edit</h2>
            <p className={Styles.promoSub}>
              Fresh styles across clothing, footwear and home. Find something
              you will love.
            </p>
          </div>

          <a href="#shop" className={Styles.promoButton}>
            Explore the edit
          </a>
        </div>
      </section>

      {/* Features */}
      <section className={Styles.section}>
        <div className={Styles.featureGrid}>
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className={Styles.feature}>
              <span className={Styles.featureIcon}>
                <Icon size={22} />
              </span>
              <div className={Styles.featureText}>
                <span className={Styles.featureTitle}>{title}</span>
                <span className={Styles.featureSub}>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className={`${Styles.section} ${Styles.newsletterSection}`}>
        <div className={Styles.newsletter}>
          <div className={Styles.newsletterText}>
            <h2>New arrivals in your inbox</h2>
            <p>Be the first to see new products and offers.</p>
          </div>

          <form className={Styles.newsletterForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              aria-label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className={Styles.footer}>
        <div className={Styles.footerInner}>
          <div className={Styles.footerTop}>
            <div className={Styles.footerBrand}>
              <span className={Styles.footerLogo}>
                <ShoppingBag size={26} />
                E-Commerce
              </span>
              <p>
                Everyday finds, beautifully chosen and delivered to your door.
              </p>
            </div>

            <div className={Styles.footerColumns}>
              <div className={Styles.footerColumn}>
                <span>Shop</span>
                <a href="#shop">Clothing</a>
                <a href="#shop">Footwear</a>
                <a href="#shop">Accessories</a>
                <a href="#shop">Electronics</a>
              </div>
              <div className={Styles.footerColumn}>
                <span>Company</span>
                <a href="#">About us</a>
                <a href="#">Contact</a>
                <a href="#">Careers</a>
              </div>
              <div className={Styles.footerColumn}>
                <span>Support</span>
                <a href="#">Help centre</a>
                <a href="#">Shipping</a>
                <a href="#">Returns</a>
              </div>
            </div>
          </div>

          <div className={Styles.footerBottom}>
            © {new Date().getFullYear()} E-Commerce. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
