import React, { useState } from "react";

export default function QRModal({
                                    showQrModal,
                                    qrImage,
                                    qrToken,
                                    qrExpiresAt,
                                    handleCloseQrModal,
                                }) {
    const [copied, setCopied] = useState(false);

    if (!showQrModal || !qrImage) return null;

    function handleCopy() {
        if (!qrToken) return;

        navigator.clipboard.writeText(qrToken);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div className="booking-qr-modal" onClick={handleCloseQrModal}>
            <div
                className="booking-qr-modal__card"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="booking-qr-modal__close"
                    onClick={handleCloseQrModal}
                >
                    Close
                </button>

                <h3 className="booking-qr-modal__title">Your QR Code</h3>

                <div className="booking-qr-modal__image-wrap">
                    <img
                        src={qrImage}
                        alt="Reservation QR Code"
                        className="booking-qr-modal__image"
                    />
                </div>

                {qrToken && (
                    <div className="booking-qr-modal__token-section">
                        <div className="booking-qr-modal__token-label">
                            Booking Code
                        </div>

                        <div className="booking-qr-modal__token">
                            {qrToken}
                        </div>

                        <button
                            type="button"
                            className="booking-qr-modal__copy"
                            onClick={handleCopy}
                        >
                            {copied ? "Copied!" : "Copy code"}
                        </button>
                    </div>
                )}

                {qrExpiresAt && (
                    <div className="booking-qr-modal__expires">
                        Expires:{" "}
                        {new Date(qrExpiresAt).toLocaleString("en-GB")}
                    </div>
                )}
            </div>
        </div>
    );
}