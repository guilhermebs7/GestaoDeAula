const planoAula = require('../models/planoAula');
const logger = require('../../utils/logger');

async function listarPlanos(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    logger.info('Planos List Request', {
      page,
      limit,
      titulo: req.query.titulo || req.query.q || '',
      disciplina: req.query.disciplina || '',
      tags: req.query.tags || '',
      sort: req.query.sort || req.query.ordenacao || '',
      order: req.query.order || 'desc'
    });

    const planos = await planoAula.getPlanosAula(req.query);

    logger.info('Planos List Result', {
      count: Array.isArray(planos) ? planos.length : 0,
      page,
      limit
    });

    return res.status(200).json(planos);
  } catch (error) {
    logger.error('Planos List Failed', {
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao listar planos',
      error: error.message
    });
  }
}

async function contarPlanosDaSemana(req, res) {
  try {
    const total = await planoAula.countPlanosDaSemana();

    logger.info('Planos Week Count', {
      total
    });

    return res.status(200).json({
      totalPlanosSemana: total
    });
  } catch (error) {
    logger.error('Planos Week Count Failed', {
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao contar planos da semana',
      error: error.message
    });
  }
}

async function contarTotalPlanos(req, res) {
  try {
    const total = await planoAula.countTotalPlanos();

    logger.info('Planos Total Count', {
      total
    });

    return res.status(200).json({
      totalPlanos: total
    });
  } catch (error) {
    logger.error('Planos Total Count Failed', {
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao contar planos totais',
      error: error.message
    });
  }
}

async function buscarPlanoPorId(req, res) {
  try {
    logger.info('Planos Get By Id', {
      id: req.params.id,
      idType: typeof req.params.id
    });

    const plano = await planoAula.getPlanoAulaById(req.params.id);

    if (!plano) {
      logger.warn('Planos Not Found', {
        id: req.params.id
      });

      return res.status(404).json({
        message: 'Plano de aula não encontrado'
      });
    }

    logger.info('Planos Found', {
      id: plano.id,
      titulo: plano.titulo
    });

    return res.status(200).json(plano);
  } catch (error) {
    logger.error('Planos Get By Id Failed', {
      id: req.params.id,
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao buscar plano',
      error: error.message
    });
  }
}

async function criarPlano(req, res) {
  try {
    const novoPlano = await planoAula.createPlanoAula(req.body);
    logger.info('Planos Created', {
      id: novoPlano.id,
      titulo: novoPlano.titulo,
      disciplina: novoPlano.disciplina
    });
    return res.status(201).json(novoPlano);
  } catch (error) {
    logger.error('Planos Create Failed', {
      titulo: req.body?.titulo || '',
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao criar plano',
      error: error.message
    });
  }
}

async function atualizarPlano(req, res) {
  try {
    const planoAtualizado = await planoAula.updatePlanoAula(req.params.id, req.body);

    if (!planoAtualizado) {
      logger.warn('Planos Update Not Found', {
        id: req.params.id
      });

      return res.status(404).json({
        message: 'Plano de aula não encontrado'
      });
    }

    logger.info('Planos Updated', {
      id: planoAtualizado.id,
      titulo: planoAtualizado.titulo,
      disciplina: planoAtualizado.disciplina
    });

    return res.status(200).json(planoAtualizado);
  } catch (error) {
    logger.error('Planos Update Failed', {
      id: req.params.id,
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao atualizar plano',
      error: error.message
    });
  }
}

async function deletarPlano(req, res) {
  try {
    const planoRemovido = await planoAula.deletePlanoAula(req.params.id);

    if (!planoRemovido) {
      logger.warn('Planos Delete Not Found', {
        id: req.params.id
      });

      return res.status(404).json({
        message: 'Plano de aula não encontrado'
      });
    }

    logger.info('Planos Deleted', {
      id: planoRemovido.id,
      titulo: planoRemovido.titulo
    });

    return res.status(200).json({
      message: 'Plano de aula removido com sucesso'
    });
  } catch (error) {
    logger.error('Planos Delete Failed', {
      id: req.params.id,
      message: error.message
    });
    return res.status(500).json({
      message: 'Erro ao excluir plano',
      error: error.message
    });
  }
}

module.exports = {
  listarPlanos,
  contarPlanosDaSemana,
  contarTotalPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  deletarPlano
};