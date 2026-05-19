// frontend/src/components/PlanoView.jsx
import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { FiEdit3, FiTrash } from 'react-icons/fi';
import { IoBookOutline, IoFolderOutline } from 'react-icons/io5';
import { FiCalendar } from 'react-icons/fi';

function formatarData(data) {
  if (!data) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(data));
}

function formatarDataAtualizado(data) {
  if (!data) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(data));
}

export default function PlanoView({ plano, onClose, onEditar, onExcluir }) {
  if (!plano) return null;
  const recursosBrutos = plano.recursos ?? plano.recursosApoio ?? [];
  const recursos = Array.isArray(recursosBrutos)
    ? recursosBrutos
    : typeof recursosBrutos === 'string'
      ? recursosBrutos.split('\n').map(item => item.trim()).filter(Boolean)
      : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-view" onClick={e => e.stopPropagation()}>
        {/* Gradiente no topo */}
        <div className="view-header-gradient" />

        {/* Cabeçalho: Status, Título, Disciplina, Data, e Botões */}
        <div className="view-header">
          <div className="view-header-left">
            <span className={`view-status ${plano.status === 'Publicado' ? 'status-publicado' : 'status-rascunho'}`}>
              {plano.status || 'Rascunho'}
            </span>

            <h1 className="view-main-title">{plano.titulo}</h1>

            <div className="view-metadata">
              <div className="view-meta-item">
                <IoBookOutline />
                <span>{plano.disciplina || 'Sem disciplina'}</span>
              </div>

              <div className="view-meta-item">
                <FiCalendar />
                <span>{formatarData(plano.dataPrevista)}</span>
              </div>
            </div>
          </div>

          <div className="view-header-right">
            <button
              type="button"
              className="view-action-btn edit-btn"
              onClick={() => onEditar?.(plano)}
            >
              <FiEdit3 /> Editar
            </button>

            <button
              type="button"
              className="view-action-btn delete-btn"
              onClick={() => onExcluir?.(plano)}
            >
              <FiTrash /> Excluir
            </button>

            <button className="view-close" onClick={onClose}>
              <AiOutlineClose />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="view-tags-section">
          <div className="plano-tags">
            {(plano.tags || []).map((tag) => (
              <span key={tag} className="plano-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Corpo com cards */}
        <div className="modal-body">
          {/* Objetivo */}
          <div className="view-card">
            <div className="view-card-header">
              <IoFolderOutline className="view-card-icon objetivo-icon" />
              <h3>Objetivo</h3>
            </div>
            <p className="view-card-content">{plano.objetivo}</p>
          </div>

          {/* Ementa / Resumo */}
          <div className="view-card">
            <div className="view-card-header">
              <IoFolderOutline className="view-card-icon resumo-icon" />
              <h3>Ementa / Resumo</h3>
            </div>
            <p className="view-card-content">{plano.resumo}</p>
          </div>

          {/* Conteúdos */}
          {plano.conteudos && plano.conteudos.length > 0 && (
            <div className="view-card">
              <div className="view-card-header">
                <IoFolderOutline className="view-card-icon conteudo-icon" />
                <h3>Conteúdos</h3>
              </div>
              <ul className="view-card-list">
                {plano.conteudos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recursos de Apoio */}
          {recursos.length > 0 && (
            <div className="view-card">
              <div className="view-card-header">
                <IoFolderOutline className="view-card-icon recursos-icon" />
                <h3>Recursos de Apoio</h3>
              </div>
              <ul className="view-card-list">
                {recursos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}