// frontend/src/components/PlanosList.jsx
import React, { useEffect, useState } from 'react';
import { formatDateOnlyPtBr } from '../utils/dateOnly';

export default function PlanosList({
  busca = '',
  disciplina = '',
  tags = '',
  dataPrevista = '',
  ordenacao = 'titulo',
  viewMode = 'list',
  onEdit
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', pageSize);
        
        if (busca) params.append('q', busca);
        if (disciplina) params.append('disciplina', disciplina);
        if (tags) params.append('tags', tags);
        if (dataPrevista) params.append('dataPrevista', dataPrevista);
        
        // Mapear ordenacao para sort e order
        if (ordenacao) {
          if (ordenacao === 'titulo_asc') {
            params.append('sort', 'titulo');
            params.append('order', 'asc');
          } else if (ordenacao === 'titulo_desc') {
            params.append('sort', 'titulo');
            params.append('order', 'desc');
          } else if (ordenacao === 'data_prevista_asc') {
            params.append('sort', 'dataPrevista');
            params.append('order', 'asc');
          } else if (ordenacao === 'data_prevista_desc') {
            params.append('sort', 'dataPrevista');
            params.append('order', 'desc');
          } else if (ordenacao === 'criacao_desc') {
            params.append('sort', 'createdAt');
            params.append('order', 'desc');
          }
        }

        const res = await fetch(`/planos?${params}`);
        if (!res.ok) throw new Error('Erro ao carregar planos');
        const json = await res.json();
        if (!cancelled) {
          setItems(json.items || []);
          setTotalPages(json.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [busca, disciplina, tags, dataPrevista, ordenacao, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>;

  if (items.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Nenhum plano encontrado</div>;
  }

  return (
    <div>
      {viewMode === 'list' ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(p => (
            <li
              key={p.id}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{p.titulo}</strong>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {p.disciplina} • {formatDateOnlyPtBr(p.dataPrevista, { year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={() => onEdit && onEdit(p)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#4f46e5',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {items.map(p => (
            <div
              key={p.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                background: '#f9fbfd',
              }}
            >
              <strong>{p.titulo}</strong>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0' }}>
                {p.disciplina}
              </p>
              <button
                onClick={() => onEdit && onEdit(p)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#4f46e5',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: '#fff',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          Anterior
        </button>
        <span style={{ alignSelf: 'center', color: '#6b7280' }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: '#fff',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            opacity: page === totalPages ? 0.5 : 1,
          }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}