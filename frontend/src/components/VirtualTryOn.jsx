import React, { useState, useRef, useContext, useCallback } from "react";
import { ShopContext } from "../context/Context";
import { toast } from "react-toastify";
import axios from "axios";

const VirtualTryOn = ({ product }) => {
  const { token, backendUrl, navigate } = useContext(ShopContext);

  const [isOpen, setIsOpen] = useState(false);
  const [personImage, setPersonImage] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [clothType, setClothType] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fileInputRef = useRef(null);

  const garmentImage = product?.image?.[0] || "";

  // ── Open / close ──────────────────────────────────────────────────────────
  const openModal = () => {
    if (!token) {
      toast.info("Please login to use Virtual Try-On", { autoClose: 3000 });
      navigate("/login");
      return;
    }
    setIsOpen(true);
    setResultImage(null);
    setPersonImage(null);
    setPersonPreview(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setResultImage(null);
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB.");
      return;
    }
    setPersonImage(file);
    setPersonPreview(URL.createObjectURL(file));
    setResultImage(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  // ── Generate try-on ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!personImage) {
      toast.warning("Please upload your photo first.");
      return;
    }

    setIsLoading(true);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("personImage", personImage);
      formData.append("garmentImageUrl", garmentImage);
      formData.append("category", product.category || "");
      formData.append("subCategory", product.subCategory || "");

      const response = await axios.post(`${backendUrl}/api/tryon`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
        // HuggingFace free tier có thể mất 1-5 phút, tăng timeout lên 5 phút
        timeout: 300000,
      });

      if (response.data.success) {
        setResultImage(response.data.resultImageUrl);
        setClothType(response.data.clothType);
        toast.success("Try-on generated!");
      } else {
        toast.error(response.data.message || "Generation failed. Try again.");
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        toast.error(
          "Request timed out. Please try again with a simpler image.",
        );
      } else {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Download result ───────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      // Tải hình ảnh dưới dạng Blob để vượt qua giới hạn Cross-Origin và ép buộc trình duyệt tải về máy thay vì mở tab mới
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      // Kolors xuất ra ảnh định dạng webp
      link.download = `tryon-${product.name?.replace(/\s+/g, "-") || "result"}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("[TryOn] Download error:", error);
      // Fallback: Mở ảnh trong tab mới
      window.open(resultImage, "_blank");
    }
  };

  // Kolors Virtual Try-On cloth type values: upper_body | lower_body | dresses
  const clothTypeLabel = {
    upper_body: "Topwear / Winterwear → Upper body",
    lower_body: "Bottomwear → Lower body",
    dresses: "Dresses → Full body",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Try-On Button ───────────────────────────────────────────────── */}
      <button
        id="btn-virtual-tryon"
        onClick={openModal}
        style={styles.tryOnBtn}
        onMouseEnter={(e) =>
          Object.assign(e.currentTarget.style, styles.tryOnBtnHover)
        }
        onMouseLeave={(e) =>
          Object.assign(e.currentTarget.style, styles.tryOnBtn)
        }
      >
        <span style={styles.btnIcon}>✨</span>
        Virtual Try-On
      </button>

      {/* ── Modal Overlay ───────────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={styles.modal}>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <h2 style={styles.headerTitle}>✨ Virtual Try-On</h2>
                <p style={styles.headerSub}>{product.name}</p>
              </div>
              <button
                style={styles.closeBtn}
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Cloth type badge */}
            {product.subCategory &&
              (() => {
                const ICONS = {
                  Topwear: "👕",
                  Bottomwear: "👖",
                  Winterwear: "🧥",
                  Dresses: "👗",
                };
                const icon = ICONS[product.subCategory] ?? "👗";
                return (
                  <div style={styles.badgeRow}>
                    <span style={styles.badge}>
                      {icon} {product.subCategory}
                      <span style={styles.badgeSep}>·</span>
                      🤖 AI mode:{" "}
                      <strong>
                        {detectClothTypeClient(product.subCategory)}
                      </strong>
                    </span>
                  </div>
                );
              })()}

            {/* Main content area */}
            <div style={styles.content}>
              {/* ── Left: Upload zone ─────────────────────────── */}
              <div style={styles.column}>
                <p style={styles.colLabel}>📸 Your Photo</p>

                {/* Drop zone */}
                <div
                  style={{
                    ...styles.dropzone,
                    ...(isDragging ? styles.dropzoneDrag : {}),
                    ...(personPreview ? styles.dropzoneWithImage : {}),
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    !personPreview && fileInputRef.current?.click()
                  }
                >
                  {personPreview ? (
                    <img
                      src={personPreview}
                      alt="Your photo"
                      style={{ ...styles.previewImg, cursor: "zoom-in" }}
                      onClick={() => setLightboxImage(personPreview)}
                      title="Click to view fullscreen"
                    />
                  ) : (
                    <div style={styles.dropzoneInner}>
                      <div style={styles.uploadIcon}>📤</div>
                      <p style={styles.dropText}>Drop your photo here</p>
                      <p style={styles.dropSubText}>or click to browse</p>
                      <p style={styles.dropHint}>JPG, PNG · Max 10MB</p>
                    </div>
                  )}
                </div>

                {personPreview && (
                  <button
                    style={styles.changePhotoBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {/* Tips */}
                <div style={styles.tipsBox}>
                  <p style={styles.tipsTitle}>📝 Tips for best results:</p>
                  <ul style={styles.tipsList}>
                    <li>Stand straight, facing the camera</li>
                    <li>Good lighting, plain background</li>
                    <li>Full body or upper body visible</li>
                    <li>Wear fitted/minimal clothing</li>
                  </ul>
                </div>
              </div>

              {/* ── Center: Arrow / Generate ───────────────────── */}
              <div style={styles.centerCol}>
                <div style={styles.arrowBox}>
                  <span style={styles.arrowIcon}>→</span>
                </div>
                <button
                  id="btn-generate-tryon"
                  onClick={handleGenerate}
                  disabled={!personImage || isLoading}
                  style={{
                    ...styles.generateBtn,
                    ...(!personImage || isLoading
                      ? styles.generateBtnDisabled
                      : {}),
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={styles.spinner}></span>
                      Processing...
                    </>
                  ) : (
                    "⚡ Generate"
                  )}
                </button>
                {isLoading && <p style={styles.loadingHint}>~2–5 minutes</p>}
              </div>

              {/* ── Right: Garment & Result ───────────────────── */}
              <div style={styles.column}>
                {!resultImage ? (
                  <>
                    <p style={styles.colLabel}>👗 Product</p>
                    <div style={styles.garmentBox}>
                      <img
                        src={garmentImage}
                        alt={product.name}
                        style={{ ...styles.garmentImg, cursor: "zoom-in" }}
                        onClick={() => setLightboxImage(garmentImage)}
                        title="Click to view fullscreen"
                      />
                    </div>
                    {isLoading && (
                      <div style={styles.resultPlaceholder}>
                        <div style={styles.loadingAnimation}>
                          <div style={styles.pulseRing}></div>
                          <span style={styles.loadingText}>
                            AI is generating
                            <br />
                            your try-on...
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p style={styles.colLabel}>🌟 Your Try-On Result</p>
                    <div
                      style={styles.resultBox}
                      onClick={() => setLightboxImage(resultImage)}
                      title="Click to view fullscreen"
                    >
                      <img
                        src={resultImage}
                        alt="Try-on result"
                        style={{ ...styles.resultImg, cursor: "zoom-in" }}
                      />
                      <div
                        style={styles.resultOverlay}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          style={styles.downloadBtn}
                          onClick={handleDownload}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          style={styles.retryBtn}
                          onClick={() => {
                            setResultImage(null);
                            setPersonImage(null);
                            setPersonPreview(null);
                          }}
                        >
                          🔄 Try Again
                        </button>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        textAlign: "center",
                        margin: "4px 0 0",
                        cursor: "pointer",
                      }}
                      onClick={() => setLightboxImage(resultImage)}
                    >
                      🔍 Click image to view fullscreen
                    </p>
                    {clothType && (
                      <p style={{ ...styles.clothTypeBadge, marginTop: "6px" }}>
                        Cloth type used:{" "}
                        <strong>{clothTypeLabel[clothType]}</strong>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                🔒 Your photos are processed securely and not stored
                permanently. Powered by <strong>Kolors Virtual Try-On</strong>{" "}
                AI via <strong>HuggingFace</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox Overlay ────────────────────────────────────────────── */}
      {lightboxImage && (
        <div
          style={styles.lightboxOverlay}
          onClick={() => setLightboxImage(null)}
        >
          <button
            style={styles.lightboxCloseBtn}
            onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen preview"
            style={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Spinner keyframe (injected once) ────────────────────────────── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes tryon-fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        #btn-virtual-tryon { transition: all 0.25s ease !important; }
      `}</style>
    </>
  );
};

