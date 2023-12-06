

export function initializeAchievements(story) {

    let totalScore = 0;
    if (!story.achievements) {
        story.achievements = {};
    }
    for (const achievement in story.achievements) {
        const a = {...story.achievements[achievement]} ?? {};
        const score = a?.score ?? 0;
        totalScore += score;
        story.achievements[achievement]['awarded'] = false;
    }
    story.achievements.total = totalScore;
    story.achievements.score = 0;

}


export function handleAward(award, story, appendAchievementText) {

    if (story.achievements) {
        if (!story['achievements'][award]['awarded']) {
            story['achievements'][award]['awarded'] = true;
            const score = story['achievements'][award]?.score ?? 0;
            const content = story['achievements'][award]?.content ?? '';
            if (!story['achievements'].score) {
                story['achievements'].score = score;
            } else {
                story['achievements'].score += score;
            }
            if (content !== '') {
                appendAchievementText(`:::aside\n${content}\n:::`);
            }
        }        
    }

}


