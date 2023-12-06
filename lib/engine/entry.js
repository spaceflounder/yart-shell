import { execute } from "./engine.js";
import { ProcessMarkdown } from "./mark.js";
import { performAction } from "./actions.js";


let showEntry = undefined;


function strComp(a, b) {
    a = a.toLocaleLowerCase();
    b = b.toLocaleLowerCase();
    const z = a.replace(/\s/g, "");
    const x = b.replace(/\s/g, "");
    return z === x;    
}


function showEntryForm(page, story) {
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
        const error = showEntry.error;
        if (showEntry.into) {
            const address = showEntry.into;
            story[address] = submitBox.value;    
        }
        if (tokens) {
            for (const token in tokens) {
                if (strComp(token, value)) {
                    performAction(tokens[token], page, story)
                    return;
                }
            }
        }
        if (error) {
            execute(error);
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
    let into = entry.to ?? undefined;
    const tokens = entry.tokens;
    const error = entry.error;
    if (into || tokens) {
        if (into?.indexOf('.') === -1) {
            const name = page["file name"];
            if (name) {
                into = name + '.' + into;
            }
        }
        const prompt = entry.prompt ?? '';
        showEntry = {
            into,
            prompt,
            tokens,
            error
        };    
    }
    if (showEntry) {
        showEntryForm(page, story);
    }
    showEntry = undefined;

}