// ── Client-side cloth type detection (mirrors backend logic exactly) ─────────
// subCategory values in this store: Topwear | Bottomwear | Winterwear | Dresses
// Returns Kolors format: upper_body | lower_body | dresses
function detectClothTypeClient(subCategory = "") {
  const sub = subCategory.trim().toLowerCase();
  if (sub === "bottomwear") return "lower_body";
  if (sub === "dresses") return "dresses";
  // Topwear + Winterwear → upper_body; default fallback
  return "upper_body";
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  // Button
  tryOnBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.25s ease",
  },
  tryOnBtnHover: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #5a6fd6 0%, #6a3d96 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.55)",
    transform: "translateY(-2px)",
    transition: "all 0.25s ease",
  },
  btnIcon: { fontSize: "16px" },

  // Overlay & Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "960px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
    animation: "tryon-fadeIn 0.3s ease",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 28px 16px",
    borderBottom: "1px solid #f0f0f0",
    background: "linear-gradient(135deg, #667eea08 0%, #764ba208 100%)",
    borderRadius: "20px 20px 0 0",
  },
  headerTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  headerSub: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#888",
    fontWeight: "400",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#999",
    padding: "0 4px",
    lineHeight: 1,
    transition: "color 0.2s",
  },

  // Badge
  badgeRow: {
    padding: "10px 28px 0",
  },
  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #667eea18, #764ba218)",
    border: "1px solid #667eea44",
    borderRadius: "20px",
    padding: "4px 14px",
    fontSize: "12px",
    color: "#5a6fd6",
    fontWeight: "500",
  },

  // Content layout
  content: {
    display: "flex",
    gap: "20px",
    padding: "24px 28px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  column: {
    flex: "1 1 250px",
    minWidth: "220px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "60px 0",
    flex: "0 0 auto",
  },
  colLabel: {
    margin: 0,
    fontWeight: "600",
    fontSize: "14px",
    color: "#444",
    letterSpacing: "0.3px",
  },

  // Drop zone
  dropzone: {
    border: "2px dashed #d0d5e8",
    borderRadius: "12px",
    background: "#fafbff",
    minHeight: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.25s ease",
    overflow: "hidden",
    position: "relative",
  },
  dropzoneDrag: {
    border: "2px dashed #667eea",
    background: "#667eea0a",
    transform: "scale(1.01)",
  },
  dropzoneWithImage: {
    border: "2px solid #667eea44",
    cursor: "default",
    minHeight: "240px",
  },
  dropzoneInner: {
    textAlign: "center",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  uploadIcon: { fontSize: "36px", marginBottom: "4px" },
  dropText: { margin: 0, fontWeight: "600", color: "#555", fontSize: "14px" },
  dropSubText: { margin: 0, color: "#888", fontSize: "13px" },
  dropHint: { margin: 0, color: "#bbb", fontSize: "11px" },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    minHeight: "240px",
    maxHeight: "340px",
  },

  changePhotoBtn: {
    background: "none",
    border: "1px solid #d0d5e8",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "12px",
    color: "#667eea",
    cursor: "pointer",
    fontWeight: "500",
    alignSelf: "flex-start",
  },

  // Tips
  tipsBox: {
    background: "#f8f9ff",
    borderRadius: "10px",
    padding: "12px 14px",
    border: "1px solid #e8eaf6",
  },
  tipsTitle: {
    margin: "0 0 6px",
    fontWeight: "600",
    fontSize: "12px",
    color: "#667eea",
  },
  tipsList: { margin: 0, paddingLeft: "16px", listStyle: "disc" },

  // Arrow & generate
  arrowBox: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102,126,234,0.35)",
  },
  arrowIcon: { color: "#fff", fontSize: "20px", fontWeight: "bold" },

  generateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 22px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
    transition: "opacity 0.2s",
    whiteSpace: "nowrap",
  },
  generateBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingHint: {
    fontSize: "11px",
    color: "#999",
    margin: 0,
    textAlign: "center",
  },

  // Garment
  garmentBox: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #eee",
    background: "#fafafa",
    minHeight: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  garmentImg: {
    width: "100%",
    objectFit: "cover",
    maxHeight: "300px",
    display: "block",
  },

  // Loading placeholder
  resultPlaceholder: {
    marginTop: "12px",
    borderRadius: "12px",
    border: "2px dashed #667eea44",
    background: "#fafbff",
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingAnimation: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  pulseRing: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    animation: "pulse 1.4s ease-in-out infinite",
  },
  loadingText: {
    fontSize: "12px",
    color: "#888",
    textAlign: "center",
    lineHeight: 1.5,
  },

  // Result
  resultBox: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid #667eea44",
    position: "relative",
    boxShadow: "0 8px 24px rgba(102,126,234,0.18)",
    minHeight: "300px",
    background: "#fafbff",
  },
  resultImg: {
    width: "100%",
    objectFit: "cover",
    maxHeight: "360px",
    display: "block",
  },
  resultOverlay: {
    position: "absolute",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
  },
  downloadBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap",
  },
  retryBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.92)",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    whiteSpace: "nowrap",
  },
  clothTypeBadge: {
    fontSize: "12px",
    color: "#888",
    textAlign: "center",
    margin: 0,
  },

  // Footer
  footer: {
    padding: "14px 28px",
    borderTop: "1px solid #f0f0f0",
    background: "#fafbff",
    borderRadius: "0 0 20px 20px",
  },
  footerText: {
    margin: 0,
    fontSize: "11px",
    color: "#aaa",
    textAlign: "center",
    lineHeight: 1.5,
  },

  // Lightbox
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    animation: "tryon-fadeIn 0.25s ease",
  },
  lightboxImg: {
    maxWidth: "95vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    cursor: "zoom-out",
  },
  lightboxCloseBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export default VirtualTryOn;
