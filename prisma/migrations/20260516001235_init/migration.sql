-- CreateTable
CREATE TABLE "planos_aula" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "data_prevista" DATE NOT NULL,
    "disciplina" TEXT NOT NULL,
    "conteudos" JSONB NOT NULL,
    "recursos" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_aula_pkey" PRIMARY KEY ("id")
);
