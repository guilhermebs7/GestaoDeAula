// frontend/src/components/PlanoForm.jsx
import React, { useState } from 'react';
import { gerarRecomendacoesApi } from '../services/aiService';
import { AiOutlineRobot } from 'react-icons/ai';
import { LiaSaveSolid } from 'react-icons/lia';
import * as yup from 'yup';

const schema = yup.object({
  titulo: yup.string().required('Título obrigatório'),
  objetivo: yup.string().required('Objetivo obrigatório'),
  resumo: yup.string().required('Resumo obrigatório'),
  dataPrevista: yup.string().required('Data prevista obrigatória'),
  disciplina: yup.string().required('Disciplina obrigatória'),
  conteudos: yup
    .string()
    .test('not-empty', 'Conteúdos obrigatórios', v => v && v.split('\n').map(s => s.trim()).filter(Boolean).length > 0),
  recursos: yup.string().required('Recursos obrigatórios'),
  tags: yup
    .string()
    .test('not-empty', 'Tags obrigatórias', v => v && v.split(',').map(t => t.trim()).filter(Boolean).length > 0),
});

export default function PlanoForm({ initial = {}, onSave }) {
  const [titulo, setTitulo] = useState(initial.titulo || '');
  const [objetivo, setObjetivo] = useState(initial.objetivo || '');
  const [resumo, setResumo] = useState(initial.resumo || '');
  const [dataPrevista, setDataPrevista] = useState(initial.dataPrevista || '');
  const [disciplina, setDisciplina] = useState(initial.disciplina || '');
  const [conteudos, setConteudos] = useState((initial.conteudos || []).join('\n') || '');
  const [recursos, setRecursos] = useState(initial.recursos || initial.recursosApoio || '');
  const [tags, setTags] = useState((initial.tags || []).join(', ') || '');

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');

  // converte string -> Date (ou null)
  const parseDate = d => (d ? new Date(d) : null);
  const formatDate = d => (d ? d.toISOString().slice(0,10) : '');

  const [dataPrevistaDate, setDataPrevistaDate] = useState(parseDate(initial.dataPrevista || ''));

  // Função para obter data de amanhã (só permite datas futuras)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const formValues = {
      titulo: titulo.trim(),
      objetivo: objetivo.trim(),
      resumo: resumo.trim(),
      dataPrevista: dataPrevista || '',
      disciplina: disciplina.trim(),
      conteudos: conteudos,
      recursos: recursos.trim(),
      tags: tags,
    };

    try {
      await schema.validate(formValues, { abortEarly: false });
    } catch (validationErr) {
      const errs = {};
      if (validationErr.inner && validationErr.inner.length) {
        validationErr.inner.forEach(err => {
          if (err.path) errs[err.path] = err.message;
        });
      } else if (validationErr.path) {
        errs[validationErr.path] = validationErr.message;
      }
      setFieldErrors(errs);
      return;
    }

    const payload = {
      titulo: formValues.titulo,
      objetivo: formValues.objetivo,
      resumo: formValues.resumo,
      dataPrevista: formValues.dataPrevista || null,
      disciplina: formValues.disciplina || null,
      conteudos: formValues.conteudos
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      recursos: formValues.recursos,
      tags: formValues.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'Erro ao salvar o plano.');
    } finally {
      setSaving(false);
    }
  }

  async function handleGerarIA() {
    setIaError('');
    if (!titulo.trim() && !resumo.trim()) {
      setIaError('Forneça pelo menos título ou resumo para a IA.');
      return;
    }
    try {
      setIaLoading(true);
      const resp = await gerarRecomendacoesApi({
        titulo: titulo.trim(),
        disciplina: disciplina || null,
        resumo: resumo.trim()
      });

      if (resp?.conteudos) {
        setConteudos(resp.conteudos.join('\n'));
      }

      if (resp?.recursosApoio) {
        setRecursos(resp.recursosApoio.join('\n'));
      }

      if (resp?.tags) {
        setTags(resp.tags.join(', '));
      }

    } catch (err) {
      setIaError(err?.message || 'Erro ao consultar a IA.');
    } finally {
      setIaLoading(false);
    }
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <label>
        <span>Título da Aula</span>
        <input
          type="text"
          className={`input-title ${fieldErrors.titulo ? 'error' : ''}`}
          placeholder="Ex: Geometria Espacial: Prismas e Pirâmides"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
        {fieldErrors.titulo && <div className="field-error">{fieldErrors.titulo}</div>}
      </label>

      <div className="form-row two-cols">
        <label>
          <span>Disciplina</span>
          <input
            type="text"
            className={`input-discipline ${fieldErrors.disciplina ? 'error' : ''}`}
            placeholder="Ex: Matemática"
            value={disciplina}
            onChange={e => setDisciplina(e.target.value)}
          />
          {fieldErrors.disciplina && <div className="field-error">{fieldErrors.disciplina}</div>}
        </label>

        <label>
         <span>Data Prevista</span>
          <input
            type="date"
            className={`input-date ${fieldErrors.dataPrevista ? 'error' : ''}`}
            value={dataPrevista || ''}
            onChange={e => setDataPrevista(e.target.value)}
            placeholder="dd/mm/aaaa"
            min={getTomorrowDate()}
          />
          {fieldErrors.dataPrevista && <div className="field-error">{fieldErrors.dataPrevista}</div>}
        </label>
      </div>

      <label>
        <span>Objetivo</span>
        <textarea
          className={`input-objetivo ${fieldErrors.objetivo ? 'error' : ''}`}
          placeholder="Descreva o objetivo principal dessa aula..."
          value={objetivo}
          onChange={e => setObjetivo(e.target.value)}
          rows={3}
        />
        {fieldErrors.objetivo && <div className="field-error">{fieldErrors.objetivo}</div>}
      </label>

      <label>
        <span>Ementa / Resumo</span>
        <textarea
          className={`input-resumo ${fieldErrors.resumo ? 'error' : ''}`}
          placeholder="Resumo do conteúdo que será abordado..."
          value={resumo}
          onChange={e => setResumo(e.target.value)}
          rows={4}
        />
        {fieldErrors.resumo && <div className="field-error">{fieldErrors.resumo}</div>}
      </label>

      <div className="ai-row">
        <button
          type="button"
          className="hero-btn hero-btn-outline"
          onClick={handleGerarIA}
          disabled={iaLoading}
          title="Gerar recomendações com IA"
        >
          <span className="hero-btn-icon">✧</span>
          {iaLoading ? 'Gerando...' : 'Smart Assist'}
        </button>
        {iaError && <div className="ia-error">{iaError}</div>}
      </div>

      <label>
        <span>Conteúdos (uma linha por conteúdo)</span>
        <textarea
          className={`input-conteudos ${fieldErrors.conteudos ? 'error' : ''}`}
          value={conteudos}
          onChange={e => setConteudos(e.target.value)}
          rows={4}
        />
        {fieldErrors.conteudos && <div className="field-error">{fieldErrors.conteudos}</div>}
      </label>

      <label>
        <span>Recursos de Apoio</span>
        <textarea
          className={`input-recursos ${fieldErrors.recursos ? 'error' : ''}`}
          value={recursos}
          onChange={e => setRecursos(e.target.value)}
          rows={3}
        />
        {fieldErrors.recursos && <div className="field-error">{fieldErrors.recursos}</div>}
      </label>

      <label>
        <span>Tags (separadas por vírgula)</span>
        <input
          type="text"
          className={`input-tags ${fieldErrors.tags ? 'error' : ''}`}
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="ex: pesquisa,prática"
        />
        {fieldErrors.tags && <div className="field-error">{fieldErrors.tags}</div>}
      </label>

      <div className="form-actions">
        <button
          type="submit"
          disabled={saving}
          className={saving ? 'btn-save saving' : 'btn-save'}
          aria-live="polite"
        >
          <LiaSaveSolid className="save-icon" />
          <span className="save-text">{saving ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </div>
    </form>
  );
}