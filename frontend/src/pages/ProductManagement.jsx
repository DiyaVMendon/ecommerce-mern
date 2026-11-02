import { useEffect, useRef, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroller";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Package,
  LoaderCircle,
  Image as ImageIcon,
} from "lucide-react";

import { axiosRequest } from "../api/axiosRequest";
import Styles from "./productManagement.module.css";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5001";
const pageSize = 10;

const categoryOptions = [
  { value: "Clothing", label: "Clothing" },
  { value: "Footwear", label: "Footwear" },
  { value: "Accessories", label: "Accessories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Watches", label: "Watches" },
  { value: "Beauty", label: "Beauty" },
  { value: "Home", label: "Home" },
];

const initialForm = {
  product_name: "",
  product_description: "",
  category: "",
  price: "",
  stock_quantity: "",
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
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

const checkRequiredFields = (form) => {
  const requiredFields = {
    product_name: "Product Name",
    category: "Category",
    price: "Price",
    stock_quantity: "Stock Quantity",
  };

  for (const [key, label] of Object.entries(requiredFields)) {
    if (
      form[key] === undefined ||
      form[key] === null ||
      String(form[key]).trim() === ""
    ) {
      toast.error(`${label} is required`);
      return false;
    }
  }

  if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    toast.error("Enter a valid price");
    return false;
  }

  if (
    !Number.isInteger(Number(form.stock_quantity)) ||
    Number(form.stock_quantity) < 0
  ) {
    toast.error("Enter a valid stock quantity");
    return false;
  }

  return true;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  // Starts at 1 so the trigger effect below fetches page 1 on mount
  const [triggerProducts, setTriggerProducts] = useState(1);

  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoader, setModalLoader] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  // true when the user removed the already-saved image while editing
  const [removeImage, setRemoveImage] = useState(false);
  // full-size image preview (lightbox)
  const [lightboxImage, setLightboxImage] = useState("");

  const typingTimeout = useRef(null);
  const source = useRef(null);
  const fileInputRef = useRef(null);

  // API: Get all products
  const getAllProducts = () => {
    const params = {
      page: pageNo,
      pageSize,
      searchKey: searchValue,
      sort,
    };

    source.current?.cancel();
    source.current = axios.CancelToken.source();

    axiosRequest(
      "/admin/get-products",
      null,
      "GET",
      {},
      {
        params,
        cancelToken: source.current.token,
      }
    )
      .then((res) => {
        const newProducts = res?.data || [];
        const totalProducts = Number(res?.total || 0);

        setProducts((prev) => [...prev, ...newProducts]);
        setTotal(totalProducts);

        setPageNo((prev) => prev + 1);
        setHasMore(
          newProducts.length > 0 && pageNo * pageSize < totalProducts
        );
        setLoading(false);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;

        toast.error(getErrorMessage(error));
        setLoading(false);
        setHasMore(false);
      });
  };

  // useEffect
  // Same trigger-based pattern as AssetsInfoContainer
  useEffect(() => {
    if (triggerProducts) {
      getAllProducts();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerProducts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      source.current?.cancel();
      clearTimeout(typingTimeout.current);
    };
  }, []);

  // Reset list, search and pagination
  const resetSearchState = (extra = {}) => {
    source.current?.cancel();

    setSearchValue(extra.searchValue ?? searchValue);
    setSort(extra.sort ?? sort);
    setLoading(true);
    setHasMore(true);
    setPageNo(1);
    setTotal(0);
    setProducts([]);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTriggerProducts((prev) => prev + 1);
    }, 500);
  };

  // Same loadMore concept as AssetsInfoContainer
  const loadMore = () => {
    if (hasMore) {
      getAllProducts();
    }
  };

  const handleSearchChange = (event) => {
    resetSearchState({
      searchValue: event.target.value,
    });
  };

  const handleSortChange = (event) => {
    resetSearchState({
      sort: event.target.value,
    });
  };

  // API: Get product by ID
  const getProductById = (productId) => {
    setModalLoader(true);

    axiosRequest(
      `/admin/get-product/${productId}`,
      null,
      "GET"
    )
      .then((res) => {
        const product = res?.data;

        if (!product) {
          toast.error("Product not found");
          return;
        }

        setSelectedProduct(product);
        setForm({
          product_name: product.product_name || "",
          product_description: product.product_description || "",
          category: product.category || "",
          price: product.price ?? "",
          stock_quantity: product.stock_quantity ?? "",
        });

        setImageFile(null);
        setRemoveImage(false);
        setPreview(getImageUrl(product.product_image));
        setModalMode("edit");
        setShowProductModal(true);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        setModalLoader(false);
      });
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setForm({ ...initialForm });
    setImageFile(null);
    setRemoveImage(false);
    setPreview("");
    setModalMode("add");
    setShowProductModal(true);
  };

  const handleEditProduct = (productId) => {
    getProductById(productId);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be below 5MB");
      event.target.value = "";
      return;
    }

    // free the previous local preview before replacing it
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));

    // lets the same file be picked again after it was removed
    event.target.value = "";
  };

  // Remove the image from the form (new selection or the saved image)
  const handleRemoveImage = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // tell the server to delete the saved image when saving
    if (modalMode === "edit" && selectedProduct?.product_image) {
      setRemoveImage(true);
    }
  };

  // API: Add / Update product
  const handleSaveProduct = (event) => {
    event.preventDefault();

    if (!checkRequiredFields(form)) return;

    if (modalMode === "add" && !imageFile) {
      toast.error("Please select a product image");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const isEdit = modalMode === "edit";

    if (imageFile) {
      formData.append("product_image", imageFile);
    } else if (isEdit && removeImage) {
      formData.append("remove_image", "true");
    }

    const url = isEdit
      ? `/admin/update-product/${selectedProduct._id}`
      : "/admin/add-product";

    setSaving(true);

    axiosRequest(
      url,
      formData,
      isEdit ? "PATCH" : "POST"
    )
      .then((res) => {
        toast.success(
          res?.message ||
            (isEdit
              ? "Product updated successfully"
              : "Product added successfully")
        );

        setShowProductModal(false);
        setSelectedProduct(null);
        resetSearchState();
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // API: Delete product
  const handleConfirmDelete = () => {
    if (!selectedProduct?._id || saving) return;

    setSaving(true);

    axiosRequest(
      `/admin/delete-product/${selectedProduct._id}`,
      null,
      "DELETE"
    )
      .then((res) => {
        toast.success(
          res?.message || "Product deleted successfully"
        );

        setShowDeleteModal(false);
        setSelectedProduct(null);
        resetSearchState();
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // Product cards: all content inside InfiniteScroll
  const renderProducts = () => {
    return (
      <div className={Styles.productsGrid}>
        {products.map((product) => (
          <div
            className={Styles.productCard}
            key={product._id}
          >
            <div className={Styles.productImageWrapper}>
              {product.product_image ? (
                <img
                  className={`${Styles.productCardImage} ${Styles.clickableImage}`}
                  src={getImageUrl(product.product_image)}
                  alt={product.product_name}
                  title="Click to preview"
                  onClick={() =>
                    setLightboxImage(
                      getImageUrl(product.product_image)
                    )
                  }
                />
              ) : (
                <div className={Styles.productImagePlaceholder}>
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

            <div className={Styles.productCardBody}>
              <p className={Styles.productCategory}>
                {product.category || "Uncategorized"}
              </p>

              <h3>{product.product_name}</h3>

              <p className={Styles.productDescription}>
                {product.product_description ||
                  "No description available"}
              </p>

              <div className={Styles.productCardDetails}>
                <strong>{formatPrice(product.price)}</strong>
                <span>
                  Stock: {product.stock_quantity}
                </span>
              </div>

              <div className={Styles.productCardActions}>
                <button
                  type="button"
                  className={Styles.secondaryButton}
                  onClick={() =>
                    handleEditProduct(product._id)
                  }
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className={Styles.deleteActionButton}
                  onClick={() =>
                    handleDeleteProduct(product)
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Add / Edit modal
  const renderProductModal = () => {
    if (!showProductModal) return null;

    return (
      <div
        className={Styles.overlay}
        onClick={() => setShowProductModal(false)}
      >
        <div
          className={Styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={Styles.modalHeader}>
            <div>
              <h2>
                {modalMode === "edit"
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>
              <p>Enter product information</p>
            </div>

            <button
              type="button"
              className={Styles.closeButton}
              onClick={() => setShowProductModal(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveProduct}>
            <div className={Styles.modalBody}>
              <h3 className={Styles.sectionTitle}>
                Product Image
              </h3>

              <div
                className={Styles.uploadArea}
                onClick={() => {
                  // with an image shown, clicking it previews it;
                  // the picker opens only from the empty state or "Change"
                  if (!preview) fileInputRef.current?.click();
                }}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      title="Click to preview"
                      className={`${Styles.previewImage} ${Styles.clickableImage}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setLightboxImage(preview);
                      }}
                    />

                    <div className={Styles.imageActions}>
                      <button
                        type="button"
                        className={Styles.imageActionButton}
                        title="Change image"
                        aria-label="Change image"
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload size={16} />
                      </button>

                      <button
                        type="button"
                        className={`${Styles.imageActionButton} ${Styles.imageRemoveButton}`}
                        title="Remove image"
                        aria-label="Remove image"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveImage();
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload
                      size={30}
                      className={Styles.uploadIcon}
                    />
                    <p>Click to upload product image</p>
                    <small>
                      JPG, PNG or WEBP (Max 5MB)
                    </small>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <h3 className={Styles.sectionTitle}>
                Product Information
              </h3>

              <div className={Styles.field}>
                <label>Product Name *</label>
                <input
                  name="product_name"
                  value={form.product_name}
                  onChange={handleFormChange}
                  placeholder="Enter product name"
                />
              </div>

              <div className={Styles.field}>
                <label>Product Description</label>
                <textarea
                  name="product_description"
                  value={form.product_description}
                  onChange={handleFormChange}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className={Styles.field}>
                <label>Category *</label>

                <Select
                  options={categoryOptions}
                  value={
                    categoryOptions.find(
                      (item) =>
                        item.value === form.category
                    ) || null
                  }
                  onChange={(option) =>
                    setForm((prev) => ({
                      ...prev,
                      category: option?.value || "",
                    }))
                  }
                  placeholder="Select category"
                  isClearable
                />
              </div>

              <div className={Styles.formGrid}>
                <div className={Styles.field}>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleFormChange}
                  />
                </div>

                <div className={Styles.field}>
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            <div className={Styles.modalFooter}>
              <button
                type="button"
                className={Styles.secondaryButton}
                onClick={() =>
                  setShowProductModal(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={Styles.primaryButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : modalMode === "edit"
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete confirmation modal
  const renderDeleteModal = () => {
    if (!showDeleteModal || !selectedProduct) return null;

    return (
      <div
        className={Styles.overlay}
        onClick={() => setShowDeleteModal(false)}
      >
        <div
          className={`${Styles.modal} ${Styles.deleteModal}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={Styles.modalHeader}>
            <h2>Delete Product</h2>

            <button
              type="button"
              className={Styles.closeButton}
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={Styles.modalBody}>
            <h3>
              Delete {selectedProduct.product_name}?
            </h3>

            <p className={Styles.deleteDescription}>
              This action cannot be undone.
            </p>
          </div>

          <div className={Styles.deleteActions}>
            <button
              type="button"
              className={Styles.secondaryButton}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className={Styles.dangerButton}
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Full-size image preview
  const renderImageLightbox = () => {
    if (!lightboxImage) return null;

    return (
      <div
        className={Styles.lightboxOverlay}
        onClick={() => setLightboxImage("")}
      >
        <button
          type="button"
          className={Styles.lightboxClose}
          onClick={() => setLightboxImage("")}
          aria-label="Close preview"
        >
          <X size={24} />
        </button>

        <img
          src={lightboxImage}
          alt="Product preview"
          className={Styles.lightboxImage}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    );
  };

  return (
    <div className={Styles.page}>
      <div className={Styles.pageHeader}>
        <div>
          <h1>Product Management</h1>
          <p>Manage your products and inventory</p>
        </div>

        <button
          type="button"
          className={Styles.primaryButton}
          onClick={handleAddProduct}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className={Styles.tableCard}>
        <div className={Styles.tableHeader}>
          <div>
            <h2>All Products</h2>
            <p>
              {products.length} of {total} products loaded
            </p>
          </div>

          <div className={Styles.filters}>
            <div className={Styles.searchBox}>
              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={handleSearchChange}
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() =>
                    resetSearchState({
                      searchValue: "",
                    })
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              className={Styles.sortSelect}
              value={sort}
              onChange={handleSortChange}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className={Styles.productScrollContainer}>
          {loading && products.length === 0 ? (
            <div className={Styles.emptyState}>
              <LoaderCircle
                size={28}
                className={Styles.spinner}
              />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={Styles.emptyState}>
              <Package size={40} />
              <h3>No products found</h3>
            </div>
          ) : (
            <InfiniteScroll
              loadMore={loadMore}
              hasMore={hasMore}
              useWindow={false}
              initialLoad={false}
              loader={
                <div
                  className={Styles.emptyState}
                  key={0}
                >
                  <LoaderCircle
                    size={22}
                    className={Styles.spinner}
                  />
                </div>
              }
            >
              {renderProducts()}
            </InfiniteScroll>
          )}
        </div>
      </div>

      {renderProductModal()}
      {renderDeleteModal()}
      {renderImageLightbox()}

      {modalLoader && (
        <div className={Styles.overlay}>
          <LoaderCircle
            size={32}
            className={Styles.spinner}
          />
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
