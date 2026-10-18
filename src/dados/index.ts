// Leitura e gravação no IndexedDB. Os dados ficam só no celular (CLAUDE.md, seção 3).
import { openDB, type IDBPDatabase } from 'idb';
import type { Produto, Propriedade } from '../calculos';

const NOME_BANCO = 'precificacao';
const LOJA_PRODUTOS = 'produtos';
const LOJA_GERAL = 'geral';

let banco: Promise<IDBPDatabase> | null = null;

function abrir(): Promise<IDBPDatabase> {
  banco ??= openDB(NOME_BANCO, 1, {
    upgrade(db) {
      db.createObjectStore(LOJA_PRODUTOS, { keyPath: 'id' });
      db.createObjectStore(LOJA_GERAL);
    },
  });
  return banco;
}

/** Se o navegador bloquear o IndexedDB, o app continua calculando, só não guarda. */
async function tentar<T>(acao: (db: IDBPDatabase) => Promise<T>): Promise<T | undefined> {
  try {
    return await acao(await abrir());
  } catch (erro) {
    console.warn('Não foi possível usar o armazenamento local', erro);
    return undefined;
  }
}

export function salvarProduto(produto: Produto) {
  return tentar((db) => db.put(LOJA_PRODUTOS, produto));
}

export function listarProdutos() {
  return tentar((db) => db.getAll(LOJA_PRODUTOS) as Promise<Produto[]>);
}

export function salvarPropriedade(propriedade: Propriedade) {
  return tentar((db) => db.put(LOJA_GERAL, propriedade, 'propriedade'));
}

export function carregarPropriedade() {
  return tentar((db) => db.get(LOJA_GERAL, 'propriedade') as Promise<Propriedade | undefined>);
}

/** Respostas em andamento do Modo Simples, para não perder nada se o app fechar. */
export function salvarRascunho<T>(rascunho: T) {
  return tentar((db) => db.put(LOJA_GERAL, rascunho, 'rascunhoSimples'));
}

export function carregarRascunho<T>() {
  return tentar((db) => db.get(LOJA_GERAL, 'rascunhoSimples') as Promise<T | undefined>);
}

export function apagarRascunho() {
  return tentar((db) => db.delete(LOJA_GERAL, 'rascunhoSimples'));
}
