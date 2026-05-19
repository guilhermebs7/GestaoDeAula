const { Prisma } = require('@prisma/client');
const prisma = require('../database');

const allowedSortFields = ['id', 'titulo', 'disciplina', 'data_prevista', 'created_at'];

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

async function createPlanoAula(data) {
  const {
    titulo,
    objetivo,
    resumo,
    dataPrevista,
    disciplina,
    conteudos = [],
    recursos = [],
    tags = []
  } = data;

  const created = await prisma.planosAula.create({
    data: {
      titulo,
      objetivo,
      resumo,
      dataPrevista: toDate(dataPrevista),
      disciplina,
      conteudos,
      recursos,
      tags
    }
  });

  return created;
}

async function getPlanosAula(filters = {}) {
  const {
    page = 1,
    limit = 10,
    titulo,
    q,
    disciplina,
    tags,
    dataPrevista,
    sort,
    ordenacao,
    order = 'desc'
  } = filters;

  // Aceitar tanto 'q' quanto 'titulo', e 'ordenacao' quanto 'sort'
  const searchTerm = titulo || q;
  const sortField = sort || ordenacao || 'createdAt';

  console.log('Filtros recebidos:', { titulo: searchTerm, disciplina, tags, dataPrevista, sort: sortField, order });

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {};
  if (searchTerm) where.titulo = { contains: searchTerm, mode: 'insensitive' };
  if (disciplina) where.disciplina = { contains: disciplina, mode: 'insensitive' };
  if (dataPrevista) where.dataPrevista = toDate(dataPrevista);

  // Tags são salvas como JSON array; aqui buscamos por qualquer termo digitado
  // dentro de qualquer item do array, sem depender de correspondência exata.
  if (tags) {
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArray.length > 0) {
      const tagConditions = tagsArray.map(tag => {
        const pattern = `%${tag.toLowerCase()}%`;

        return Prisma.sql`
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text("tags") AS tag_value
            WHERE LOWER(tag_value) LIKE ${pattern}
          )
        `;
      });

      const matchingIds = await prisma.$queryRaw(
        Prisma.sql`
          SELECT "id"
          FROM "planos_aula"
          WHERE ${Prisma.join(tagConditions, Prisma.sql` OR `)}
        `
      );

      const ids = matchingIds.map(item => item.id);

      if (ids.length === 0) {
        return [];
      }

      where.id = { in: ids };
    }
  }

  // Mapear campos de sort
  let mappedSortField = 'createdAt';
  if (sortField === 'titulo') mappedSortField = 'titulo';
  if (sortField === 'dataPrevista') mappedSortField = 'dataPrevista';
  if (sortField === 'disciplina') mappedSortField = 'disciplina';

  const orderBy = {};
  orderBy[mappedSortField] = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  console.log('Query Where:', JSON.stringify(where, null, 2));

  const planos = await prisma.planosAula.findMany({
    where,
    skip,
    take,
    orderBy
  });

  return planos;
}

async function getPlanoAulaById(id) {
  console.log('Buscando ID:', id, 'convertido para:', Number(id));
  const plano = await prisma.planosAula.findUnique({
    where: { id: Number(id) }
  });
  console.log('Plano encontrado:', plano);
  return plano || null;
}

async function updatePlanoAula(id, data) {
  const fields = {
    ...data
  };
  if (fields.dataPrevista) fields.dataPrevista = toDate(fields.dataPrevista);

  const updated = await prisma.planosAula.update({
    where: { id: Number(id) },
    data: fields
  }).catch(() => null);

  return updated;
}

async function deletePlanoAula(id) {
  const removed = await prisma.planosAula.delete({
    where: { id: Number(id) }
  }).catch(() => null);

  return removed;
}

module.exports = {
  createPlanoAula,
  getPlanosAula,
  getPlanoAulaById,
  updatePlanoAula,
  deletePlanoAula
};
