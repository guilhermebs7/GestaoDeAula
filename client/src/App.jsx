import React, { useState, useEffect } from 'react';
import PlanoForm from './components/PlanoForm';
import PlanoCards from './components/PlanoCards';
import PlanoView from './components/planoView';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';

import './App.css';
import { CiCirclePlus } from 'react-icons/ci';
import { FiEdit3 } from 'react-icons/fi';

function obterSaudacao() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) {
    return 'Bom dia';
  } else if (hora >= 12 && hora < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

function App() {
  const itensPorPagina = 6;
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dataAtual, setDataAtual] = useState('');
  const [saudacao, setSaudacao] = useState('');
  const [totalPlanos, setTotalPlanos] = useState(0);
  const [page, setPage] = useState(1);

  // Filtros
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [tags, setTags] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [ordenacao, setOrdenacao] = useState('titulo_asc'); // Ordenação padrão
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [viewingPlano, setViewingPlano] = useState(null);
  const [planoParaDeletar, setPlanoParaDeletar] = useState(null);

  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    function atualizarData() {
      const hoje = new Date();
      const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }).format(hoje);
      setDataAtual(dataFormatada);
      setSaudacao(obterSaudacao());
    }

    atualizarData();
    const interval = setInterval(atualizarData, 60000);

    return () => clearInterval(interval);
  }, []);

  async function handleSave(payload) {
    const isEditing = editing && editing.id;
    
    console.log('Editing state:', editing);
    console.log('Is editing:', isEditing);
    console.log('ID:', editing?.id);
    
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/planos/${editing.id}` : '/planos';
    
    console.log('URL:', url);
    console.log('Payload:', payload);

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Erro ao salvar');
    }

    setEditing(null);
    setMostrarFormulario(false);
    setRefreshKey(k => k + 1);
  }

  async function handleExcluir(plano) {
    setPlanoParaDeletar(plano);
  }

  async function confirmarDelecao(plano) {
    try {
      const res = await fetch(`/planos/${plano.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Erro ao deletar');
      }

      setViewingPlano(null);
      setPlanoParaDeletar(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar o plano');
    }
  }

  function abrirNovoPlano() {
    setEditing(null);
    setMostrarFormulario(true);
  }

  function abrirSmartAssist() {
    setMostrarFormulario(true);
  }

  function limparFiltros() {
    setBusca('');
    setDisciplina('');
    setTags('');
    setDataPrevista('');
    setOrdenacao('titulo_asc');
    setPage(1);
  }

  useEffect(() => {
    // Debounce: aguarda 500ms após parar de digitar
    const timer = setTimeout(() => {
      async function carregarPlanos() {
        try {
          setLoading(true);
          
          // Construir query params
          const params = new URLSearchParams();
          if (busca) params.append('titulo', busca);
          if (disciplina) params.append('disciplina', disciplina);
          if (tags) params.append('tags', tags);
          
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
          
          const queryString = params.toString();
          const url = queryString ? `/planos?${queryString}` : '/planos';
                    const resPlanos = await fetch(url);
          
          if (!resPlanos.ok) {
            throw new Error('Erro ao carregar planos');
          }

          const dados = await resPlanos.json();
          setPlanos(dados);
          setPage(1);
          setError('');
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }


      carregarPlanos();
    }, 800); // Voltou para 500ms

    return () => clearTimeout(timer); // Limpa o timer se houver nova mudança
  }, [refreshKey, busca, disciplina, tags, ordenacao]);

  useEffect(() => {
    async function carregarTotalPlanos() {
      try {
        const res = await fetch('/planos/resumo/total');

        if (!res.ok) {
          throw new Error('Erro ao carregar total de planos');
        }

        const resumo = await res.json();
        setTotalPlanos(Number(resumo.totalPlanos || 0));
      } catch (err) {
        console.error(err);
      }
    }

    carregarTotalPlanos();
  }, [refreshKey]);

  const totalPages = Math.max(1, Math.ceil(planos.length / itensPorPagina));
  const pageSafe = Math.min(page, totalPages);
  const planosPaginados = planos.slice(
    (pageSafe - 1) * itensPorPagina,
    pageSafe * itensPorPagina
  );

  return (
    <>
      <div className="dashboard-page">
        <main className="dashboard-content">
          <section className="hero-card">
            <div className="hero-header">
              <div className="hero-date">{dataAtual}</div>
              <div className="hero-buttons">
                <button className="hero-btn hero-btn-light" onClick={abrirNovoPlano}>
                  <CiCirclePlus className="hero-btn-icon" size={18} />
                  Novo Plano
                </button>
               
              </div>
            </div>
            <div className="hero-body">
              <h1>{saudacao}</h1>
              <p>
                Você possui {totalPlanos} planos cadastrados no banco.
              </p>
            </div>
          </section>

          <section className="filters-card">
            <div className="filters-toolbar">
              <input
                type="text"
                className="filters-search"
                placeholder="Buscar por título..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />

              <input
                type="text"
                className="filters-search"
                placeholder="Buscar por disciplina..."
                value={disciplina}
                onChange={e => setDisciplina(e.target.value)}
              />

              <input
                type="text"
                className="filters-search"
                placeholder="Filtrar por tags (ex: revisão, prática)..."
                value={tags}
                onChange={e => setTags(e.target.value)}
              />

              <select
                value={ordenacao}
                onChange={e => setOrdenacao(e.target.value)}
                className="filters-select"
              >
                <option value="titulo_asc">Título (A-Z)</option>
                <option value="titulo_desc">Título (Z-A)</option>
                <option value="data_prevista_asc">Data mais próxima</option>
                <option value="data_prevista_desc">Data mais distante</option>
                <option value="criacao_desc">Mais recentes</option>
              </select>

              <button
                onClick={limparFiltros}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}
              >
                Limpar Filtros
              </button>
            </div>

            {mostrarFormulario && (
              <div
                className="modal-overlay"
                onClick={(e) => { if (e.target === e.currentTarget) setMostrarFormulario(false); }}
              >
                <div className="modal" role="dialog" aria-modal="true">
                  <div className="modal-header">
                    <div className="modal-header-titles">
                      <div className="modal-title">{editing ? 'Editar plano' : 'NOVO PLANO'}</div>
                      <div className="modal-subtitle">Preencha os campos abaixo para criar seu plano de aula</div>
                    </div>

                    <button
                      type="button"
                      className="modal-close"
                      onClick={() => setMostrarFormulario(false)}
                      aria-label="Fechar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <PlanoForm initial={editing || {}} onSave={handleSave} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <PlanoCards
            planos={loading ? [] : planosPaginados}
            onVisualizar={setViewingPlano}
            onEditar={(plano) => {
              setEditing(plano);
              setMostrarFormulario(true);
            }}
            onExcluir={handleExcluir}
          />

          {!loading && planos.length > 0 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="pagination-button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pageSafe === 1}
              >
                Anterior
              </button>

              <span className="pagination-info">
                {pageSafe} / {totalPages}
              </span>

              <button
                type="button"
                className="pagination-button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={pageSafe === totalPages}
              >
                Próxima
              </button>
            </div>
          )}

          {viewingPlano && (
            <PlanoView 
              plano={viewingPlano} 
              onClose={() => setViewingPlano(null)}
              onEditar={(plano) => {
                setViewingPlano(null);
                setEditing(plano);
                setMostrarFormulario(true);
              }}
              onExcluir={handleExcluir}
            />
          )}
          {planoParaDeletar && (
            <ConfirmDeleteModal 
              plano={planoParaDeletar}
              onConfirm={confirmarDelecao}
              onCancel={() => setPlanoParaDeletar(null)}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
