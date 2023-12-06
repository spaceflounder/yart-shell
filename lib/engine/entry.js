import { ProcessMarkdown } from "./mark.js";


let showEntry = undefined;


function showEntryForm(story) {
    const out = document.querySelector("#out");
    const form = document.createElement('form');
    const submitBox = document.createElement('input');
    const textBox = document.createElement('div');
    submitBox.type = 'text';
    form.className = 'entry-form';
    submitBox.className = 'submit-box';
    textBox.className = 'form-text-box';
    textBox.innerHTML = ProcessMarkdown(showEntry.prompt);
    form.onsubmit = (e) => {
        e.preventDefault();
        const address = showEntry.into;
        story[address] = submitBox.value;
    }
    form.appendChild(submitBox);
    out.appendChild(form);
}


export function handleEntry(page, story) {

    const entry = page.entry;
    let into = entry.to ?? undefined;
    if (into) {
        if (into.indexOf('.') === -1) {
            const name = page["file name"];
            if (name) {
                into = name + '.' + into;
                entryAddress = into;    
            }
        }
        showEntry = {
            into,
            prompt: entry.prompt ?? ''
        };    
    }
    if (showEntry) {
        showEntryForm(story);
    }

}

