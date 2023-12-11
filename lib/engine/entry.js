import { execute } from "./engine.js";
import { ProcessMarkdown } from "./mark.js";
import { performAction } from "./actions.js";



function strComp(a, b) {
    a = a.toLocaleLowerCase();
    b = b.toLocaleLowerCase();
    const z = a.replace(/\s/g, "");
    const x = b.replace(/\s/g, "");
    return z === x;    
}


function showEntryForm(page, story, showEntry) {
    const out = document.querySelector("#out");
    const form = document.createElement('form');
    const submitBox = document.createElement('input');
    submitBox.type = 'text';
    form.className = 'entry-form';
    submitBox.className = 'submit-box';
    submitBox.autofocus = true;
    submitBox.placeholder = showEntry.prompt ?? '';
    form.onsubmit = (e) => {
        e.preventDefault();
        const value = submitBox.value.trim();
        const tokens = showEntry.tokens;
        const entryCatch = showEntry.entryCatch;
        if (showEntry.into) {
            const into = showEntry.into;
            story.gameInfo[into] = value;    
        }
        if (tokens) {
            for (const token in tokens) {
                if (strComp(token, value)) {
                    performAction(tokens[token], page, story)
                    return;
                }
            }
        }
        if (entryCatch) {
            performAction(entryCatch, page, story);
        }
    }
    form.appendChild(submitBox);
    out.appendChild(form);
    setTimeout(() => {
        submitBox.focus();
    }, 50);
}


export function handleEntry(page, story) {

    const entry = page.entry;
    const into = entry.to ?? undefined;
    const tokens = entry.tokens ?? undefined;
    const entryCatch = entry.catch ?? undefined;
    if (into || tokens) {
        const prompt = entry.prompt ?? '';
        const showEntry = {
            into,
            prompt,
            tokens,
            entryCatch
        };
        showEntryForm(page, story, showEntry);
    }

}

