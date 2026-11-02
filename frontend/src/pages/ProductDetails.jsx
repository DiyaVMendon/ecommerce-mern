import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router";
import {
  ShoppingBag,
  Package,
  RotateCcw,
  Lock,
  LoaderCircle,
  Image as ImageIcon,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";

import { axiosRequest } from "../api/axiosRequest";
import Styles from "./productDetails.module.css";

const SERVER_URL = "http://localhost:5001";
const RELATED_COUNT = 4;

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const ProductDetailsContent = ({ id }) => {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Load the product, then products to suggest below it
  useEffect(() => {
    const source = axios.CancelToken.source();

    window.scrollTo({ top: 0 });

    axiosRequest(`/admin/get-product/${id}`, null, "GET", {}, {
      cancelToken: source.token,
    })
      .then((res) => {
        setProduct(res?.data || null);
        setLoading(false);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;

        toast.error(getErrorMessage(error));
        setLoading(false);
      });

    // NOTE: if you have a public (non-admin) products endpoint, use it here.
    axiosRequest(
      "/admin/get-products",
      null,
      "GET",
      {},
      {
        params: { page: 1, pageSize: 12, searchKey: "", sort: "desc" },
        cancelToken: source.token,
      }
    )
      .then((res) => setRelated(res?.data || []))
      .catch(() => {
        // suggestions are optional, ignore errors
      });

    return () => source.cancel();
  }, [id]);

  const stock = Number(product?.stock_quantity || 0);
  const inStock = stock > 0;

  // Same category first, then the rest; never the current product
  const suggestions = related
    .filter((item) => item._id !== id)
    .sort(
      (a, b) =>
        Number(b.category === product?.category) -
        Number(a.category === product?.category)
    )
    .slice(0, RELATED_COUNT);

  const decreaseQuantity = () =>
    setQuantity((prev) => Math.max(1, prev - 1));

  const increaseQuantity = () =>
    setQuantity((prev) => Math.min(stock || 1, prev + 1));

  // No cart API yet: connect these two when you add one.
  const handleAddToCart = () => {
    toast.success(`${quantity} × ${product.product_name} added to cart`);
  };

  const handleBuyNow = () => {
    toast.info("Checkout is coming soon");
  };

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
            <Link to="/" className={Styles.navLink}>Home</Link>
            <Link to="/#shop" className={Styles.navLink}>Shop</Link>
          </nav>

          <div className={Styles.authButtons}>
            <Link to="/login" className={Styles.loginButton}>
              Log in
            </Link>
            <Link to="/signup" className={Styles.signupButton}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={Styles.emptyState}>
          <LoaderCircle size={28} className={Styles.spinner} />
          <p>Loading product...</p>
        </div>
      ) : !product ? (
        <div className={Styles.emptyState}>
          <Package size={40} />
          <h3>Product not found</h3>
          <p>This product may have been removed.</p>
          <Link to="/" className={Styles.primaryLink}>
            Back to shop
          </Link>
        </div>
      ) : (
        <>
          {/* Breadcrumb */}
          <nav className={Styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{product.category || "Uncategorized"}</span>
            <span aria-hidden="true">/</span>
            <span className={Styles.breadcrumbCurrent}>
              {product.product_name}
            </span>
          </nav>

          {/* Product */}
          <section className={Styles.product}>
            <div className={Styles.gallery}>
              <div className={Styles.imageWrapper}>
                {product.product_image ? (
                  <img
                    className={Styles.image}
                    src={getImageUrl(product.product_image)}
                    alt={product.product_name}
                  />
                ) : (
                  <div className={Styles.imagePlaceholder}>
                    <ImageIcon size={56} />
                  </div>
                )}

                <span className={inStock ? Styles.inStock : Styles.outOfStock}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className={Styles.info}>
              <div className={Styles.titleBlock}>
                <span className={Styles.category}>
                  {product.category || "Uncategorized"}
                </span>
                <h1 className={Styles.title}>{product.product_name}</h1>
              </div>

              <div className={Styles.priceRow}>
                <span className={Styles.price}>
                  {formatPrice(product.price)}
                </span>
                <span className={inStock ? Styles.inStockPill : Styles.outOfStockPill}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
                {inStock && (
                  <span className={Styles.stockText}>{stock} available</span>
                )}
              </div>

              <p className={Styles.description}>
                {product.product_description || "No description available"}
              </p>

              <div className={Styles.divider} />

              <div className={Styles.quantityBlock}>
                <span className={Styles.quantityLabel}>Quantity</span>

                <div className={Styles.stepper}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={decreaseQuantity}
                    disabled={!inStock || quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>

                  <span className={Styles.quantityValue}>{quantity}</span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={increaseQuantity}
                    disabled={!inStock || quantity >= stock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className={Styles.actions}>
                <button
                  type="button"
                  className={Styles.addButton}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  Add to cart
                </button>

                <button
                  type="button"
                  className={Styles.buyButton}
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  Buy now
                </button>
              </div>

              <div className={Styles.assurances}>
                <div>
                  <Package size={20} />
                  Free shipping on select orders
                </div>
                <div>
                  <RotateCcw size={20} />
                  Easy returns
                </div>
                <div>
                  <Lock size={20} />
                  Secure checkout
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className={Styles.section}>
            <div className={Styles.detailsCard}>
              <div className={Styles.detailsColumn}>
                <h2>Description</h2>
                <p>
                  {product.product_description ||
                    "No description available"}
                </p>
              </div>

              <div className={Styles.detailsColumn}>
                <h2>Product details</h2>

                <div className={Styles.detailRow}>
                  <span>Category</span>
                  <strong>{product.category || "Uncategorized"}</strong>
                </div>
                <div className={Styles.detailRow}>
                  <span>Availability</span>
                  <strong className={inStock ? Styles.green : Styles.red}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </strong>
                </div>
                <div className={Styles.detailRow}>
                  <span>Units available</span>
                  <strong>{stock}</strong>
                </div>
                <div className={Styles.detailRow}>
                  <span>Price</span>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Related products */}
          {suggestions.length > 0 && (
            <section className={`${Styles.section} ${Styles.relatedSection}`}>
              <div className={Styles.sectionHead}>
                <div>
                  <span className={Styles.eyebrow}>More to explore</span>
                  <h2 className={Styles.sectionTitle}>You may also like</h2>
                </div>

                <Link to="/#shop" className={Styles.viewAll}>
                  View all products →
                </Link>
              </div>

              <div className={Styles.relatedGrid}>
                {suggestions.map((item) => {
                  const itemInStock = Number(item.stock_quantity) > 0;

                  return (
                    <Link
                      key={item._id}
                      to={`/product/${item._id}`}
                      className={Styles.relatedCard}
                    >
                      <div className={Styles.relatedImageWrapper}>
                        {item.product_image ? (
                          <img
                            className={Styles.relatedImage}
                            src={getImageUrl(item.product_image)}
                            alt={item.product_name}
                            loading="lazy"
                          />
                        ) : (
                          <div className={Styles.imagePlaceholder}>
                            <ImageIcon size={36} />
                          </div>
                        )}

                        <span
                          className={
                            itemInStock ? Styles.inStock : Styles.outOfStock
                          }
                        >
                          {itemInStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className={Styles.relatedBody}>
                        <span className={Styles.category}>
                          {item.category || "Uncategorized"}
                        </span>
                        <span className={Styles.relatedName}>
                          {item.product_name}
                        </span>
                        <span className={Styles.relatedPrice}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

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
                <Link to="/#shop">Clothing</Link>
                <Link to="/#shop">Footwear</Link>
                <Link to="/#shop">Accessories</Link>
                <Link to="/#shop">Electronics</Link>
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

// `key` resets quantity and loading whenever the product id changes
const ProductDetails = () => {
  const { id } = useParams();

  return <ProductDetailsContent key={id} id={id} />;
};

export default ProductDetails;
