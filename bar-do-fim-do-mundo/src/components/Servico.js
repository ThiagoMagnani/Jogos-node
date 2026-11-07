import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Ceu from './Ceu';
import Cliente from './Cliente';
import Pedido from './Pedido';
import Prateleira from './Prateleira';
import Copo from './Copo';
import { slotsDaNoite } from '../data/nights';
import { INGREDIENTE_POR_ID } from '../data/ingredients';
import { avaliarPistas, calcularMistura, calcularVeredito, getPistas } from '../game/mixer';
import { calcularGorjeta, ingredientesDisponiveis, tecnicasDisponiveis } from '../game/rules';
import { sfx } from '../game/sfx';

const TITULOS_VEREDITO = {
  perfeito: { texto: 'PERFEITO!', classe: 'perfeito', icone: '💖' },
  bom: { texto: 'Quase lá', classe: 'bom', icone: '😐' },
  ruim: { texto: 'Desastre', classe: 'ruim', icone: '💢' },
  tempo: { texto: 'Perdeu a paciência', classe: 'ruim', icone: '⌛' },
};

/**
 * Atendimento de UM cliente. Este componente é criado com `key` diferente a cada cliente,
 * então todo o estado local (copo, tempo, pistas) recomeça do zero sozinho.
 */
export default function Servico({ estado, dispatch, noite, cliente, indice, pausado }) {
  const slots = slotsDaNoite(noite.numero);
  const ingredientes = useMemo(() => ingredientesDisponiveis(noite.numero, estado.presentes), [noite.numero, estado.presentes]);
  const tecnicas = useMemo(() => tecnicasDisponiveis(noite.numero), [noite.numero]);
  const pistas = useMemo(() => getPistas(cliente), [cliente]);

  // Paciência total (o Relógio do Tião deixa o cliente 30% mais paciente).
  const pacienciaTotal = cliente.paciencia ? cliente.paciencia * (estado.melhorias.relogio ? 1.3 : 1) : null;
  const temCronometro = pacienciaTotal !== null && !estado.tranquilo;

  const [escolhidos, setEscolhidos] = useState([]);
  const [tecnica, setTecnica] = useState('direto');
  const [tempo, setTempo] = useState(pacienciaTotal);
  const [reveladas, setReveladas] = useState([]);
  const [fase, setFase] = useState('preparo'); // 'preparo' | 'veredito'
  const [resultado, setResultado] = useState(null);
  const [aviso, setAviso] = useState('');

  const stats = useMemo(() => calcularMistura(escolhidos, tecnica), [escolhidos, tecnica]);
  const alvos = useMemo(() => reveladas.flatMap((i) => pistas[i].conds), [reveladas, pistas]);
  const contagem = useMemo(
    () => escolhidos.reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {}),
    [escolhidos]
  );

  // O sino da porta toca quando o cliente chega.
  useEffect(() => {
    sfx.sino();
  }, []);

  // ------------------------------------------------------------ servir
  const servir = useCallback(
    (porTempo = false) => {
      if (fase !== 'preparo') return;
      const avaliadas = porTempo ? null : avaliarPistas(cliente, stats);
      const veredito = porTempo ? 'tempo' : calcularVeredito(avaliadas);
      const moedas = calcularGorjeta({
        veredito,
        tempoRestante: tempo || 0,
        paciencia: temCronometro ? pacienciaTotal : null,
        jukebox: !!estado.melhorias.jukebox,
      });
      const presente =
        veredito === 'perfeito' && cliente.presente && !estado.presentes.includes(cliente.presente.id)
          ? cliente.presente
          : null;

      const falhou = veredito === 'ruim' || veredito === 'tempo';
      const protegido = falhou && !!estado.melhorias.copo && !estado.copoUsado;

      dispatch({ type: 'SERVIDO', cliente, veredito, moedas });
      setResultado({ veredito, avaliadas, moedas, presente, protegido });
      setFase('veredito');

      if (veredito === 'perfeito') sfx.perfeito();
      else if (veredito === 'bom') sfx.bom();
      else if (veredito === 'tempo') sfx.tempo();
      else sfx.ruim();
      if (moedas > 0) setTimeout(sfx.moeda, 450);
      if (presente) setTimeout(sfx.presente, 900);
    },
    [fase, cliente, stats, tempo, temCronometro, pacienciaTotal, estado.melhorias.jukebox, estado.melhorias.copo, estado.copoUsado, estado.presentes, dispatch]
  );

  // ------------------------------------------------------------ cronômetro
  const correndo = temCronometro && fase === 'preparo' && !pausado;

  useEffect(() => {
    if (!correndo) return undefined;
    const id = setInterval(() => setTempo((t) => Math.max(0, t - 0.1)), 100);
    return () => clearInterval(id);
  }, [correndo]);

  useEffect(() => {
    if (correndo && tempo <= 0) servir(true);
  }, [correndo, tempo, servir]);

  // ------------------------------------------------------------ ações do jogador
  const adicionar = (id) => {
    if (fase !== 'preparo' || escolhidos.length >= slots) return;
    sfx.colocar(escolhidos.length);
    setEscolhidos((lista) => [...lista, id]);
  };

  const remover = (pos) => {
    sfx.remover();
    setEscolhidos((lista) => lista.filter((_, i) => i !== pos));
  };

  const limpar = () => {
    sfx.remover();
    setEscolhidos([]);
  };

  const escolherTecnica = (id) => {
    sfx.clique();
    setTecnica(id);
  };

  const revelar = (idx) => {
    if (fase !== 'preparo' || reveladas.includes(idx)) return;
    if (estado.pistasRestantes <= 0) {
      sfx.erro();
      setAviso('Você não tem mais lupas nesta noite. Compre mais na loja!');
      setTimeout(() => setAviso(''), 2600);
      return;
    }
    sfx.clique();
    dispatch({ type: 'USAR_PISTA' });
    setReveladas((lista) => [...lista, idx]);
  };

  // ------------------------------------------------------------ apresentação
  const razaoPaciencia = temCronometro && tempo !== null ? tempo / pacienciaTotal : null;
  let humor = '';
  if (fase === 'veredito') humor = TITULOS_VEREDITO[resultado.veredito].icone;
  else if (razaoPaciencia !== null && razaoPaciencia < 0.3) humor = '💦';

  const ehUltimoCliente = indice + 1 >= noite.clientes.length;
  const rotuloProximo = cliente.final
    ? 'Ver o desfecho →'
    : estado.vidas <= 0
    ? 'O bar não aguenta mais... →'
    : ehUltimoCliente
    ? 'Fechar o bar →'
    : 'Próximo cliente →';

  const fala = resultado
    ? resultado.veredito === 'tempo'
      ? cliente.reacoes.tempo || `${cliente.nome} cansou de esperar e foi embora sem dizer nada.`
      : cliente.reacoes[resultado.veredito === 'perfeito' ? 'perfeito' : resultado.veredito === 'bom' ? 'bom' : 'ruim']
    : '';

  return (
    <div className={`servico ${cliente.final ? 'servico-final' : ''}`}>
      <section className="palco">
        <div className="janela">
          <Ceu escala={0.45 + noite.numero * 0.17} estrelas={36} />
          <div className="janela-moldura" />
        </div>
        <div className="letreiro" aria-hidden="true">
          <span>O ÚLTIMO</span>
          <span>GOLE</span>
        </div>
        <div className="estante" aria-hidden="true">
          🍾 🥃 🍷 🍸 🧉 🍶
        </div>

        <div className="palco-conteudo">
          <Cliente cliente={cliente} humor={humor} paciencia={razaoPaciencia} />

          <div className="palco-conversa">
            <Pedido
              cliente={cliente}
              reveladas={reveladas}
              avaliadas={resultado ? resultado.avaliadas : null}
              servido={fase === 'veredito'}
              podeRevelar={estado.pistasRestantes > 0}
              onRevelar={revelar}
            />
            {fase === 'preparo' && (
              <p className="dica-lupa">
                🔍 Toque numa frase destacada para usar uma lupa (restam <strong>{estado.pistasRestantes}</strong>).
                {estado.tranquilo && ' Modo tranquilo: sem cronômetro.'}
              </p>
            )}
            {aviso && <p className="aviso">{aviso}</p>}
          </div>
        </div>
        <div className="balcao-madeira" aria-hidden="true" />
      </section>

      {fase === 'preparo' ? (
        <div className="bancada">
          <Prateleira
            ingredientes={ingredientes}
            contagem={contagem}
            cheio={escolhidos.length >= slots}
            bloqueado={pausado}
            onEscolher={adicionar}
          />
          <Copo
            escolhidos={escolhidos}
            slots={slots}
            tecnicas={tecnicas}
            tecnica={tecnica}
            stats={stats}
            alvos={alvos}
            bloqueado={pausado}
            onTecnica={escolherTecnica}
            onRemover={remover}
            onLimpar={limpar}
            onServir={servir}
          />
        </div>
      ) : (
        <section className={`veredito ${TITULOS_VEREDITO[resultado.veredito].classe}`}>
          <h2 className="veredito-titulo">{TITULOS_VEREDITO[resultado.veredito].texto}</h2>
          <p className="veredito-fala">
            <strong>{cliente.nome}:</strong> {fala}
          </p>

          <div className="veredito-linha">
            {resultado.avaliadas && (
              <span className="veredito-placar">
                Pistas cumpridas: {resultado.avaliadas.filter((p) => p.ok).length}/{resultado.avaliadas.length}
              </span>
            )}
            <span className={`veredito-moedas ${resultado.moedas ? 'ganhou' : ''}`}>
              {resultado.moedas ? `+${resultado.moedas} 🪙 de gorjeta` : 'Sem gorjeta'}
            </span>
            {(resultado.veredito === 'ruim' || resultado.veredito === 'tempo') && (
              <span className="veredito-vida">{resultado.protegido ? '🥂 O Copo Encantado te protegeu!' : '💔 −1 vida'}</span>
            )}
          </div>

          {resultado.presente && (
            <div className="presente-aviso">
              <span className="presente-icone">{INGREDIENTE_POR_ID[resultado.presente.id].icon}</span>
              <div>
                <strong>Presente especial: {INGREDIENTE_POR_ID[resultado.presente.id].nome}</strong>
                <p>{resultado.presente.fala}</p>
                <small>Já está na sua prateleira!</small>
              </div>
            </div>
          )}

          <button type="button" className="btn btn-neon btn-grande" onClick={() => dispatch({ type: 'PROXIMO' })} autoFocus>
            {rotuloProximo}
          </button>
        </section>
      )}
    </div>
  );
}
