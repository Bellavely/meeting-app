import { FC } from 'react';
import './ConfirmModal.css';

type  ConfirmModalProps =  {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="card confirm-modal">
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

