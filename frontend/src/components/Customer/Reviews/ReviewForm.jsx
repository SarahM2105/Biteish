import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ReviewForm({ restaurantId, onReviewCreated, onReviewUpdated }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [existingReview, setExistingReview] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef(null);
    useEffect(() => {
        let ignore = false;
        async function loadMyReview() {
            try {
                setInitialLoading(true);
                setStatus("");
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/customer/restaurants/${restaurantId}/reviews/me`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => null);
                if (ignore) return;
                if (res.status === 404) {
                    setExistingReview(null);
                    setExistingImages([]);
                    setIsEditing(true);
                    return;
                }
                if (!res.ok) {
                    setStatus(data?.message || "Failed to load your review");
                    return;
                }
                setExistingReview(data);
                setRating(data.rating ?? 5);
                setComment(data.comment || "");
                setExistingImages(Array.isArray(data.images) ? data.images : []);
                setIsEditing(false);
            } catch (error) {
                console.error(error);
                if (!ignore) {
                    setStatus("Failed to load your review");
                }
            } finally {
                if (!ignore) {
                    setInitialLoading(false);
                }
            }
        }
        if (restaurantId) {
            loadMyReview();
        }
        return () => {
            ignore = true;
        };
    }, [restaurantId]);
    const imagePreviews = useMemo(() => {
        return images.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
    }, [images]);
    useEffect(() => {
        return () => {
            imagePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [imagePreviews]);
    function mergeFiles(newFiles) {
        setImages((prev) => {
            const merged = [...prev, ...newFiles].slice(0, 3);
            return merged;
        });
    }
    function handleFileChange(e) {
        const files = Array.from(e.target.files || []).filter((file) =>
            file.type?.startsWith("image/")
        );
        mergeFiles(files);
        e.target.value = "";
    }
    function removeSelectedImage(indexToRemove) {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    }
    function handleStartEdit() {
        setIsEditing(true);
        setStatus("");
    }
    function handleCancelEdit() {
        if (existingReview) {
            setRating(existingReview.rating ?? 5);
            setComment(existingReview.comment || "");
            setExistingImages(Array.isArray(existingReview.images) ? existingReview.images : []);
            setImages([]);
            setStatus("");
            setIsEditing(false);
        }
    }
    function handleDragOver(e) {
        e.preventDefault();
        setIsDragging(true);
    }
    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    }
    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files || []).filter((file) =>
            file.type?.startsWith("image/")
        );
        mergeFiles(files);
    }
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            setStatus("");
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("rating", String(rating));
            formData.append("comment", comment);
            images.forEach((file) => {
                formData.append("images", file);
            });
            const method = existingReview ? "PUT" : "POST";
            const res = await fetch(`/api/customer/restaurants/${restaurantId}/reviews`, {
                method,
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setStatus(data?.message || "Failed to submit review");
                return;
            }
            setStatus(existingReview ? "Review updated successfully" : "Review submitted successfully");
            setExistingReview(data.review);
            setExistingImages(Array.isArray(data.review?.images) ? data.review.images : []);
            setImages([]);
            setIsEditing(false);
            if (existingReview) {
                onReviewUpdated?.(data.review);
            } else {
                onReviewCreated?.(data.review);
            }
        } catch (error) {
            console.error(error);
            setStatus("Failed to submit review");
        } finally {
            setLoading(false);
        }
    }
    if (initialLoading) {
        return (
            <section className="restaurant-details-card">
                <p>Loading review form...</p>
            </section>
        );
    }
    if (existingReview && !isEditing) {
        return (
            <section className="restaurant-details-card">
                <div className="review-display">
                    <div className="review-display__header">
                        <div>
                            <h2>Your review</h2>
                            <p>
                                {existingReview.verifiedVisit ? "Verified diner" : "Customer review"}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="review-display__edit-button"
                            onClick={handleStartEdit}
                        >
                            Edit review
                        </button>
                    </div>
                    <div className="review-display__rating">
                        <span>⭐</span>
                        <strong>{existingReview.rating}</strong>
                    </div>

                    <p className="review-display__comment">
                        {existingReview.comment || "No written comment."}
                    </p>

                    {existingImages.length > 0 && (
                        <div className="review-display__image-grid">
                            {existingImages.map((image) => (
                                <img
                                    key={image.id}
                                    src={image.imageUrl}
                                    alt="Your review"
                                    className="review-display__image"
                                />
                            ))}
                        </div>
                    )}
                    {status && (
                        <p
                            className={`review-form__status ${
                                status.toLowerCase().includes("success") ? "is-success" : "is-error"
                            }`}
                        >
                            {status}
                        </p>
                    )}
                </div>
            </section>
        );
    }
    return (
        <section className="restaurant-details-card">
            <form className="review-form" onSubmit={handleSubmit}>
                <div className="review-form__header">
                    <div>
                        <h2>{existingReview ? "Edit your review" : "Leave a review"}</h2>
                        <p>
                            {existingReview
                                ? "Update your rating, comment, or images."
                                : "Share your experience with other diners."}
                        </p>
                    </div>
                    {existingReview?.verifiedVisit !== undefined && (
                        <span className="review-form__badge">
                            {existingReview.verifiedVisit ? "Verified diner" : "Customer review"}
                        </span>
                    )}
                </div>
                <div className="review-form__grid">
                    <div className="review-form__field review-form__field--compact">
                        <label htmlFor="review-rating">Rating</label>
                        <select
                            id="review-rating"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                        >
                            <option value={5}>5 - Excellent</option>
                            <option value={4}>4 - Good</option>
                            <option value={3}>3 - Okay</option>
                            <option value={2}>2 - Poor</option>
                            <option value={1}>1 - Bad</option>
                        </select>
                    </div>
                    <div className="review-form__field review-form__field--full">
                        <label htmlFor="review-comment">Comment</label>
                        <textarea
                            id="review-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review"
                            rows={5}
                        />
                    </div>
                </div>
                {existingImages.length > 0 && (
                    <div className="review-form__existing">
                        <p className="review-form__section-title">Current images</p>
                        <div className="review-form__image-grid">
                            {existingImages.map((image) => (
                                <img
                                    key={image.id}
                                    src={image.imageUrl}
                                    alt="Review"
                                    className="review-form__image"
                                />
                            ))}
                        </div>
                        <p className="review-form__hint">
                            Uploading new images will replace the current ones.
                        </p>
                    </div>
                )}
                <div className="review-form__field review-form__field--full">
                    <label>Upload images</label>
                    <div
                        className={`review-upload ${isDragging ? "is-dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <p className="review-upload__title">Drag and drop images here</p>
                        <p className="review-upload__hint">or choose files manually</p>
                        <button
                            type="button"
                            className="review-upload__button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose images
                        </button>
                        <input
                            ref={fileInputRef}
                            id="review-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            hidden
                        />
                    </div>
                    <p className="review-form__hint">Optional, up to 3 images.</p>
                    {imagePreviews.length > 0 && (
                        <div className="review-upload__preview-grid">
                            {imagePreviews.map((item, index) => (
                                <div key={`${item.file.name}-${index}`} className="review-upload__preview-card">
                                    <img
                                        src={item.previewUrl}
                                        alt={item.file.name}
                                        className="review-upload__preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="review-upload__remove"
                                        onClick={() => removeSelectedImage(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="review-form__footer">
                    <button type="submit" className="review-form__button" disabled={loading}>
                        {loading
                            ? existingReview
                                ? "Updating..."
                                : "Submitting..."
                            : existingReview
                                ? "Save changes"
                                : "Submit review"}
                    </button>
                    {existingReview && (
                        <button
                            type="button"
                            className="review-form__secondary-button"
                            onClick={handleCancelEdit}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    {status && (
                        <p
                            className={`review-form__status ${
                                status.toLowerCase().includes("success") ? "is-success" : "is-error"
                            }`}
                        >
                            {status}
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}