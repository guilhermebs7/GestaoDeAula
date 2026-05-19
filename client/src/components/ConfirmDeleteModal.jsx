import React from 'react';

export default function ConfirmDeleteModal({ plano, onConfirm, onCancel }) {
  if (!plano) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-body">
          <p>Esta ação não pode ser desfeita. O plano "<strong>{plano.titulo}</strong>" será permanentemente deletado.</p>
        </div>

        <div className="confirm-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-delete" onClick={() => onConfirm(plano)}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}