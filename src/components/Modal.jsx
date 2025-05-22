import React from "react";

export default function Modal({ isOpen, title, OnClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal show fade d-block " tabindex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={OnClose}>

                        </button>
                    </div>
                    <div className="modal-body">
                        {/*children : parameter bawaan react yg di gunakan utk mengambil isi tag compoenent pada parent  */}
                        {children}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={OnClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}