(() => {
  const mix = list => {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const groups = [
    ['Normas de segurança', 6],
    ['Nomenclatura e funcionamento', 6],
    ['Conduta no estande', 3],
    ['Legislação*', 5]
  ];
  const state = {questions: [], index: 0, answers: []};
  const intro = document.querySelector('#intro');
  const quiz = document.querySelector('#quiz');
  const results = document.querySelector('#results');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function startAttempt() {
    state.questions = groups.flatMap(([subject, count]) => mix(QUESTIONS.filter(q => q.subject === subject)).slice(0, count));
    state.questions = mix(state.questions).map(q => ({...q, shuffled: mix(q.options)}));
    state.index = 0;
    state.answers = Array(state.questions.length).fill(null);
    intro.classList.add('hidden');
    results.classList.add('hidden');
    quiz.classList.remove('hidden');
    renderQuestion();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const chosen = state.answers[state.index];
    quiz.innerHTML = `<div class="quiz-top"><span class="count">QUESTÃO ${state.index + 1} DE ${state.questions.length}</span><span class="category">${escapeHtml(q.subject)}</span></div>
      <div class="progress" aria-label="Progresso"><span style="width:${((state.index + 1) / state.questions.length) * 100}%"></span></div>
      <h2 class="question">${escapeHtml(q.prompt)}</h2>
      <div class="options" role="group" aria-label="Alternativas">${q.shuffled.map((option, i) => `<button type="button" class="option ${chosen === option ? 'selected' : ''}" data-option="${i}" aria-pressed="${chosen === option}"><span class="option-key">${String.fromCharCode(65 + i)}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>
      <nav class="quiz-nav" aria-label="Navegação entre questões"><button id="previous" class="button button-quiet" ${state.index === 0 ? 'disabled' : ''}>← Anterior</button><button id="next" class="button button-secondary" ${chosen === null ? 'disabled' : ''}>${state.index === state.questions.length - 1 ? 'Ver resultado' : 'Próxima →'}</button></nav>`;
    quiz.querySelectorAll('.option').forEach(button => button.addEventListener('click', () => {
      state.answers[state.index] = q.shuffled[Number(button.dataset.option)];
      renderQuestion();
    }));
    quiz.querySelector('#previous').addEventListener('click', () => {state.index--; renderQuestion(); window.scrollTo({top: 0, behavior: 'smooth'});});
    quiz.querySelector('#next').addEventListener('click', () => {
      if (state.answers[state.index] === null) return;
      if (state.index === state.questions.length - 1) showResults();
      else {state.index++; renderQuestion(); window.scrollTo({top: 0, behavior: 'smooth'});}
    });
  }

  function showResults() {
    const totalCorrect = state.questions.reduce((sum, q, i) => sum + (state.answers[i] === q.answer ? 1 : 0), 0);
    const percent = Math.round(totalCorrect / state.questions.length * 100);
    const passed = percent >= 60;
    const rows = groups.map(([subject]) => {
      const subset = state.questions.map((q, i) => ({q, answer: state.answers[i]})).filter(item => item.q.subject === subject);
      const got = subset.filter(item => item.answer === item.q.answer).length;
      return `<div class="subject-row"><span class="label">${escapeHtml(subject.replace('*',''))}</span><div class="mini-track"><span style="width:${got / subset.length * 100}%"></span></div><span class="fraction">${got}/${subset.length} certas</span></div>`;
    }).join('');
    const review = state.questions.map((q, i) => {
      const right = state.answers[i] === q.answer;
      return `<article class="review-item"><div class="review-title"><span class="review-mark ${right ? 'correct' : 'incorrect'}">${right ? '✓' : '×'}</span><span>${i + 1}. ${escapeHtml(q.prompt)}</span></div><p class="review-meta">${right ? `Sua resposta: ${escapeHtml(state.answers[i])}` : `Sua resposta: ${escapeHtml(state.answers[i])} · Resposta correta: ${escapeHtml(q.answer)}`}</p><p class="review-explanation">${escapeHtml(q.note)} <span>Fonte: ${escapeHtml(q.source)}.</span></p></article>`;
    }).join('');
    quiz.classList.add('hidden');
    results.classList.remove('hidden');
    results.innerHTML = `<div class="result-head"><div class="score-ring" style="--score:${percent}"><div><strong>${totalCorrect}/20</strong><small>${percent}% de acerto</small></div></div><h2>${passed ? 'Simulado aprovado' : 'Continue praticando'}</h2><p>${passed ? 'Você atingiu o aproveitamento mínimo de 60%.' : 'O aproveitamento ficou abaixo de 60%. Revise os temas e tente novamente.'}</p><span class="status ${passed ? 'pass' : 'fail'}">${passed ? 'APROVADO' : 'ABAIXO DE 60%'}</span></div>
      <div class="breakdown"><h3>Desempenho por assunto</h3>${rows}</div>
      <div class="answer-review"><h3>Gabarito comentado</h3>${review}</div>
      <p class="source-note">* A seção de legislação reflete somente o conteúdo reproduzido na cartilha de 2017. As leis e classificações podem ter sido alteradas. Consulte fontes oficiais atualizadas.</p>
      <div class="result-actions"><button id="back-home" class="button button-quiet">Voltar ao início</button><button id="restart" class="button button-primary restart">Nova tentativa <span aria-hidden="true">→</span></button></div>`;
    results.querySelector('#restart').addEventListener('click', startAttempt);
    results.querySelector('#back-home').addEventListener('click', () => {results.classList.add('hidden'); intro.classList.remove('hidden'); window.scrollTo({top: 0, behavior: 'smooth'});});
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  document.querySelector('#start').addEventListener('click', startAttempt);
})();
