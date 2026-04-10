import React from "react";

export default function QRModal({
                                           showQrModal,
                                           qrImage,
                                           qrToken,
                                           qrExpiresAt,
                                           handleCloseQrModal,
                                       }) {
    if (!showQrModal || !qrImage) return null;
    return (
        <div className="booking-qr-modal" onClick={handleCloseQrModal}>
            <div className="booking-qr-modal__card" onClick={(e) => e.stopPropagation()}>
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
                        <div className="booking-qr-modal__token-label">Booking Code</div>
                        <div className="booking-qr-modal__token">{qrToken}</div>
                        <button
                            type="button"
                            className="booking-qr-modal__copy"
                            onClick={() => navigator.clipboard.writeText(qrToken)}
                        >
                            Copy code
                        </button>
                    </div>
                )}

                {qrExpiresAt && (
                    <div className="booking-qr-modal__expires">
                        Expires: {new Date(qrExpiresAt).toLocaleString("en-GB")}
                    </div>
                )}
            </div>
        </div>
    );
}