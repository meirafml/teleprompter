const reader = document.querySelector('#reader');
const script = document.querySelector('#script');
const play = document.querySelector('#play');
const status = document.querySelector('#status');
const speed = document.querySelector('#speed');
const size = document.querySelector('#size');
let running = false;
let frame;
let previous;
let position = 0;
function pause(message = 'Pausado') {
  running = false;
  cancelAnimationFrame(frame);
  previous = undefined;
  script.contentEditable = 'false';
  play.textContent = 'Iniciar';
  status.textContent = message;
}
function tick(time) {
  if (!running) return;
  if (previous !== undefined) {
    position += Number(speed.value) * Math.min((time - previous) / 1000, 0.1);
    reader.scrollTop = position;
    if (reader.scrollTop >= reader.scrollHeight - reader.clientHeight - 1) {
      pause('Leitura concluída');
      return;
    }
  }
  previous = time;
  frame = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (running) return pause();
  if (!script.textContent.trim()) return;
  if (reader.scrollTop >= reader.scrollHeight - reader.clientHeight - 1) reader.scrollTop = 0;
  position = reader.scrollTop;
  running = true;
  script.contentEditable = 'false';
  play.textContent = 'Pausar';
  status.textContent = 'Em leitura';
  frame = requestAnimationFrame(tick);
});
document.querySelector('#reset').addEventListener('click', () => {
  pause('Pronto para ler');
  reader.scrollTop = 0;
  position = 0;
});
speed.addEventListener('input', () => document.querySelector('#speedValue').textContent = speed.value);
size.addEventListener('input', () => {
  document.querySelector('#sizeValue').textContent = size.value;
  script.style.fontSize = size.value + 'px';
  position = reader.scrollTop;
});
reader.addEventListener('wheel', () => { if (running) pause(); }, {passive:true});
reader.addEventListener('touchstart', () => { if (running) pause(); }, {passive:true});
document.addEventListener('visibilitychange', () => { if (document.hidden && running) pause(); });

const editor = document.querySelector('#editor');
const editorPanel = document.querySelector('#editorPanel');
const fileInput = document.querySelector('#file');
editor.value = script.textContent;
function renderText(text) {
  pause('Pronto para ler');
  script.replaceChildren();
  const pattern = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    script.append(document.createTextNode(text.slice(cursor, match.index)));
    const emphasis = document.createElement('strong');
    emphasis.textContent = match[1];
    script.append(emphasis);
    cursor = match.index + match[0].length;
  }
  script.append(document.createTextNode(text.slice(cursor)));
  reader.scrollTop = 0;
  position = 0;
  play.disabled = !script.textContent.trim();
  if (play.disabled) status.textContent = 'Insira seu texto';
}
document.querySelector('#edit').addEventListener('click', () => {
  pause();
  editorPanel.hidden = !editorPanel.hidden;
  if (!editorPanel.hidden) editor.focus();
});
document.querySelector('#apply').addEventListener('click', () => {
  renderText(editor.value);
  editorPanel.hidden = true;
});
document.querySelector('#open').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  pause();
  try {
    editor.value = await file.text();
    renderText(editor.value);
    editorPanel.hidden = true;
  } catch {
    status.textContent = 'Não foi possível abrir o arquivo. Tente novamente.';
  }
  fileInput.value = '';
});
renderText(editor.value);
