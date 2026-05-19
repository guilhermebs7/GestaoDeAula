import React from 'react';
import { FiEdit3 } from 'react-icons/fi';
import { FiTrash } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";

function formatarData(data) {
  if (!data) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(data));
}

export default function PlanoCards({ planos = [], onVisualizar, onEditar, onExcluir }) {
  if (!planos.length) {
    return (
      <div className="cards-empty">
        Nenhum plano encontrado
      </div>
    );
  }

  return (
    <div className="planos-grid">
      {planos.map((plano) => (
        <article key={plano.id} className="plano-card">
          <div className="plano-card-header">
            <h3 className="plano-card-title">{plano.titulo}</h3>
            <span className={`plano-status ${plano.status === 'Publicado' ? 'status-publicado' : 'status-rascunho'}`}>
              {plano.status || 'Rascunho'}
            </span>
          </div>

          <p className="plano-card-summary">
            {plano.resumo || 'Sem resumo disponível.'}
          </p>

          <div className="plano-card-meta">
            <span><IoBookOutline /> {plano.disciplina || 'Sem disciplina'}</span>
            <span><FiCalendar /> {formatarData(plano.dataPrevista)}</span>
          </div>

          <div className="plano-tags">
            {(plano.tags || []).map((tag) => (
              <span key={tag} className="plano-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="plano-card-footer">
            <div className="plano-card-footer-spacer" />
            <button
              type="button"
              className="card-action card-action-view"
              onClick={() => onVisualizar?.(plano)}
            >
              <span className="card-action-icon">👁</span>
              Visualizar
            </button>
            <div className="plano-card-footer-actions">
              <button type="button" className="card-action" onClick={() => onEditar?.(plano)}>
                <FiEdit3 />
              </button>
              <button type="button" className="card-action" onClick={() => onExcluir?.(plano)}>
                <FiTrash />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}