import Prism from 'prismjs';
import './source-highlight.css';

Prism.manual = true;

export function highlightSource(element, language) {
    const source = element.textContent;
    element.classList.add('lab-source-code');
    element.innerHTML = Prism.highlight(source, Prism.languages[language], language);
}

for (const element of document.querySelectorAll('.example-source code[data-language]'))
    highlightSource(element, element.dataset.language);
