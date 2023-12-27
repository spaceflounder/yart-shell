import { ProcessMarkdown } from "./mark.js";
import { execute, navigate, MergeRecursive, handleTemplates, setPageName, refreshPage } from "./engine.js";
import { SmartyPants } from "./smartypants.js";


function appendCloseButton(collapse) {
    const buttons = document.querySelector("#btns");
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="material-symbols-outlined iconSize">cancel</span>&emsp;Cancel`;
    btn.className = 'wideButton';
    btn.onclick = () => collapse();
    btn.alt = 'cancel';
    buttons.appendChild(btn);
}


export function performAction(obj, page, story, collapse) {

    const buttons = document.querySelector("#btns");
    const [content, go, set] = [obj.content, obj.go, obj.set];
    buttons.innerHTML = '';
    const nav = go;
    if (nav && story[nav]) {
        if (content) {
            appendBufferText(content, page);
        }
        const newRoom = story[nav];
        story.gameInfo['previous page'] = page['file name'];
        setPageName(nav);
        navigate(newRoom);
    } else {
        refreshPage(true);
        execute(obj);
    }
    if (set) {
        MergeRecursive(story, set);
    }
    collapse();

}


export function showActions(actions, page, story, collapse) {

    const buttons = document.querySelector("#btns");
    buttons.innerHTML = '';
    for (const action of actions) {
        const btn = document.createElement('button');
        let text = handleTemplates(action.text, page);
        text = SmartyPants(text);
        text = ProcessMarkdown(text);
        btn.innerHTML = text;
        btn.className = 'wideButton';
        btn.onclick = () => performAction(action, page, story, collapse);
        btn.alt = action.text;
        buttons.appendChild(btn);
    }
    appendCloseButton(collapse);

}
