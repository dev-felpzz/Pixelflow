# TODO - Correção cards/carrossel equipe

## Passo 1 (CSS)
- [x] Aplicar regras mobile (<1024px) obrigatórias em `carousel-team.css` para:
  - [x] remover flip/hover/tap (sem .is-flipped, sem conteúdo escondido)
  - [x] `.profile-card-front { display:none !important; }`
  - [x] `.profile-card-hover { opacity:1; visibility:visible; position:relative; transform:none; }`
  - [x] bloquear `:hover/:active/:focus` do card
  - [x] padronizar imagens (mesma largura/altura, `object-fit: cover`, mesmo `border-radius`)
  - [x] mesma altura e centralização do conteúdo

## Passo 2 (JS)
- [x] Atualizar `carousel-team.js` (mobile-only) para:
  - [x] autoplay infinito contínuo (suave ~0.5x)
  - [x] movimento contínuo sem pular por slide
  - [x] loop infinito real (wrap-around sem transição)
  - [x] swipe horizontal e drag funcionando
  - [x] remover qualquer lógica relacionada a flip/tap-to-open (apenas mover slides)


## Passo 3 (Validação)
- [ ] Testar no mobile/tablet:
  - [ ] cards nunca flipam e conteúdo fica sempre visível
  - [ ] imagens padronizadas
  - [ ] alinhamento/altura consistente
  - [ ] carousel não trava, não pula, loop infinito

